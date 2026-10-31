package handlers

import (
	"math"
	"net/http"
	"strconv"
	"strings"

	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

// GET /api/v1/products?page=1&limit=10&search=&category=ALL&status=ACTIVE
func GetProducts(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Koneksi database belum terhubung",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := strings.TrimSpace(c.Query("search"))
	category := strings.TrimSpace(c.Query("category"))
	status := strings.TrimSpace(c.Query("status"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	query := config.DB.Model(&models.Product{})

	// Filter Search (Barcode atau Nama)
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("barcode ILIKE ? OR name ILIKE ?", searchPattern, searchPattern)
	}

	// Filter Kategori
	if category != "" && category != "ALL" {
		query = query.Where("category = ?", category)
	}

	// Filter Status Aktif/Arsip
	if status == "ACTIVE" {
		query = query.Where("is_active = ?", true)
	} else if status == "ARCHIVED" {
		query = query.Where("is_active = ?", false)
	}

	// 1. Hitung total data yang cocok
	var totalItems int64
	if err := query.Count(&totalItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal menghitung total data: " + err.Error(),
		})
		return
	}

	// 2. Query data spesifik halaman dengan LIMIT & OFFSET
	offset := (page - 1) * limit
	var products []models.Product
	err := query.Order("id DESC").
		Limit(limit).
		Offset(offset).
		Find(&products).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal mengambil data produk: " + err.Error(),
		})
		return
	}

	totalPages := int(math.Ceil(float64(totalItems) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    products,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total_items": totalItems,
			"total_pages": totalPages,
		},
	})
}

// GET /api/v1/categories - Untuk dropdown kategori yang ringan & cepat
func GetCategories(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database offline"})
		return
	}

	var categories []string
	err := config.DB.Model(&models.Product{}).
		Where("category <> ''").
		Distinct("category").
		Pluck("category", &categories).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    categories,
	})
}

// POST /api/v1/products
func CreateProduct(c *gin.Context) {
	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	input.IsActive = true
	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menyimpan produk: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": input})
}

// PUT /api/v1/products/:barcode
func UpdateProduct(c *gin.Context) {
	barcode := c.Param("barcode")
	var product models.Product

	if err := config.DB.Where("barcode = ?", barcode).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	delete(input, "barcode")
	delete(input, "id")

	if err := config.DB.Model(&product).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal memperbarui data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// PATCH /api/v1/products/:barcode/archive
func ToggleArchiveProduct(c *gin.Context) {
	barcode := c.Param("barcode")
	var product models.Product

	if err := config.DB.Where("barcode = ?", barcode).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	newStatus := !product.IsActive
	if err := config.DB.Model(&product).Update("is_active", newStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal mengubah status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// GET /api/v1/products/:barcode/audit-logs
func GetProductAuditLogs(c *gin.Context) {
	barcode := c.Param("barcode")
	var logs []models.AuditLog

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Koneksi database belum siap"})
		return
	}

	searchPattern := "%" + barcode + "%"
	if err := config.DB.Where("details LIKE ?", searchPattern).Order("id desc").Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal query audit log: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": logs})
}

// DELETE /api/v1/products/:barcode
func DeleteProduct(c *gin.Context) {
	barcode := c.Param("barcode")
	var product models.Product

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Koneksi database belum siap"})
		return
	}

	if err := config.DB.Where("barcode = ?", barcode).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menghapus produk: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Produk berhasil dihapus",
	})
}
