package handlers

import (
	"net/http"
	"strings"

	"pos-backend/config"
	"pos-backend/models"
	"pos-backend/utils"

	"github.com/gin-gonic/gin"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// 1. Cek dari HttpOnly Cookie
		if cookie, err := c.Cookie("pos_jwt_token"); err == nil && cookie != "" {
			tokenString = cookie
		}

		// 2. Fallback dari header Authorization: Bearer
		if tokenString == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Sesi tidak ditemukan, silakan login kembali",
			})
			return
		}

		// 3. Validasi JWT Claims
		claims, err := utils.ValidateJWTToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Token tidak valid atau telah kedaluwarsa",
			})
			return
		}

		// 4. Device Binding Check: User-Agent Hash
		currentDevHash := utils.GenerateDeviceHash(c.Request.UserAgent())
		if claims.DeviceHash != currentDevHash {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Sesi tidak valid untuk perangkat/browser ini",
			})
			return
		}

		// 5. Cek token_version di DB
		var emp models.Employee
		if err := config.DB.Select("id, is_active, token_version").First(&emp, "id = ?", claims.EmployeeID).Error; err != nil || !emp.IsActive {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Akun dinonaktifkan atau tidak ditemukan",
			})
			return
		}

		tokenVer := emp.TokenVersion
		if tokenVer == 0 {
			tokenVer = 1
		}
		if tokenVer != claims.TokenVersion {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Sesi telah dicabut/diperbarui, silakan login ulang",
			})
			return
		}

		c.Set("currentUserID", claims.EmployeeID)
		c.Set("currentUsername", claims.Username)
		c.Set("currentRoleID", claims.RoleID)

		c.Next()
	}
}
