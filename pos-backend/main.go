package main

import (
	"time"

	"pos-backend/config"
	"pos-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Inisialisasi Database PostgreSQL
	config.ConnectDatabase()

	r := gin.Default()

	// Load template dokumentasi HTML
	r.LoadHTMLGlob("templates/*")

	// Middleware CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8001", "http://localhost:8002"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	r.GET("/", handlers.RenderDocs)
	r.GET("/docs", handlers.RenderDocs)
	r.GET("/api/health", handlers.HealthCheck)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/products", handlers.GetProducts)
		v1.POST("/orders", handlers.CreateOrder)
	}

	r.Run(":8000")
}
