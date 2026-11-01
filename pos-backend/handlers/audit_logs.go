package handlers

import (
	"net/http"

	"pos-backend/config"
	"pos-backend/models"
	"pos-backend/utils"

	"github.com/gin-gonic/gin"
)

// GET /api/v1/audit-logs
func GetAuditLogs(c *gin.Context) {
	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Database tidak terhubung"})
		return
	}

	var logs []models.AuditLog
	_ = utils.PaginateAndFilter(c, config.DB, &models.AuditLog{}, &logs, utils.DataTablesOptions{
		SearchFields: []string{"\"user\"", "details", "action"},
		FilterFields: map[string]string{
			"module": "module",
		},
		DateField:    "created_at",
		DefaultOrder: "created_at desc",
	})
}
