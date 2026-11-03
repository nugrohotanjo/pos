package handlers

import (
	"net/http"
	"strings"

	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

// GetBrands mengambil semua master merek diurutkan secara abjad
func GetBrands(c *gin.Context) {
	var brands []models.Brand
	if err := config.DB.Order("name ASC").Find(&brands).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data merek",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    brands,
	})
}

// CreateBrand menambahkan merek baru ke master data
func CreateBrand(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Nama merek wajib diisi",
		})
		return
	}

	trimmedName := strings.TrimSpace(input.Name)
	if trimmedName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Nama merek tidak boleh kosong",
		})
		return
	}

	// Cek apakah sudah ada (case-insensitive)
	var existing models.Brand
	if err := config.DB.Where("LOWER(name) = ?", strings.ToLower(trimmedName)).First(&existing).Error; err == nil {
		// Jika sudah ada, kembalikan data yang ada
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    existing,
			"message": "Merek sudah terdaftar",
		})
		return
	}

	brand := models.Brand{
		Name: trimmedName,
	}

	if err := config.DB.Create(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan merek",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    brand,
		"message": "Merek berhasil ditambahkan",
	})
}

// DeleteBrand menghapus merek dari master data
func DeleteBrand(c *gin.Context) {
	id := c.Param("id")
	var brand models.Brand
	if err := config.DB.First(&brand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Merek tidak ditemukan",
		})
		return
	}

	if err := config.DB.Delete(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menghapus merek",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Merek berhasil dihapus",
	})
}
