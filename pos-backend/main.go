package main

import (
	"log"
	"net/http"

	"pos-backend/config"
	"pos-backend/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Inisialisasi Database
	config.ConnectDatabase()

	r := gin.Default()

	// 2. Middleware CORS Lengkap (Mencegah "Failed to fetch" di Browser)
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

	// 3. Health check & Dokumen
	r.GET("/api/health", handlers.HealthCheck)

	// 4. Group API V1
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

		// Orders / POS
		v1.POST("/orders", handlers.CreateOrder)
	}

	log.Println("Server POS Backend berjalan pada port :8000")
	if err := r.Run(":8000"); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
