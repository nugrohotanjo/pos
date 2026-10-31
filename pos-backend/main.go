package main

import (
	"log"
	"net/http"

	"pos-backend/config"
	"pos-backend/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	r.GET("/api/health", handlers.HealthCheck)

	v1 := r.Group("/api/v1")
	{
		// Products & Categories
		v1.GET("/categories", handlers.GetCategories)
		v1.GET("/products", handlers.GetProducts)
		v1.POST("/products", handlers.CreateProduct)
		v1.PUT("/products/:barcode", handlers.UpdateProduct)
		v1.PATCH("/products/:barcode/archive", handlers.ToggleArchiveProduct)
		v1.PATCH("/products/:barcode/toggle-archive", handlers.ToggleArchiveProduct)
		v1.DELETE("/products/:barcode", handlers.DeleteProduct)
		v1.GET("/products/:barcode/audit-logs", handlers.GetProductAuditLogs)

		// Audit Logs
		v1.GET("/audit-logs", handlers.GetAuditLogs)

		// Settings Toko & Sistem
		v1.GET("/settings", handlers.GetSettings)
		v1.PUT("/settings", handlers.UpdateSettings)

		// Orders / POS
		v1.POST("/orders", handlers.CreateOrder)
	}

	log.Println("Server POS Backend berjalan pada port :8000")
	if err := r.Run(":8000"); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
