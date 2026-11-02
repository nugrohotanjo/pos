package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"pos-backend/config"
	"pos-backend/models"
)

// Helper membuat slug ramah URL
func GenerateSlug(name string) string {
	slug := strings.ToLower(name)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "category"
	}
	return slug
}

// Pastikan slug unik di database
func EnsureUniqueSlug(db *gorm.DB, baseSlug string, currentID uint) string {
	slug := baseSlug
	counter := 1
	for {
		var count int64
		q := db.Model(&models.Category{}).Where("slug = ?", slug)
		if currentID > 0 {
			q = q.Where("id != ?", currentID)
		}
		q.Count(&count)
		if count == 0 {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}
	return slug
}

// GET /api/v1/categories
func GetCategories(c *gin.Context) {
	db := config.DB
	asTree := c.Query("tree") == "true"
	search := c.Query("search")
	status := c.Query("status")

	if asTree {
		// Mengambil struktur pohon (Root level: parent_id IS NULL)
		var rootCategories []models.Category
		q := db.Preload("Children.Children").Where("parent_id IS NULL")
		if status == "true" {
			q = q.Where("is_active = ?", true)
		}
		if err := q.Order("name ASC").Find(&rootCategories).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil hierarki kategori"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": rootCategories, "success": true})
		return
	}

	// Format tabel / list standar
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	all := c.Query("all") == "true"

	var categories []models.Category
	var total int64

	query := db.Model(&models.Category{}).Preload("Parent")
	if search != "" {
		query = query.Where("name ILIKE ? OR slug ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status == "true" {
		query = query.Where("is_active = ?", true)
	} else if status == "false" {
		query = query.Where("is_active = ?", false)
	}

	query.Count(&total)

	if all {
		query.Order("name ASC").Find(&categories)
		c.JSON(http.StatusOK, gin.H{"data": categories, "success": true})
		return
	}

	offset := (page - 1) * limit
	if err := query.Order("id DESC").Offset(offset).Limit(limit).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat kategori"})
		return
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	c.JSON(http.StatusOK, gin.H{
		"data":    categories,
		"success": true,
		"pagination": gin.H{
			"current_page": page,
			"limit":        limit,
			"total_items":  total,
			"total_pages":  totalPages,
		},
	})
}

// POST /api/v1/categories
func CreateCategory(c *gin.Context) {
	db := config.DB
	var input struct {
		Name        string `json:"name" binding:"required"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
		ParentID    *uint  `json:"parent_id"`
		Actor       string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama kategori wajib diisi"})
		return
	}

	rawSlug := input.Slug
	if strings.TrimSpace(rawSlug) == "" {
		rawSlug = GenerateSlug(input.Name)
	} else {
		rawSlug = GenerateSlug(rawSlug)
	}
	finalSlug := EnsureUniqueSlug(db, rawSlug, 0)

	cat := models.Category{
		Name:        strings.TrimSpace(input.Name),
		Slug:        finalSlug,
		Description: strings.TrimSpace(input.Description),
		ParentID:    input.ParentID,
		IsActive:    true,
	}

	if err := db.Create(&cat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan kategori ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": cat, "success": true})
}

// PUT /api/v1/categories/:id
func UpdateCategory(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	var cat models.Category
	if err := db.First(&cat, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori tidak ditemukan"})
		return
	}
	oldName := cat.Name

	var input struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
		ParentID    *uint  `json:"parent_id"`
		IsActive    *bool  `json:"is_active"`
		Actor       string `json:"actor"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format payload tidak valid"})
		return
	}

	if input.Name != "" {
		cat.Name = strings.TrimSpace(input.Name)
	}

	if input.Slug != "" {
		cat.Slug = EnsureUniqueSlug(db, GenerateSlug(input.Slug), cat.ID)
	} else if input.Name != "" && cat.Slug == "" {
		cat.Slug = EnsureUniqueSlug(db, GenerateSlug(input.Name), cat.ID)
	}

	cat.Description = strings.TrimSpace(input.Description)
	
	// Validasi agar kategori tidak menjadikan dirinya sendiri sebagai parent
	catIDUint, _ := strconv.ParseUint(id, 10, 32)
	if input.ParentID != nil && *input.ParentID == uint(catIDUint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori tidak dapat menjadi induk untuk dirinya sendiri"})
		return
	}
	cat.ParentID = input.ParentID

	if input.IsActive != nil {
		cat.IsActive = *input.IsActive
	}

	if err := db.Save(&cat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui kategori"})
		return
	}

	// Cascade update nama kategori ke produk-produk terkait jika nama berubah
	if oldName != "" && oldName != cat.Name {
		// Update berdasarkan category_id ATAU nama lama (case-insensitive)
		db.Model(&models.Product{}).
			Where("category_id = ? OR LOWER(category) = LOWER(?)", cat.ID, oldName).
			Updates(map[string]interface{}{
				"category":    cat.Name,
				"category_id": cat.ID,
			})
	}

	c.JSON(http.StatusOK, gin.H{"data": cat, "success": true})
}

// DELETE /api/v1/categories/:id
func DeleteCategory(c *gin.Context) {
	db := config.DB
	id := c.Param("id")

	// Cek apakah memiliki child categories
	var childCount int64
	db.Model(&models.Category{}).Where("parent_id = ?", id).Count(&childCount)
	if childCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori memiliki sub-kategori aktif. Hapus atau pindahkan sub-kategori terlebih dahulu."})
		return
	}

	// Cek apakah dipakai oleh produk
	var prodCount int64
	db.Model(&models.Product{}).Where("category_id = ?", id).Count(&prodCount)
	if prodCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori masih terhubung dengan produk aktif."})
		return
	}

	if err := db.Delete(&models.Category{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
