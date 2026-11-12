package handler

import (
	"testing"

	"webgames_golang/store"
)

func TestValidateCouponHandlesMissingFields(t *testing.T) {
	code, _ := validateCoupon(&store.CouponInput{})
	if code != "BAD_GAME_NAME" {
		t.Fatalf("expected missing game name error, got %q", code)
	}
}

func TestValidateCouponDefaultsMissingDescription(t *testing.T) {
	gameName := "ROV"
	title := "500 points"
	price := 99.0
	maxPerUser := 1
	input := store.CouponInput{
		GameName:   &gameName,
		Title:      &title,
		Price:      &price,
		MaxPerUser: &maxPerUser,
	}

	if code, message := validateCoupon(&input); code != "" {
		t.Fatalf("unexpected validation error %q: %s", code, message)
	}
	if input.Description == nil || *input.Description != "---" {
		t.Fatalf("expected default description, got %v", input.Description)
	}
}
