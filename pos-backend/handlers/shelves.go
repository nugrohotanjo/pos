package handlers

import (
	"net/http"
	"strings"

	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

// GetShelves mengambil semua data lokasi rak
func GetShelves(c *gin.Context) {
	var shelves []models.Shelf
	if err := config.DB.Order("name ASC").Find(&shelves).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengambil data rak",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    shelves,
	})
}

// CreateShelf menambah lokasi rak baru
func CreateShelf(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Nama rak wajib diisi",
		})
		return
	}

	trimmedName := strings.TrimSpace(input.Name)
	if trimmedName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Nama rak tidak boleh kosong",
		})
		return
	}

	var existing models.Shelf
	if err := config.DB.Where("LOWER(name) = ?", strings.ToLower(trimmedName)).First(&existing).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    existing,
			"message": "Lokasi rak sudah terdaftar",
		})
		return
	}

	shelf := models.Shelf{Name: trimmedName}
	if err := config.DB.Create(&shelf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menyimpan lokasi rak",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    shelf,
		"message": "Lokasi rak berhasil ditambahkan",
	})
}

// DeleteShelf menghapus lokasi rak
func DeleteShelf(c *gin.Context) {
	id := c.Param("id")
	var shelf models.Shelf
	if err := config.DB.First(&shelf, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lokasi rak tidak ditemukan",
		})
		return
	}

	if err := config.DB.Delete(&shelf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal menghapus lokasi rak",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lokasi rak berhasil dihapus",
	})
}
