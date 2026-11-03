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
		Preloads: []string{"CategoryRef", "BrandRef", "VariantTypes", "Variants", "WholesalePrices"},
		SearchFields: []string{"name", "barcode"},
		FilterFields: map[string]string{
			"category": "category_id",
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
		Category      string `json:"category"`
		CategoryID    *uint  `json:"category_id"`
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
				Price: float64(input.Price),
		CostPrice: float64(input.CostPrice),
		Stock:         input.Stock,
		Unit:          input.Unit,
		MinStock:      input.MinStock,
		ShelfLocation: input.ShelfLocation,
		CategoryID:    input.CategoryID,
		IsActive:      true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

		if product.CategoryID == nil && input.Category != "" {
		var cat models.Category
		if err := config.DB.Where("LOWER(TRIM(name)) = LOWER(TRIM(?))", input.Category).First(&cat).Error; err == nil {
			product.CategoryID = &cat.ID
		}
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
	if err := config.DB.Preload("VariantTypes").Preload("Variants").Preload("WholesalePrices").First(&product, "barcode = ?", barcode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	oldJSONBytes, _ := json.Marshal(product)
	oldJSON := string(oldJSONBytes)

	payloadBytes, _ := json.Marshal(input)
	fmt.Printf("\n[DEBUG UPDATE PAYLOAD] Barcode: %s | Data: %s\n", barcode, string(payloadBytes))

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Bersihkan relasi lama secara terurut (anak ke induk)
	if err := tx.Exec("DELETE FROM product_wholesale_prices WHERE product_id = ?", product.ID).Error; err != nil {
		tx.Rollback()
		fmt.Printf("[DB ERROR] Delete WholesalePrices: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal hapus harga grosir lama: " + err.Error()})
		return
	}

	if err := tx.Exec("DELETE FROM product_variants WHERE product_id = ?", product.ID).Error; err != nil {
		tx.Rollback()
		fmt.Printf("[DB ERROR] Delete Variants: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal hapus varian lama: " + err.Error()})
		return
	}

	if err := tx.Exec("DELETE FROM product_variant_types WHERE product_id = ?", product.ID).Error; err != nil {
		tx.Rollback()
		fmt.Printf("[DB ERROR] Delete VariantTypes: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal hapus tipe varian lama: " + err.Error()})
		return
	}

	// 2. Update Field Pokok Master Product
	if v, ok := getVal(input, "name", "Name"); ok && fmt.Sprint(v) != "" {
		product.Name = fmt.Sprint(v)
	}
	if v, ok := getVal(input, "category_id", "categoryId", "CategoryID"); ok {
		if n, valid := toInt(v); valid && n > 0 {
			cid := uint(n)
			product.CategoryID = &cid
		}
	} else if v, ok := getVal(input, "category", "Category"); ok && fmt.Sprint(v) != "" {
		var cat models.Category
		if err := tx.Where("LOWER(TRIM(name)) = LOWER(TRIM(?))", fmt.Sprint(v)).First(&cat).Error; err == nil {
			product.CategoryID = &cat.ID
		}
	}
	if v, ok := getVal(input, "price", "Price"); ok {
		if n, valid := toInt(v); valid {
			product.Price = float64(n)
		}
	}
	if v, ok := getVal(input, "cost_price", "costPrice", "CostPrice"); ok {
		if n, valid := toInt(v); valid {
			product.CostPrice = float64(n)
		}
	}
	if v, ok := getVal(input, "stock", "Stock"); ok {
		if n, valid := toInt(v); valid {
			product.Stock = n
		}
	}
	if v, ok := getVal(input, "unit", "Unit"); ok && fmt.Sprint(v) != "" {
		product.Unit = fmt.Sprint(v)
	}
	if v, ok := getVal(input, "min_stock", "minStock", "MinStock"); ok {
		if n, valid := toInt(v); valid {
			product.MinStock = n
		}
	}
	if v, ok := getVal(input, "shelf_location", "shelfLocation", "ShelfLocation"); ok {
		product.ShelfLocation = fmt.Sprint(v)
	}
	if v, ok := getVal(input, "description", "Description"); ok {
		product.Description = fmt.Sprint(v)
	}
	if v, ok := getVal(input, "is_active", "isActive", "IsActive"); ok {
		if b, okBool := v.(bool); okBool {
			product.IsActive = b
		}
	}
	if v, ok := getVal(input, "has_variant", "hasVariant", "HasVariant"); ok {
		switch val := v.(type) {
		case bool:
			product.HasVariant = val
		case string:
			product.HasVariant = (val == "true" || val == "1")
		}
	}
	if v, ok := getVal(input, "is_custom", "isCustom", "IsCustom"); ok {
		if b, okBool := v.(bool); okBool {
			product.IsCustom = &b
		}
	}
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
		if v, ok := getVal(input, "brand_id", "brandId", "BrandID"); ok {
		if n, valid := toInt(v); valid && n > 0 {
			bid := uint(n)
			product.BrandID = &bid
		} else {
			product.BrandID = nil
		}
	}
	if v, ok := getVal(input, "brand", "Brand"); ok {
		brandStr := fmt.Sprint(v)
		product.Brand = brandStr
		if product.BrandID == nil && brandStr != "" && brandStr != "Tidak Ada Merk" {
			var b models.Brand
			if err := tx.Where("LOWER(TRIM(name)) = LOWER(TRIM(?))", brandStr).First(&b).Error; err == nil {
				product.BrandID = &b.ID
			}
		}
	}

	if v, ok := getVal(input, "cert_number", "certNumber", "CertNumber"); ok {
		product.CertNumber = fmt.Sprint(v)
	}

	// 3. Simpan Ulang Variant Types jika ada
	if vRaw, ok := input["variant_types"]; ok && vRaw != nil {
		if vtBytes, err := json.Marshal(vRaw); err == nil {
			var vtList []models.VariantTypeInput
			if err := json.Unmarshal(vtBytes, &vtList); err == nil {
				for idx, item := range vtList {
					optBytes, _ := json.Marshal(item.Options)
					vtRecord := models.ProductVariantType{
						ProductID: product.ID,
						Name:      item.Name,
						Options:   json.RawMessage(optBytes),
						SortOrder: idx,
					}
					if err := tx.Create(&vtRecord).Error; err != nil {
						tx.Rollback()
						fmt.Printf("[DB ERROR] Insert VariantType: %v\n", err)
						c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal simpan variant type: " + err.Error()})
						return
					}
				}
			}
		}
	}

	// 4. Simpan Ulang Variants jika ada
	if vRaw, ok := input["variants"]; ok && vRaw != nil {
		if viBytes, err := json.Marshal(vRaw); err == nil {
			var viList []models.VariantItemInput
			if err := json.Unmarshal(viBytes, &viList); err == nil && len(viList) > 0 {
				totalVariantStock := 0
				for _, item := range viList {
					totalVariantStock += item.Stock
					variantRecord := models.ProductVariant{
						ProductID:    product.ID,
						SkuCode:      item.SkuCode,
						Barcode:      item.Barcode,
						Option1Value: item.Option1Value,
						Option2Value: item.Option2Value,
						Price:        item.Price,
						CostPrice:    item.CostPrice,
						Stock:        item.Stock,
						ImageURL:     item.ImageURL,
						CreatedAt:    time.Now(),
						UpdatedAt:    time.Now(),
					}
					if err := tx.Create(&variantRecord).Error; err != nil {
						tx.Rollback()
						fmt.Printf("[DB ERROR] Insert Variant SKU %s: %v\n", item.SkuCode, err)
						c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": fmt.Sprintf("Gagal simpan varian (%s): %v", item.SkuCode, err)})
						return
					}
				}
				if product.HasVariant {
					product.Stock = totalVariantStock
				}
			}
		}
	}

	// 5. Simpan Ulang Wholesale Prices jika ada
	if wRaw, ok := input["wholesale_prices"]; ok && wRaw != nil {
		if wpBytes, err := json.Marshal(wRaw); err == nil {
			var wpList []models.WholesalePriceInput
			if err := json.Unmarshal(wpBytes, &wpList); err == nil {
				for _, wp := range wpList {
					wpRecord := models.ProductWholesalePrice{
						ProductID: product.ID,
						VariantID: wp.VariantID,
						MinQty:    wp.MinQty,
						MaxQty:    wp.MaxQty,
						UnitPrice: wp.UnitPrice,
						CreatedAt: time.Now(),
					}
					if err := tx.Create(&wpRecord).Error; err != nil {
						tx.Rollback()
						fmt.Printf("[DB ERROR] Insert WholesalePrice: %v\n", err)
						c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal simpan harga grosir: " + err.Error()})
						return
					}
				}
			}
		}
	}

	product.UpdatedAt = time.Now()

	// Putus asosiasi GORM agar tidak menimpa record baru
	product.Variants = nil
	product.VariantTypes = nil
	product.WholesalePrices = nil

	// Update eksplisit kolom boolean has_variant agar zero-value (false) tidak diabaikan GORM
		if err := tx.Model(&models.Product{}).Where("id = ?", product.ID).Update("has_variant", product.HasVariant).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal update status varian: " + err.Error()})
			return
		}

		if err := tx.Omit("CategoryRef", "BrandRef", "VariantTypes", "Variants", "WholesalePrices", "HasVariant").Updates(&product).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal update master produk: " + err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal commit database: " + err.Error()})
		return
	}

	// Audit Trail Logging
	newJSONBytes, _ := json.Marshal(product)
	newJSON := string(newJSONBytes)

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
		Details:   fmt.Sprintf("Pembaruan master barang: %s (%s)", product.Name, product.Barcode),
		OldValues: oldJSON,
		NewValues: newJSON,
		Timestamp: time.Now().Format("2006-01-02 15:04:05"),
		CreatedAt: time.Now(),
	}
	_ = config.DB.Create(&audit)

	// Preload fresh data untuk response JSON ke frontend
	var refreshedProduct models.Product
	config.DB.Preload("CategoryRef").Preload("BrandRef").Preload("VariantTypes").Preload("Variants").Preload("WholesalePrices").First(&refreshedProduct, product.ID)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": refreshedProduct})
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

// GetProductByBarcode mengembalikan detail produk tunggal beserta seluruh relasi varian dan grosir
func GetProductByBarcode(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}
	barcode := c.Param("barcode")
	var product models.Product
	if err := config.DB.Preload("CategoryRef").
		Preload("BrandRef").
		Preload("VariantTypes").
		Preload("Variants").
		Preload("WholesalePrices").
		First(&product, "barcode = ?", barcode).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Produk tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}
