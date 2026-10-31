package handlers

import (
	"fmt"
	"net/http"
	"time"

	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

// GET /api/v1/settings
func GetSettings(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var setting models.Setting
	if err := config.DB.First(&setting, 1).Error; err != nil {
		setting = models.Setting{
			ID:            1,
			AppName:       "POS Ritel General",
			StoreAddress:  "Jl. Raya Utama No. 123, Indonesia",
			StorePhone:    "0812-3456-7890",
			ReceiptFooter: "Terima kasih telah berbelanja!",
			CashEnabled:   true,
			QrisEnabled:   true,
			EdcEnabled:    true,
			UpdatedAt:     time.Now(),
		}
		config.DB.Create(&setting)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    setting,
	})
}

// PUT /api/v1/settings
func UpdateSettings(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var input struct {
		AppName       string `json:"app_name"`
		StoreAddress  string `json:"store_address"`
		StorePhone    string `json:"store_phone"`
		ReceiptFooter string `json:"receipt_footer"`
		CashEnabled   *bool  `json:"cash_enabled"`
		QrisEnabled   *bool  `json:"qris_enabled"`
		EdcEnabled    *bool  `json:"edc_enabled"`
		Actor         string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var setting models.Setting
	if err := config.DB.First(&setting, 1).Error; err != nil {
		setting.ID = 1
		config.DB.Create(&setting)
	}

	oldName := setting.AppName

	if input.AppName != "" {
		setting.AppName = input.AppName
	}
	if input.StoreAddress != "" {
		setting.StoreAddress = input.StoreAddress
	}
	if input.StorePhone != "" {
		setting.StorePhone = input.StorePhone
	}
	if input.ReceiptFooter != "" {
		setting.ReceiptFooter = input.ReceiptFooter
	}
	if input.CashEnabled != nil {
		setting.CashEnabled = *input.CashEnabled
	}
	if input.QrisEnabled != nil {
		setting.QrisEnabled = *input.QrisEnabled
	}
	if input.EdcEnabled != nil {
		setting.EdcEnabled = *input.EdcEnabled
	}
	setting.UpdatedAt = time.Now()

	if err := config.DB.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menyimpan pengaturan: " + err.Error()})
		return
	}

	// Rekam riwayat perubahan ke tabel audit_logs menggunakan field 'User'
	actor := input.Actor
	if actor == "" {
		actor = "Owner / Administrator"
	}
	auditDetail := fmt.Sprintf("Memperbarui konfigurasi sistem/toko: Nama: %s (sebelumnya: %s), Cash: %t, QRIS: %t, EDC: %t",
		setting.AppName, oldName, setting.CashEnabled, setting.QrisEnabled, setting.EdcEnabled)

	config.DB.Create(&models.AuditLog{
		Module:    "SETTINGS",
		Action:    "UPDATE_SETTINGS",
		User:      actor,
		Details:   auditDetail,
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pengaturan toko berhasil disimpan",
		"data":    setting,
	})
}
