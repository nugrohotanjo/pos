package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"pos-backend/config"
	"pos-backend/models"
	"pos-backend/utils"

	"github.com/gin-gonic/gin"
)

// Helper untuk mengambil string dari map baik camelCase maupun snake_case
func getVal(m map[string]interface{}, keys ...string) (interface{}, bool) {
	for _, k := range keys {
		if v, exists := m[k]; exists && v != nil {
			return v, true
		}
	}
	return nil, false
}

func toInt(v interface{}) (int, bool) {
	switch val := v.(type) {
	case float64:
		return int(val), true
	case int:
		return val, true
	case string:
		if n, err := strconv.Atoi(val); err == nil {
			return n, true
		}
	}
	return 0, false
}

// GET /api/v1/products
func GetProducts(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var products []models.Product
	_ = utils.PaginateAndFilter(c, config.DB, &models.Product{}, &products, utils.DataTablesOptions{
		SearchFields: []string{"name", "barcode"},
		FilterFields: map[string]string{
			"category": "category",
			"status":   "is_active",
		},
		DefaultOrder: "created_at desc",
	})
}

// POST /api/v1/products
func CreateProduct(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	var input struct {
		Barcode       string `json:"barcode" binding:"required"`
		Name          string `json:"name" binding:"required"`
		Category      string `json:"category" binding:"required"`
		Price         int    `json:"price" binding:"required"`
		CostPrice     int    `json:"cost_price"`
		Stock         int    `json:"stock"`
		Unit          string `json:"unit"`
		MinStock      int    `json:"min_stock"`
		ShelfLocation string `json:"shelf_location"`
		Actor         string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	product := models.Product{
		Barcode:       input.Barcode,
		Name:          input.Name,
		Category:      input.Category,
		Price:         input.Price,
		CostPrice:     input.CostPrice,
		Stock:         input.Stock,
		Unit:          input.Unit,
		MinStock:      input.MinStock,
		ShelfLocation: input.ShelfLocation,
		IsActive:      true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := config.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menambah produk: " + err.Error()})
		return
	}

	newSnap, _ := json.Marshal(product)
	actor := input.Actor
	if actor == "" {
		actor = c.GetHeader("X-User-Name")
	}
	if actor == "" {
		actor = "Sistem"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "PRODUCTS",
		Action:    "CREATE",
		User:      actor,
		Details:   fmt.Sprintf("Menambahkan produk baru: %s (%s)", product.Name, product.Barcode),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": product})
}

// PUT /api/v1/products/:barcode
func UpdateProduct(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	barcode := c.Param("barcode")
	var product models.Product
	if err := config.DB.First(&product, "barcode = ?", barcode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// 1. Snapshot BEFORE (Nilai asli sebelum diedit)
	oldSnapMap := map[string]interface{}{
		"name":           product.Name,
		"category":       product.Category,
		"price":          product.Price,
		"cost_price":     product.CostPrice,
		"stock":          product.Stock,
		"unit":           product.Unit,
		"min_stock":      product.MinStock,
		"shelf_location": product.ShelfLocation,
	}
	oldSnap, _ := json.Marshal(oldSnapMap)

	// 2. Inisialisasi Snapshot AFTER dengan nilai BEFORE
	newSnapMap := make(map[string]interface{})
	for k, v := range oldSnapMap {
		newSnapMap[k] = v
	}

	// 3. Update field baik yang dikirim dalam snake_case maupun camelCase
	if v, ok := getVal(input, "name", "Name"); ok {
		strVal := fmt.Sprint(v)
		if strVal != "" {
			product.Name = strVal
			newSnapMap["name"] = product.Name
		}
	}

	if v, ok := getVal(input, "category", "Category"); ok {
		strVal := fmt.Sprint(v)
		if strVal != "" {
			product.Category = strVal
			newSnapMap["category"] = product.Category
		}
	}

	if v, ok := getVal(input, "price", "Price"); ok {
		if n, valid := toInt(v); valid {
			product.Price = n
			newSnapMap["price"] = product.Price
		}
	}

	if v, ok := getVal(input, "cost_price", "costPrice", "CostPrice"); ok {
		if n, valid := toInt(v); valid {
			product.CostPrice = n
			newSnapMap["cost_price"] = product.CostPrice
		}
	}

	if v, ok := getVal(input, "stock", "Stock"); ok {
		if n, valid := toInt(v); valid {
			product.Stock = n
			newSnapMap["stock"] = product.Stock
		}
	}

	if v, ok := getVal(input, "unit", "Unit"); ok {
		strVal := fmt.Sprint(v)
		if strVal != "" {
			product.Unit = strVal
			newSnapMap["unit"] = product.Unit
		}
	}

	if v, ok := getVal(input, "min_stock", "minStock", "MinStock"); ok {
		if n, valid := toInt(v); valid {
			product.MinStock = n
			newSnapMap["min_stock"] = product.MinStock
		}
	}

	if v, ok := getVal(input, "shelf_location", "shelfLocation", "ShelfLocation"); ok {
		product.ShelfLocation = fmt.Sprint(v)
		newSnapMap["shelf_location"] = product.ShelfLocation
	}

	product.UpdatedAt = time.Now()
	if err := config.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal update produk: " + err.Error()})
		return
	}

	newSnap, _ := json.Marshal(newSnapMap)

	actor := ""
	if v, ok := getVal(input, "actor", "Actor", "user", "User"); ok {
		if strVal := fmt.Sprint(v); strVal != "" {
			actor = strVal
		}
	}
	if actor == "" {
		actor = c.GetHeader("X-User-Name")
	}
	if actor == "" {
		actor = c.Query("actor")
	}
	if actor == "" {
		actor = "Sistem"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "PRODUCTS",
		Action:    "UPDATE",
		User:      actor,
		Details:   fmt.Sprintf("Pembaruan master barang: %s (%s)", product.Name, product.Barcode),
		OldValues: string(oldSnap),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// PATCH /api/v1/products/:barcode/archive
func ToggleArchiveProduct(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	barcode := c.Param("barcode")
	var product models.Product
	if err := config.DB.First(&product, "barcode = ?", barcode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	oldActive := product.IsActive
	product.IsActive = !product.IsActive
	product.UpdatedAt = time.Now()
	config.DB.Save(&product)

	oldSnap, _ := json.Marshal(map[string]interface{}{"is_active": oldActive})
	newSnap, _ := json.Marshal(map[string]interface{}{"is_active": product.IsActive})

	actor := c.GetHeader("X-User-Name")
	if actor == "" {
		actor = c.Query("actor")
	}
	if actor == "" {
		actor = "Sistem"
	}
	actionName := "ARCHIVE"
	if product.IsActive {
		actionName = "RESTORE"
	}

	config.DB.Create(&models.AuditLog{
		Module:    "PRODUCTS",
		Action:    actionName,
		User:      actor,
		Details:   fmt.Sprintf("Ubah status aktif produk: %s (%s)", product.Name, product.Barcode),
		OldValues: string(oldSnap),
		NewValues: string(newSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// DELETE /api/v1/products/:barcode
func DeleteProduct(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	barcode := c.Param("barcode")
	var product models.Product
	if err := config.DB.First(&product, "barcode = ?", barcode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	oldSnap, _ := json.Marshal(product)
	if err := config.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	actor := c.GetHeader("X-User-Name")
	if actor == "" {
		actor = c.Query("actor")
	}
	if actor == "" {
		actor = "Sistem"
	}
	config.DB.Create(&models.AuditLog{
		Module:    "PRODUCTS",
		Action:    "DELETE",
		User:      actor,
		Details:   fmt.Sprintf("Menghapus permanen produk: %s (%s)", product.Name, product.Barcode),
		OldValues: string(oldSnap),
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Produk berhasil dihapus"})
}

// GET /api/v1/products/:barcode/audit-logs
func GetProductAuditLogs(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "data": []interface{}{}})
}
