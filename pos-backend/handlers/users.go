package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"pos-backend/config"
	"pos-backend/models"
	"pos-backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ==========================================
// ROLE HANDLERS
// ==========================================

func GetRoles(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	var roles []models.Role
	config.DB.Order("created_at asc").Find(&roles)
	c.JSON(http.StatusOK, gin.H{"success": true, "roles": roles})
}

func CreateRole(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var input struct {
		Name        string          `json:"name"`
		Description string          `json:"description"`
		Permissions json.RawMessage `json:"permissions"`
		Actor       string          `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	newRole := models.Role{
		ID:          fmt.Sprintf("role-%d", time.Now().Unix()),
		Name:        input.Name,
		Description: input.Description,
		IsSystem:    false,
		Permissions: string(input.Permissions),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := config.DB.Create(&newRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal membuat role: " + err.Error()})
		return
	}

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}

	newSnap, _ := json.Marshal(map[string]interface{}{
		"name":        newRole.Name,
		"description": newRole.Description,
		"permissions": input.Permissions,
	})

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "CREATE_ROLE",
		User:      actor,
		Details:   fmt.Sprintf("Membuat role baru: \"%s\"", newRole.Name),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Role berhasil dibuat",
		"role":    newRole,
	})
}

func UpdateRole(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	roleID := c.Param("id")
	var role models.Role
	if err := config.DB.First(&role, "id = ?", roleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Role tidak ditemukan"})
		return
	}

	var input struct {
		Name        string          `json:"name"`
		Description string          `json:"description"`
		Permissions json.RawMessage `json:"permissions"`
		Actor       string          `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	role.Name = input.Name
	role.Description = input.Description
	if len(input.Permissions) > 0 {
		role.Permissions = string(input.Permissions)
	}
	role.UpdatedAt = time.Now()

	config.DB.Save(&role)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Role berhasil diperbarui", "role": role})
}

func UpdateRolePermissions(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	roleID := c.Param("id")
	var role models.Role
	if err := config.DB.First(&role, "id = ?", roleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Role tidak ditemukan"})
		return
	}

	var input struct {
		Permissions json.RawMessage `json:"permissions"`
		Actor       string          `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	role.Permissions = string(input.Permissions)
	role.UpdatedAt = time.Now()
	config.DB.Save(&role)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Hak akses role berhasil diperbarui", "role": role})
}

// ==========================================
// EMPLOYEE HANDLERS
// ==========================================

func GetEmployees(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var employees []models.Employee
	config.DB.Order("created_at asc").Find(&employees)

	// Sensor PIN
	for i := range employees {
		employees[i].Pin = "••••"
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "employees": employees})
}

func CreateEmployee(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var input struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Pin      string `json:"pin"`
		RoleID   string `json:"role_id"`
		Actor    string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Cek duplikasi username
	var existing models.Employee
	if err := config.DB.Where("username = ?", strings.TrimSpace(input.Username)).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Username sudah digunakan oleh karyawan lain"})
		return
	}

	hashedPin, err := bcrypt.GenerateFromPassword([]byte(input.Pin), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal mengenkripsi PIN"})
		return
	}

	newEmp := models.Employee{
		ID:           fmt.Sprintf("emp-%d", time.Now().Unix()),
		Name:         input.Name,
		Username:     strings.TrimSpace(input.Username),
		Pin:          string(hashedPin),
		RoleID:       input.RoleID,
		IsActive:     true,
		TokenVersion: 1,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := config.DB.Create(&newEmp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menambahkan karyawan: " + err.Error()})
		return
	}

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "CREATE_EMPLOYEE",
		User:      actor,
		Details:   fmt.Sprintf("Staf \"%s\" berhasil didaftarkan.", newEmp.Name),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	newEmp.Pin = "••••"
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Karyawan berhasil ditambahkan", "employee": newEmp})
}

func UpdateEmployee(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	empID := c.Param("id")
	var emp models.Employee
	if err := config.DB.First(&emp, "id = ?", empID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Karyawan tidak ditemukan"})
		return
	}

	var input struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Pin      string `json:"pin"`
		RoleID   string `json:"role_id"`
		Actor    string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	emp.Name = input.Name
	emp.Username = strings.TrimSpace(input.Username)
	emp.RoleID = input.RoleID
	emp.UpdatedAt = time.Now()

	// Jika PIN diperbarui, hash ulang dan naikkan token_version agar sesi lama putus
	if strings.TrimSpace(input.Pin) != "" && input.Pin != "••••" {
		hashedPin, err := bcrypt.GenerateFromPassword([]byte(input.Pin), bcrypt.DefaultCost)
		if err == nil {
			emp.Pin = string(hashedPin)
			emp.TokenVersion += 1
		}
	}

	config.DB.Save(&emp)

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "UPDATE_EMPLOYEE",
		User:      actor,
		Details:   fmt.Sprintf("Data staf \"%s\" berhasil diperbarui.", emp.Name),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "Data staf berhasil diperbarui",
		"employee": emp,
	})
}

func ToggleEmployeeStatus(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	empID := c.Param("id")
	var emp models.Employee
	if err := config.DB.First(&emp, "id = ?", empID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Karyawan tidak ditemukan"})
		return
	}

	emp.IsActive = !emp.IsActive
	emp.UpdatedAt = time.Now()
	if !emp.IsActive {
		// Putuskan sesi jika dinonaktifkan
		emp.TokenVersion += 1
	}
	config.DB.Save(&emp)

	statusStr := "diaktifkan"
	if !emp.IsActive {
		statusStr = "dinonaktifkan"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "TOGGLE_STATUS",
		User:      "Owner / Administrator",
		Details:   fmt.Sprintf("Akun staf \"%s\" telah %s.", emp.Name, statusStr),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  fmt.Sprintf("Status karyawan berhasil %s", statusStr),
		"employee": emp,
	})
}

// ==========================================
// AUTH & JWT SESSION HANDLERS
// ==========================================

const authPayloadSecret = "POS_AUTH_SECRET_NONCE_HANDSHAKE_2026"

func decryptAuthPayload(cipherText string) (string, string, error) {
	decoded, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil {
		return "", "", fmt.Errorf("invalid base64: %v", err)
	}

	key := []byte(authPayloadSecret)
	keyLen := len(key)
	xored := make([]byte, len(decoded))
	for i := 0; i < len(decoded); i++ {
		xored[i] = decoded[i] ^ key[i%keyLen]
	}

	var payload struct {
		Username  string `json:"username"`
		Pin       string `json:"pin"`
		Timestamp int64  `json:"ts"`
		Nonce     string `json:"nonce"`
	}

	if err := json.Unmarshal(xored, &payload); err != nil {
		return "", "", fmt.Errorf("json unmarshal failed: %v", err)
	}

	now := time.Now().Unix()
	if math.Abs(float64(now-payload.Timestamp)) > 180 {
		return "", "", fmt.Errorf("payload expired")
	}

	return strings.TrimSpace(payload.Username), strings.TrimSpace(payload.Pin), nil
}

// POST /api/v1/auth/login
func AuthLogin(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var rawInput struct {
		EncryptedPayload string `json:"encrypted_payload"`
		Username         string `json:"username"`
		Pin              string `json:"pin"`
	}

	if err := c.ShouldBindJSON(&rawInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Data login tidak valid"})
		return
	}

	var username, pin string
	if rawInput.EncryptedPayload != "" {
		decUsername, decPin, err := decryptAuthPayload(rawInput.EncryptedPayload)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Gagal mendekripsi autentikasi: " + err.Error()})
			return
		}
		username = decUsername
		pin = decPin
	} else {
		username = rawInput.Username
		pin = rawInput.Pin
	}

	if strings.TrimSpace(username) == "" || strings.TrimSpace(pin) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Username dan PIN wajib diisi"})
		return
	}

	var emp models.Employee
	if err := config.DB.Where("username = ?", username).First(&emp).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Username atau PIN salah!"})
		return
	}

	if !emp.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Akun karyawan ini sedang dinonaktifkan."})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(emp.Pin), []byte(pin))
	if err != nil {
		if emp.Pin == pin {
			newHashed, hashErr := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
			if hashErr == nil {
				emp.Pin = string(newHashed)
				config.DB.Model(&emp).Update("pin", emp.Pin)
			}
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Username atau PIN salah!"})
			return
		}
	}

	var role models.Role
	config.DB.First(&role, "id = ?", emp.RoleID)

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "LOGIN",
		User:      emp.Name,
		Details:   fmt.Sprintf("Staf \"%s\" berhasil login ke terminal.", emp.Name),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	tokenVer := emp.TokenVersion
	if tokenVer == 0 {
		tokenVer = 1
	}

	// Terbitkan JWT Token yang terikat dengan device hash & token_version
	tokenString, tokenErr := utils.GenerateJWTToken(emp.ID, emp.Username, emp.RoleID, tokenVer, c.Request.UserAgent())
	if tokenErr == nil {
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("pos_jwt_token", tokenString, 43200, "/", "", false, true)
	}

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"employee": emp,
		"role":     role,
	})
}

// GET /api/v1/auth/me - Verifikasi sesi aktif via HttpOnly Cookie
func AuthMe(c *gin.Context) {
	cookie, err := c.Cookie("pos_jwt_token")
	if err != nil || cookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Sesi tidak ditemukan"})
		return
	}

	claims, err := utils.ValidateJWTToken(cookie)
	if err != nil {
		c.SetCookie("pos_jwt_token", "", -1, "/", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Token expired atau tidak valid"})
		return
	}

	// Device binding check
	if claims.DeviceHash != utils.GenerateDeviceHash(c.Request.UserAgent()) {
		c.SetCookie("pos_jwt_token", "", -1, "/", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Browser atau device tidak cocok"})
		return
	}

	var emp models.Employee
	if err := config.DB.First(&emp, "id = ?", claims.EmployeeID).Error; err != nil || !emp.IsActive {
		c.SetCookie("pos_jwt_token", "", -1, "/", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Akun tidak aktif atau tidak ditemukan"})
		return
	}

	tokenVer := emp.TokenVersion
	if tokenVer == 0 {
		tokenVer = 1
	}
	if tokenVer != claims.TokenVersion {
		c.SetCookie("pos_jwt_token", "", -1, "/", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Sesi telah di-revoke"})
		return
	}

	var role models.Role
	config.DB.First(&role, "id = ?", emp.RoleID)

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"employee": emp,
		"role":     role,
	})
}

// POST /api/v1/auth/logout - Menghapus cookie JWT
func AuthLogout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("pos_jwt_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Berhasil logout"})
}
