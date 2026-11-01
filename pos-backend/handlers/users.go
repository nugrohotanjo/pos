package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GET /api/v1/roles
func GetRoles(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var roles []models.Role
	if err := config.DB.Order("is_system desc, name asc").Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": roles})
}

// POST /api/v1/roles
func CreateRole(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var input struct {
		Name        string   `json:"name" binding:"required"`
		Description string   `json:"description"`
		Permissions []string `json:"permissions"`
		Actor       string   `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	permBytes, _ := json.Marshal(input.Permissions)
	newRole := models.Role{
		ID:          fmt.Sprintf("role-%d", time.Now().Unix()),
		Name:        input.Name,
		Description: input.Description,
		IsSystem:    false,
		Permissions: string(permBytes),
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

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": newRole})
}

// PUT /api/v1/roles/:id
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
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Actor       string `json:"actor"`
		ActorRole   string `json:"actor_role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if input.ActorRole != "role-owner" {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Akses Ditolak: Hanya Owner yang berhak mengubah role!"})
		return
	}

	// Snapshot Sebelum Perubahan
	oldSnap, _ := json.Marshal(map[string]interface{}{
		"name":        role.Name,
		"description": role.Description,
	})

	role.Name = input.Name
	role.Description = input.Description
	role.UpdatedAt = time.Now()

	if err := config.DB.Save(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal update role: " + err.Error()})
		return
	}

	// Snapshot Sesudah Perubahan
	newSnap, _ := json.Marshal(map[string]interface{}{
		"name":        role.Name,
		"description": role.Description,
	})

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}
	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "UPDATE_ROLE",
		User:      actor,
		Details:   fmt.Sprintf("Memperbarui nama/deskripsi role ID: %s", role.ID),
		OldValues: string(oldSnap),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "data": role})
}

