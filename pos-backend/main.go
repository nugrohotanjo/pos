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
		actor := c.GetHeader("X-User-Name")
		if actor == "" {
			actor = "Fadhil"
		}
		if config.DB != nil {
			ctx := config.SetAuditUser(c.Request.Context(), actor)
			c.Request = c.Request.WithContext(ctx)
		}
		c.Next()
	})

	

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-User-Name")
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

		// Categories Master Routes
		categories := v1.Group("/categories")
		{
			categories.GET("", handlers.GetCategories)
			categories.POST("", handlers.CreateCategory)
			categories.PUT("/:id", handlers.UpdateCategory)
			categories.DELETE("/:id", handlers.DeleteCategory)
		}

		
  
		// Products & Categories
				v1.GET("/products", handlers.GetProducts)
		v1.POST("/products", handlers.CreateProduct)
		v1.PUT("/products/:barcode", handlers.UpdateProduct)
		v1.PATCH("/products/:barcode/archive", handlers.ToggleArchiveProduct)
		v1.PATCH("/products/:barcode/toggle-archive", handlers.ToggleArchiveProduct)
		v1.DELETE("/products/:barcode", handlers.DeleteProduct)
		v1.GET("/products/:barcode/audit-logs", handlers.GetProductAuditLogs)

		// Audit Logs
		v1.GET("/audit-logs", handlers.GetAuditLogs)

		// Settings Toko
		v1.GET("/settings", handlers.GetSettings)
		v1.PUT("/settings", handlers.UpdateSettings)

		// Roles
		v1.GET("/roles", handlers.GetRoles)
		v1.POST("/roles", handlers.CreateRole)
		v1.PUT("/roles/:id", handlers.UpdateRole)
		v1.PUT("/roles/:id/permissions", handlers.UpdateRolePermissions)

		// Employees
		v1.GET("/employees", handlers.GetEmployees)
		v1.POST("/employees", handlers.CreateEmployee)
		v1.PUT("/employees/:id", handlers.UpdateEmployee)
		v1.PATCH("/employees/:id/toggle-status", handlers.ToggleEmployeeStatus)

		// Auth Login
		v1.POST("/auth/login", handlers.AuthLogin)

		// Orders / POS
		v1.POST("/orders", handlers.CreateOrder)
	}

	log.Println("Server POS Backend berjalan pada port :8000")
	if err := r.Run(":8000"); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
