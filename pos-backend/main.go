package main

import (
	"time"

	"pos-backend/config"
	"pos-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8001", "http://localhost:8002", "http://127.0.0.1:8001", "http://127.0.0.1:8002"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.LoadHTMLGlob("templates/*")

	r.GET("/", handlers.RenderDocs)
	r.GET("/docs", handlers.RenderDocs)
	r.GET("/api/health", handlers.HealthCheck)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/products", handlers.GetProducts)
		v1.POST("/products", handlers.CreateProduct)
		v1.PUT("/products/:barcode", handlers.UpdateProduct)
		v1.PATCH("/products/:barcode/toggle-archive", handlers.ToggleArchiveProduct)
		v1.DELETE("/products/:barcode", handlers.DeleteProduct)

		v1.POST("/orders", handlers.CreateOrder)
	}

	r.Run(":8000")
}
