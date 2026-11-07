package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestAPIAllRoutes(t *testing.T) {
	baseURL := strings.TrimRight(os.Getenv("API_BASE_URL"), "/")
	adminToken := strings.TrimPrefix(os.Getenv("API_ADMIN_TOKEN"), "Bearer ")
	if baseURL == "" || adminToken == "" {
		t.Skip("set API_BASE_URL and API_ADMIN_TOKEN to run API integration tests")
	}

	client := &http.Client{Timeout: 10 * time.Second}
	status, body := apiCall(t, client, baseURL, http.MethodGet, "/api/users/me", "", nil)
	requireStatus(t, status, http.StatusUnauthorized, body)
	status, body = apiCall(t, client, baseURL, http.MethodGet, "/api/admin/stats", "", nil)
	requireStatus(t, status, http.StatusUnauthorized, body)

	suffix := strconv.FormatInt(time.Now().UnixNano(), 36)
	email := "api-test-" + suffix + "@example.test"
	username := "ApiTest" + suffix
	password := "ApiTest-password-123"

	// Register a dedicated account; the API currently has no account-delete route.
	status, body = apiCall(t, client, baseURL, http.MethodPost, "/api/auth/register", "", map[string]string{
		"username": username,
		"email":    email,
		"password": password,
	})
	requireStatus(t, status, http.StatusCreated, body)

	var registered struct {
		ID int64 `json:"id"`
	}
	if err := json.Unmarshal(body, &registered); err != nil {
		t.Fatalf("decode registration response: %v", err)
	}
	if registered.ID <= 0 {
		t.Fatalf("registration returned invalid user id: %d", registered.ID)
	}
	t.Logf("registered test account %s (id %d); remove it manually if desired", email, registered.ID)

	status, body = apiCall(t, client, baseURL, http.MethodPost, "/api/auth/login", "", map[string]string{
		"email":    email,
		"password": password,
	})
	requireStatus(t, status, http.StatusOK, body)
	var login struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(body, &login); err != nil {
		t.Fatalf("decode login response: %v", err)
	}
	if login.Token == "" {
		t.Fatal("login response has no token")
	}

	status, body = apiCall(t, client, baseURL, http.MethodGet, "/api/users/me", login.Token, nil)
	requireStatus(t, status, http.StatusOK, body)

	status, body = apiCall(t, client, baseURL, http.MethodGet, "/api/coupons", "", nil)
	requireStatus(t, status, http.StatusOK, body)
	status, body = apiCall(t, client, baseURL, http.MethodGet, "/api/coupons/search?q=api", "", nil)
	requireStatus(t, status, http.StatusOK, body)
	status, body = apiCall(t, client, baseURL, http.MethodGet, "/api/users/me/orders", login.Token, nil)
	requireStatus(t, status, http.StatusOK, body)

	for _, path := range []string{
		"/api/admin/stats",
		"/api/admin/users",
		"/api/admin/orders",
	} {
		status, body = apiCall(t, client, baseURL, http.MethodGet, path, adminToken, nil)
		requireStatus(t, status, http.StatusOK, body)
	}

	status, body = apiCall(t, client, baseURL, http.MethodPut,
		fmt.Sprintf("/api/admin/users/%d/role", registered.ID), adminToken,
		map[string]string{"role": "not-a-role"})
	requireStatus(t, status, http.StatusBadRequest, body)

	gameName := "API Test " + suffix
	title := "API Test Coupon " + suffix
	coupon := map[string]any{
		"game_name":    gameName,
		"title":        title,
		"description":  "Temporary coupon created by the Go API integration test",
		"price":        1.25,
		"max_per_user": 1,
	}
	status, body = apiCall(t, client, baseURL, http.MethodPost, "/api/admin/coupons", adminToken, coupon)
	requireStatus(t, status, http.StatusCreated, body)

	couponID, err := findCouponID(client, baseURL, title)
	if err != nil {
		t.Fatalf("find created test coupon: %v", err)
	}
	defer func() {
		if couponID == 0 {
			return
		}
		status, body := apiCall(t, client, baseURL, http.MethodDelete,
			fmt.Sprintf("/api/admin/coupons/%d", couponID), adminToken, nil)
		if status != http.StatusNoContent {
			t.Errorf("cleanup test coupon: status %d, response %s", status, body)
		}
	}()

	status, body = apiCall(t, client, baseURL, http.MethodGet,
		"/api/coupons/search?q="+url.QueryEscape(title), "", nil)
	requireStatus(t, status, http.StatusOK, body)

	status, body = apiCall(t, client, baseURL, http.MethodGet,
		fmt.Sprintf("/api/coupons/%d", couponID), "", nil)
	requireStatus(t, status, http.StatusOK, body)

	// The test package has no coupon codes, so this exercises the no-stock response
	// without purchasing or consuming a real customer's coupon.
	status, body = apiCall(t, client, baseURL, http.MethodPost,
		fmt.Sprintf("/api/coupons/%d/buy", couponID), login.Token, nil)
	requireStatus(t, status, http.StatusNotFound, body)

	status, body = apiCall(t, client, baseURL, http.MethodGet,
		fmt.Sprintf("/api/admin/coupons/%d", couponID), adminToken, nil)
	requireStatus(t, status, http.StatusOK, body)

	status, body = apiCall(t, client, baseURL, http.MethodPut,
		fmt.Sprintf("/api/admin/users/%d/role", registered.ID), adminToken,
		map[string]string{"role": "customer"})
	requireStatus(t, status, http.StatusOK, body)

	coupon["title"] = title + " Updated"
	status, body = apiCall(t, client, baseURL, http.MethodPut,
		fmt.Sprintf("/api/admin/coupons/%d", couponID), adminToken, coupon)
	requireStatus(t, status, http.StatusOK, body)

	status, body = apiCall(t, client, baseURL, http.MethodDelete,
		fmt.Sprintf("/api/admin/coupons/%d", couponID), adminToken, nil)
	requireStatus(t, status, http.StatusNoContent, body)
	couponID = 0
}

