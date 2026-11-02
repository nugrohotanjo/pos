package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecretKey = []byte(getEnv("JWT_SECRET", "POS_SUPER_SECRET_JWT_KEY_CHANGEME_2026"))

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

type CustomClaims struct {
	EmployeeID   string `json:"emp_id"`
	Username     string `json:"username"`
	RoleID       string `json:"role_id"`
	TokenVersion int    `json:"token_ver"`
	DeviceHash   string `json:"dev_hash"`
	jwt.RegisteredClaims
}

// GenerateDeviceHash membuat hash fingerprint dari User-Agent browser
func GenerateDeviceHash(userAgent string) string {
	h := sha256.New()
	h.Write([]byte(userAgent))
	return hex.EncodeToString(h.Sum(nil))[:16]
}

// GenerateJWTToken membuat token dengan masa berlaku 12 jam (1 shift kasir)
func GenerateJWTToken(empID string, username, roleID string, tokenVersion int, userAgent string) (string, error) {
	claims := CustomClaims{
		EmployeeID:   empID,
		Username:     username,
		RoleID:       roleID,
		TokenVersion: tokenVersion,
		DeviceHash:   GenerateDeviceHash(userAgent),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "serba35k-pos",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecretKey)
}

// ValidateJWTToken memverifikasi signature dan integritas token
func ValidateJWTToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
