package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "pos-backend (Gin)",
		"port":    8000,
		"time":    time.Now().Format(time.RFC3339),
	})
}
