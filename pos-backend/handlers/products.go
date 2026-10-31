package handlers

import (
	"fmt"
	"net/http"
	"time"
	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

func recordAudit(module, action, details, user, role string) {
	audit := models.AuditLog{
		Timestamp: time.Now().Format("02/01/2006, 15:04:05"),
		User:      user,
		Role:      role,
		Module:    module,
		Action:    action,
		Details:   details,
		Status:    "AUTO_RECORDED",
	}
	config.DB.Create(&audit)
}

// GET /api/v1/products
func GetProducts(c *gin.Context) {
	var products []models.Product
	if err := config.DB.Order("id desc").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal mengambil produk: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    products,
	})
}

// POST /api/v1/products
func CreateProduct(c *gin.Context) {
	var req models.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Validasi gagal: " + err.Error(),
		})
		return
	}

	if req.Unit == "" {
		req.Unit = "Pcs"
	}
	if req.MinStock == 0 {
		req.MinStock = 5
	}

	prod := models.Product{
		Barcode:       req.Barcode,
		Name:          req.Name,
		Category:      req.Category,
		Price:         req.Price,
		CostPrice:     req.CostPrice,
		Stock:         req.Stock,
		MinStock:      req.MinStock,
		Unit:          req.Unit,
		ShelfLocation: req.ShelfLocation,
		OriginalPrice: req.OriginalPrice,
		Tag:           req.Tag,
		StockNote:     req.StockNote,
		IsActive:      true,
	}

	if err := config.DB.Create(&prod).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal menyimpan ke database: " + err.Error(),
		})
		return
	}

	recordAudit(
		"PRODUCTS",
		"CREATE_PRODUCT",
		fmt.Sprintf("Tambah barang \"%s\" (%s): Jual Rp%d, HPP Rp%d, Stok %d %s", prod.Name, prod.Barcode, prod.Price, prod.CostPrice, prod.Stock, prod.Unit),
		"Fadhil",
		"Pemilik Toko (Owner)",
	)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Produk berhasil ditambahkan",
		"data":    prod,
	})
}

// PUT /api/v1/products/:barcode
func UpdateProduct(c *gin.Context) {
	barcode := c.Param("barcode")
	var prod models.Product

	if err := config.DB.Where("barcode = ?", barcode).First(&prod).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Produk tidak ditemukan",
		})
		return
	}

	var req models.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Validasi gagal: " + err.Error(),
		})
		return
	}

	oldName := prod.Name
	oldPrice := prod.Price
	oldStock := prod.Stock

	prod.Name = req.Name
	prod.Category = req.Category
	prod.Price = req.Price
	prod.CostPrice = req.CostPrice
	prod.Stock = req.Stock
	if req.MinStock > 0 {
		prod.MinStock = req.MinStock
	}
	if req.Unit != "" {
		prod.Unit = req.Unit
	}
	prod.ShelfLocation = req.ShelfLocation

	if err := config.DB.Save(&prod).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal memperbarui produk: " + err.Error(),
		})
		return
	}

	recordAudit(
		"PRODUCTS",
		"UPDATE_PRODUCT",
		fmt.Sprintf("Update \"%s\" (%s): Harga (Rp%d -> Rp%d), Stok (%d -> %d %s)", oldName, barcode, oldPrice, prod.Price, oldStock, prod.Stock, prod.Unit),
		"Fadhil",
		"Pemilik Toko (Owner)",
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Produk berhasil diperbarui",
		"data":    prod,
	})
}

// PATCH /api/v1/products/:barcode/toggle-archive
func ToggleArchiveProduct(c *gin.Context) {
	barcode := c.Param("barcode")
	var prod models.Product

	if err := config.DB.Where("barcode = ?", barcode).First(&prod).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Produk tidak ditemukan",
		})
		return
	}

	prod.IsActive = !prod.IsActive
	config.DB.Save(&prod)

	actionName := "ARCHIVE_PRODUCT"
	keterangan := "Mengarsipkan"
	if prod.IsActive {
		actionName = "RESTORE_PRODUCT"
		keterangan = "Memulihkan"
	}

	recordAudit(
		"PRODUCTS",
		actionName,
		fmt.Sprintf("%s barang \"%s\" (Barcode: %s)", keterangan, prod.Name, barcode),
		"Fadhil",
		"Pemilik Toko (Owner)",
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Status arsip produk berhasil diubah",
		"data":    prod,
	})
}

// DELETE /api/v1/products/:barcode
func DeleteProduct(c *gin.Context) {
	barcode := c.Param("barcode")
	var prod models.Product

	if err := config.DB.Where("barcode = ?", barcode).First(&prod).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Produk tidak ditemukan",
		})
		return
	}

	prodName := prod.Name
	if err := config.DB.Delete(&prod).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal menghapus produk: " + err.Error(),
		})
		return
	}

	recordAudit(
		"PRODUCTS",
		"ARCHIVE_PRODUCT",
		fmt.Sprintf("Menghapus fisik barang \"%s\" (Barcode: %s)", prodName, barcode),
		"Fadhil",
		"Pemilik Toko (Owner)",
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Produk berhasil dihapus dari database",
	})
}

// GET /api/v1/products/:barcode/audit-logs
func GetProductAuditLogs(c *gin.Context) {
	barcode := c.Param("barcode")
	var logs []models.AuditLog

	// Cari semua log audit yang berkaitan dengan barcode ini di kolom Details
	err := config.DB.Where("module = ? AND details LIKE ?", "PRODUCTS", "%"+barcode+"%").
		Order("id desc").
		Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal memuat riwayat audit produk: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    logs,
	})
}
