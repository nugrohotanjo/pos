package utils

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DataTablesOptions struct {
	SearchFields []string          // Kolom pencarian (?search=)
	FilterFields map[string]string // Mapping query param -> kolom db
	DateField    string            // Nama kolom datetime untuk daterange (misal: "created_at")
	DefaultOrder string            // Sorting default
	BaseQuery    func(db *gorm.DB) *gorm.DB
}

func PaginateAndFilter(c *gin.Context, db *gorm.DB, model interface{}, result interface{}, opts DataTablesOptions) error {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "15"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 15
	}

	search := strings.TrimSpace(c.Query("search"))
	query := db.Model(model)

	if opts.BaseQuery != nil {
		query = opts.BaseQuery(query)
	}

	// 1. Multi-Column Search
	if search != "" && len(opts.SearchFields) > 0 {
		var searchConditions []string
		var searchArgs []interface{}
		likePattern := "%" + search + "%"

		for _, field := range opts.SearchFields {
			searchConditions = append(searchConditions, field+" ILIKE ?")
			searchArgs = append(searchArgs, likePattern)
		}
		query = query.Where(strings.Join(searchConditions, " OR "), searchArgs...)
	}

	// 2. Dynamic Single Filter
	for paramKey, dbColumn := range opts.FilterFields {
		val := strings.TrimSpace(c.Query(paramKey))
		if val != "" && val != "ALL" {
			if val == "ACTIVE" {
				query = query.Where(dbColumn+" = ?", true)
			} else if val == "ARCHIVED" || val == "INACTIVE" {
				query = query.Where(dbColumn+" = ?", false)
			} else {
				if dbColumn == "category" {
								if _, err := strconv.Atoi(val); err == nil {
									query = query.Where("category_id = ?", val)
								} else {
									query = query.Where("LOWER(category) = LOWER(?)", val)
								}
							} else {
								query = query.Where(dbColumn + " = ?", val)
							}
			}
		}
	}

	// 3. Filter Date Range (start_date & end_date)
	dateCol := opts.DateField
	if dateCol == "" {
		dateCol = "created_at"
	}

	startDate := strings.TrimSpace(c.Query("start_date"))
	endDate := strings.TrimSpace(c.Query("end_date"))

	if startDate != "" {
		if tStart, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where(fmt.Sprintf("%s >= ?", dateCol), tStart)
		}
	}
	if endDate != "" {
		if tEnd, err := time.Parse("2006-01-02", endDate); err == nil {
			// Tambahkan hingga akhir hari (23:59:59)
			tEndFull := tEnd.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			query = query.Where(fmt.Sprintf("%s <= ?", dateCol), tEndFull)
		}
	}

	// 4. Hitung Total Items
	var totalItems int64
	if err := query.Count(&totalItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return err
	}

	// 5. Sorting
	order := strings.TrimSpace(c.Query("order"))
	if order == "" {
		if opts.DefaultOrder != "" {
			order = opts.DefaultOrder
		} else {
			order = "created_at desc"
		}
	}
	query = query.Order(order)

	// 6. Pagination Offset & Limit
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return err
	}

	totalPages := 1
	if totalItems > 0 && limit > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(limit)))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total_items": totalItems,
			"total_pages": totalPages,
		},
	})

	return nil
}