// PUT /api/v1/roles/:id/permissions
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
		Permissions []string `json:"permissions"`
		Actor       string   `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var oldPerms []string
	_ = json.Unmarshal([]byte(role.Permissions), &oldPerms)

	oldSnap, _ := json.Marshal(map[string]interface{}{
		"permissions": oldPerms,
	})

	permBytes, _ := json.Marshal(input.Permissions)
	role.Permissions = string(permBytes)
	role.UpdatedAt = time.Now()

	if err := config.DB.Save(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal update permission: " + err.Error()})
		return
	}

	newSnap, _ := json.Marshal(map[string]interface{}{
		"permissions": input.Permissions,
	})

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}
	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "UPDATE_PERMISSIONS",
		User:      actor,
		Details:   fmt.Sprintf("Memperbarui izin role \"%s\"", role.Name),
		OldValues: string(oldSnap),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "data": role})
}

// GET /api/v1/employees
func GetEmployees(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var employees []models.Employee
	if err := config.DB.Select("id, name, username, '••••' as pin, role_id, phone, is_active, created_at, updated_at").Order("created_at asc").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": employees})
}

// POST /api/v1/employees
func CreateEmployee(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var input struct {
		Name     string `json:"name" binding:"required"`
		Username string `json:"username" binding:"required"`
		Pin      string `json:"pin" binding:"required"`
		RoleID   string `json:"role_id" binding:"required"`
		Phone    string `json:"phone"`
		Actor    string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var existing models.Employee
	if err := config.DB.Where("username = ?", input.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Username sudah digunakan!"})
		return
	}

	hashedPin, err := bcrypt.GenerateFromPassword([]byte(input.Pin), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal mengamankan PIN"})
		return
	}

	newEmp := models.Employee{
		ID:        fmt.Sprintf("emp-%d", time.Now().Unix()),
		Name:      input.Name,
		Username:  input.Username,
		Pin:       string(hashedPin),
		RoleID:    input.RoleID,
		Phone:     input.Phone,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := config.DB.Create(&newEmp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menambah karyawan: " + err.Error()})
		return
	}

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}

	newSnap, _ := json.Marshal(map[string]interface{}{
		"name":      newEmp.Name,
		"username":  newEmp.Username,
		"role_id":   newEmp.RoleID,
		"phone":     newEmp.Phone,
		"is_active": newEmp.IsActive,
		"pin":       "•••• (Bcrypt Salted)",
	})

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "CREATE_EMPLOYEE",
		User:      actor,
		Details:   fmt.Sprintf("Mendaftarkan staf baru \"%s\" (@%s)", newEmp.Name, newEmp.Username),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	newEmp.Pin = "••••"
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": newEmp})
}

// PUT /api/v1/employees/:id
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
		Name      string `json:"name" binding:"required"`
		Username  string `json:"username" binding:"required"`
		Pin       string `json:"pin"`
		RoleID    string `json:"role_id" binding:"required"`
		Phone     string `json:"phone"`
		Actor     string `json:"actor"`
		ActorRole string `json:"actor_role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if input.ActorRole != "role-owner" {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Akses Ditolak: Hanya Pemilik Toko (Owner) yang berhak mengubah data staf & PIN!"})
		return
	}

	var duplicate models.Employee
	if err := config.DB.Where("username = ? AND id != ?", input.Username, empID).First(&duplicate).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Username sudah dipakai oleh karyawan lain!"})
		return
	}

	// 1. Snapshot Sebelum Perubahan (Before)
	oldDataMap := map[string]interface{}{
		"name":     emp.Name,
		"username": emp.Username,
		"role_id":  emp.RoleID,
		"phone":    emp.Phone,
		"pin":      "•••• (Tidak Berubah)",
	}

	// 2. Terapkan Nilai Baru
	emp.Name = input.Name
	emp.Username = input.Username
	emp.RoleID = input.RoleID
	emp.Phone = input.Phone

	newDataMap := map[string]interface{}{
		"name":     emp.Name,
		"username": emp.Username,
		"role_id":  emp.RoleID,
		"phone":    emp.Phone,
		"pin":      "•••• (Tidak Berubah)",
	}

	detailsMsg := fmt.Sprintf("Memperbarui data staf \"%s\" (@%s)", emp.Name, emp.Username)

	if input.Pin != "" {
		hashedPin, err := bcrypt.GenerateFromPassword([]byte(input.Pin), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal mengenkripsi PIN"})
			return
		}
		emp.Pin = string(hashedPin)
		detailsMsg += " beserta PIN kasir baru"
		newDataMap["pin"] = "Diperbarui (Hash Salted)"
	}

	emp.UpdatedAt = time.Now()
	if err := config.DB.Save(&emp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menyimpan perubahan karyawan: " + err.Error()})
		return
	}

	oldSnapBytes, _ := json.Marshal(oldDataMap)
	newSnapBytes, _ := json.Marshal(newDataMap)

	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}
	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "UPDATE_EMPLOYEE",
		User:      actor,
		Details:   detailsMsg,
		OldValues: string(oldSnapBytes),
		NewValues: string(newSnapBytes),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{"success": true, "data": emp})
}

// PATCH /api/v1/employees/:id/toggle-status
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

	oldStatus := emp.IsActive
	emp.IsActive = !emp.IsActive
	emp.UpdatedAt = time.Now()
	config.DB.Save(&emp)

	oldSnap, _ := json.Marshal(map[string]interface{}{"is_active": oldStatus})
	newSnap, _ := json.Marshal(map[string]interface{}{"is_active": emp.IsActive})

	actor := c.DefaultQuery("actor", "Owner / Administrator")
	statusText := "NONAKTIF"
	if emp.IsActive {
		statusText = "AKTIF"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "USERS_ROLES",
		Action:    "TOGGLE_EMPLOYEE",
		User:      actor,
		Details:   fmt.Sprintf("Ubah status staf \"%s\" menjadi %s", emp.Name, statusText),
		OldValues: string(oldSnap),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{"success": true, "data": emp})
}

// POST /api/v1/auth/login
func AuthLogin(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var input struct {
		Username string `json:"username" binding:"required"`
		Pin      string `json:"pin" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Username dan PIN wajib diisi"})
		return
	}

	var emp models.Employee
	if err := config.DB.Where("username = ?", input.Username).First(&emp).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Username atau PIN salah!"})
		return
	}

	if !emp.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Akun karyawan ini sedang dinonaktifkan."})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(emp.Pin), []byte(input.Pin))
	if err != nil {
		if emp.Pin == input.Pin {
			newHashed, hashErr := bcrypt.GenerateFromPassword([]byte(input.Pin), bcrypt.DefaultCost)
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

	emp.Pin = "••••"
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"employee": emp,
		"role":     role,
	})
}
