package handler

import "testing"

func TestValidPasswordMatchesRegistrationForm(t *testing.T) {
	tests := []struct {
		password string
		valid    bool
	}{
		{"Strong!Pass123", true},
		{"short!A1", true},
		{"lowercase!123", false},
		{"UPPERCASE!123", false},
		{"NoDigits!Here", false},
		{"NoSpecial123", false},
		{"Short!1", false},
		{"Strong!Pass123" + string(make([]byte, 60)), false},
	}
	for _, tt := range tests {
		if got := validPassword(tt.password); got != tt.valid {
			t.Errorf("validPassword(%q) = %v, want %v", tt.password, got, tt.valid)
		}
	}
}
