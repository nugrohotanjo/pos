package main

import (
	"log"
	"net/http"

	"pos-backend/config"
	"pos-backend/handlers"

	"github.com/gin-gonic/gin"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-User-Name")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	config.ConnectDatabase()

	r := gin.Default()
	r.Static("/uploads", "./uploads")
	r.Use(corsMiddleware())
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

	r.GET("/api/health", handlers.HealthCheck)

	v1 := r.Group("/api/v1")
	{
		// 1. PUBLIC AUTH ROUTE (Tanpa Proteksi)
		v1.POST("/auth/login", handlers.AuthLogin)
		v1.POST("/products/upload-image", handlers.UploadProductImage)

		// 2. PROTECTED ROUTES (Wajib JWT Cookie/Bearer Valid + Device Binding + Token Version)
		protected := v1.Group("")
		protected.Use(handlers.RequireAuth())
		{
			// Auth Sessions
			protected.GET("/auth/me", handlers.AuthMe)
			protected.POST("/auth/logout", handlers.AuthLogout)

			// Categories
			categories := protected.Group("/categories")
			{
				categories.GET("", handlers.GetCategories)
				categories.POST("", handlers.CreateCategory)
				categories.PUT("/:id", handlers.UpdateCategory)
				categories.DELETE("/:id", handlers.DeleteCategory)
			}

			// Brands & Products
			protected.GET("/brands", handlers.GetBrands)
			protected.POST("/brands", handlers.CreateBrand)
			protected.DELETE("/brands/:id", handlers.DeleteBrand)

			protected.GET("/shelves", handlers.GetShelves)
			protected.POST("/shelves", handlers.CreateShelf)
			protected.DELETE("/shelves/:id", handlers.DeleteShelf)
			protected.GET("/products", handlers.GetProducts)
			protected.GET("/products/:barcode", handlers.GetProductByBarcode)
			protected.POST("/products", handlers.CreateProduct)
			protected.PUT("/products/:barcode", handlers.UpdateProduct)
			protected.PATCH("/products/:barcode/archive", handlers.ToggleArchiveProduct)
			protected.PATCH("/products/:barcode/toggle-archive", handlers.ToggleArchiveProduct)
			protected.DELETE("/products/:barcode", handlers.DeleteProduct)
			protected.GET("/products/:barcode/audit-logs", handlers.GetProductAuditLogs)

			// Audit Logs
			protected.GET("/audit-logs", handlers.GetAuditLogs)

			// Settings Toko
			protected.GET("/settings", handlers.GetSettings)
			protected.PUT("/settings", handlers.UpdateSettings)

			// Roles
			protected.GET("/roles", handlers.GetRoles)
			protected.POST("/roles", handlers.CreateRole)
			protected.PUT("/roles/:id", handlers.UpdateRole)
			protected.PUT("/roles/:id/permissions", handlers.UpdateRolePermissions)

			// Employees
			protected.GET("/employees", handlers.GetEmployees)
			protected.POST("/employees", handlers.CreateEmployee)
			protected.PUT("/employees/:id", handlers.UpdateEmployee)
			protected.PATCH("/employees/:id/toggle-status", handlers.ToggleEmployeeStatus)

			// Orders / Kasir POS
			protected.POST("/orders", handlers.CreateOrder)
		}
	}

	log.Println("Server POS Backend berjalan pada port :8000")
	if err := r.Run(":8000"); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
