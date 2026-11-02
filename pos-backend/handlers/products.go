package handlers

import (
	"encoding/json"
	"fmt"
	"pos-backend/utils"
			"net/http"
	"strconv"
	"time"

	"pos-backend/config"
	"pos-backend/models"
	
	"github.com/gin-gonic/gin"
	"strings"
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

		actor := input.Actor
	if actor == "" {
		actor = c.GetHeader("X-User-Name")
	}
	if actor == "" {
		actor = "Sistem"
	}

	// Audit ditangani otomatis oleh GORM plugin

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

		product.IsActive = !product.IsActive
	product.UpdatedAt = time.Now()
	


	

	if err := config.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Audit otomatis ditangani oleh GORM plugin

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// DELETE /api/v1/products/:barcode

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

	// 1. Tangkap snapshot sebelum diubah secara dinamis dari model
	oldJSONBytes, _ := json.Marshal(product)
	oldJSON := string(oldJSONBytes)

	// 2. Terapkan perubahan field
	if v, ok := getVal(input, "name", "Name"); ok {
		if str := fmt.Sprint(v); str != "" {
			product.Name = str
		}
	}
	// Category & CategoryID Handler
	if v, ok := getVal(input, "category_id", "categoryId", "CategoryID"); ok {
		if n, valid := toInt(v); valid && n > 0 {
			cid := uint(n)
			product.CategoryID = &cid
			var cat models.Category
			if err := config.DB.First(&cat, cid).Error; err == nil {
				product.Category = cat.Name
			}
		}
	} else if v, ok := getVal(input, "category", "Category"); ok {
		if str := fmt.Sprint(v); str != "" {
			product.Category = str
			var cat models.Category
			if err := config.DB.Where("LOWER(TRIM(name)) = LOWER(TRIM(?))", str).First(&cat).Error; err == nil {
				product.CategoryID = &cat.ID
				product.Category = cat.Name
			}
		}
	}
	if v, ok := getVal(input, "price", "Price"); ok {
		if n, valid := toInt(v); valid {
			product.Price = n
		}
	}
	if v, ok := getVal(input, "cost_price", "costPrice", "CostPrice"); ok {
		if n, valid := toInt(v); valid {
			product.CostPrice = n
		}
	}
	if v, ok := getVal(input, "stock", "Stock"); ok {
		if n, valid := toInt(v); valid {
			product.Stock = n
		}
	}
	if v, ok := getVal(input, "unit", "Unit"); ok {
		if str := fmt.Sprint(v); str != "" {
			product.Unit = str
		}
	}
	if v, ok := getVal(input, "min_stock", "minStock", "MinStock"); ok {
		if n, valid := toInt(v); valid {
			product.MinStock = n
		}
	}
	if v, ok := getVal(input, "shelf_location", "shelfLocation", "ShelfLocation"); ok {
		product.ShelfLocation = fmt.Sprint(v)
	}
	if v, ok := getVal(input, "is_active", "isActive", "IsActive"); ok {
		if b, okBool := v.(bool); okBool {
			product.IsActive = b
		} else {
			s := strings.ToLower(fmt.Sprint(v))
			if s == "true" || s == "1" {
				// product.IsActive follows user input
			} else if s == "false" || s == "0" {
				product.IsActive = false
			}
		}
	}

			// Atribut Tambahan
		if v, ok := getVal(input, "dimension", "Dimension"); ok {
			product.Dimension = fmt.Sprint(v)
		}
		if v, ok := getVal(input, "origin", "Origin"); ok {
			product.Origin = fmt.Sprint(v)
		}
		if v, ok := getVal(input, "warranty_period", "warrantyPeriod", "WarrantyPeriod"); ok {
			product.WarrantyPeriod = fmt.Sprint(v)
		}
		if v, ok := getVal(input, "warranty_type", "warrantyType", "WarrantyType"); ok {
			product.WarrantyType = fmt.Sprint(v)
		}
		if v, ok := getVal(input, "is_custom", "isCustom", "IsCustom"); ok {
			if b, okBool := v.(bool); okBool {
				product.IsCustom = &b
			} else {
				s := strings.ToLower(fmt.Sprint(v))
				if s == "true" || s == "1" || s == "ya" {
					tr := true
					product.IsCustom = &tr
				} else if s == "false" || s == "0" || s == "tidak" {
					fl := false
					product.IsCustom = &fl
				}
			}
		}
		if v, ok := getVal(input, "cert_number", "certNumber", "CertNumber"); ok {
			product.CertNumber = fmt.Sprint(v)
		}

		product.UpdatedAt = time.Now()

	if err := config.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal update produk: " + err.Error()})
		return
	}

	// 3. Tangkap snapshot sesudah diubah secara dinamis dari model
	newJSONBytes, _ := json.Marshal(product)
	newJSON := string(newJSONBytes)

	// Hitung perubahan secara dinamis
	var oldMap, newMap map[string]interface{}
	_ = json.Unmarshal([]byte(oldJSON), &oldMap)
	_ = json.Unmarshal([]byte(newJSON), &newMap)

	var changedFields []string
	ignoredFields := map[string]bool{"updated_at": true, "updatedAt": true, "created_at": true, "createdAt": true, "id": true, "ID": true, "deleted_at": true}
	for k, nv := range newMap {
		if ignoredFields[k] {
			continue
		}
		ov := oldMap[k]
		if fmt.Sprint(ov) != fmt.Sprint(nv) {
			changedFields = append(changedFields, k)
		}
	}

	diffText := ""
	if len(changedFields) > 0 {
		diffText = fmt.Sprintf(" (Perubahan: %s)", strings.Join(changedFields, ", "))
	}

	actor := c.GetHeader("X-User-Name")
	if actor == "" {
		if act, ok := input["actor"]; ok && fmt.Sprint(act) != "" {
			actor = fmt.Sprint(act)
		} else {
			actor = "Sistem"
		}
	}

	audit := models.AuditLog{
		Module:    "PRODUCTS",
		Action:    "UPDATE",
		User:      actor,
		Details: fmt.Sprintf("Pembaruan master barang: %s (%s)%s", product.Name, product.Barcode, diffText),
		OldValues: string(oldJSON),
		NewValues: string(newJSON),
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
		CreatedAt: time.Now(),
	}
	_ = config.DB.Create(&audit)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

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
	// Audit otomatis ditangani oleh GORM plugin

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Produk berhasil dihapus"})
}

// GET /api/v1/products/:barcode/audit-logs
func GetProductAuditLogs(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	barcode := c.Param("barcode")

	var logs []models.AuditLog
	searchPattern := "%" + barcode + "%"

	err := config.DB.Where(
		"module = ? AND (details LIKE ? OR old_values LIKE ? OR new_values LIKE ?)",
		"PRODUCTS", searchPattern, searchPattern, searchPattern,
	).Order("created_at desc").Limit(50).Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal mengambil riwayat audit: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": logs})
}
