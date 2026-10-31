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

// GET /api/v1/audit-logs?page=1&limit=15&search=&module=ALL
func GetAuditLogs(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Koneksi database belum terhubung",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "15"))
	search := strings.TrimSpace(c.Query("search"))
	module := strings.TrimSpace(c.Query("module"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 15
	}

	query := config.DB.Model(&models.AuditLog{})

	// Filter Module (PRODUCTS, POS_TERMINAL, INVENTORY, SETTINGS, dll)
	if module != "" && module != "ALL" {
		query = query.Where("module = ?", module)
	}

	// Filter Search (Pencarian aktor, details, atau action)
	if search != "" {
		pattern := "%" + search + "%"
		query = query.Where("details ILIKE ? OR user ILIKE ? OR action ILIKE ?", pattern, pattern, pattern)
	}

	// 1. Hitung total data sesuai filter
	var totalItems int64
	if err := query.Count(&totalItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal menghitung log audit: " + err.Error(),
		})
		return
	}

	// 2. Query data pagination berurut dari yang paling baru
	offset := (page - 1) * limit
	var logs []models.AuditLog
	err := query.Order("id DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal mengambil log audit: " + err.Error(),
		})
		return
	}

	totalPages := int(math.Ceil(float64(totalItems) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    logs,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total_items": totalItems,
			"total_pages": totalPages,
		},
	})
}
