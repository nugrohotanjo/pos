package handlers

import (
	"net/http"
	"pos-backend/config"
	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	// Mengambil kategori unik yang ada di tabel products
	var categories []string
	if err := config.DB.Table("products").Distinct("category").Pluck("category", &categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": categories})
}