func apiCall(t *testing.T, client *http.Client, baseURL, method, path, token string, payload any) (int, []byte) {
	t.Helper()

	var requestBody io.Reader
	if payload != nil {
		encoded, err := json.Marshal(payload)
		if err != nil {
			t.Fatalf("encode request body: %v", err)
		}
		requestBody = bytes.NewReader(encoded)
	}

	req, err := http.NewRequest(method, baseURL+path, requestBody)
	if err != nil {
		t.Fatalf("create %s request for %s: %v", method, path, err)
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+strings.TrimPrefix(token, "Bearer "))
	}

	res, err := client.Do(req)
	if err != nil {
		t.Fatalf("%s %s: %v", method, path, err)
	}
	defer res.Body.Close()
	responseBody, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("read %s %s response: %v", method, path, err)
	}
	return res.StatusCode, responseBody
}

func findCouponID(client *http.Client, baseURL, title string) (int64, error) {
	req, err := http.NewRequest(http.MethodGet, baseURL+"/api/coupons", nil)
	if err != nil {
		return 0, err
	}
	res, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer res.Body.Close()

	var response struct {
		Items []struct {
			PackageID int64  `json:"package_id"`
			Title     string `json:"title"`
		} `json:"items"`
	}
	if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
		return 0, err
	}
	if res.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("GET /api/coupons returned status %d", res.StatusCode)
	}
	for _, item := range response.Items {
		if item.Title == title {
			return item.PackageID, nil
		}
	}
	return 0, fmt.Errorf("coupon %q was not returned by GET /api/coupons", title)
}

func requireStatus(t *testing.T, got, want int, body []byte) {
	t.Helper()
	if got != want {
		t.Fatalf("unexpected HTTP status: got %d, want %d; response: %s", got, want, body)
	}
}
