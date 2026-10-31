package models

import "time"

type Product struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Barcode       string    `json:"barcode" gorm:"uniqueIndex;not null"`
	Name          string    `json:"name" gorm:"not null"`
	Category      string    `json:"category" gorm:"not null"`
	Price         int       `json:"price" gorm:"not null"`
	CostPrice     int       `json:"cost_price" gorm:"not null;default:0"`
	Stock         int       `json:"stock" gorm:"default:0"`
	MinStock      int       `json:"min_stock" gorm:"default:5"`
	Unit          string    `json:"unit" gorm:"default:'Pcs'"`
	ShelfLocation string    `json:"shelf_location"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	OriginalPrice int       `json:"original_price"`
	Tag           string    `json:"tag"`
	StockNote     string    `json:"stock_note"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ProductRequest struct {
	Barcode       string `json:"barcode" binding:"required"`
	Name          string `json:"name" binding:"required"`
	Category      string `json:"category" binding:"required"`
	Price         int    `json:"price" binding:"required"`
	CostPrice     int    `json:"cost_price"`
	Stock         int    `json:"stock"`
	MinStock      int    `json:"min_stock"`
	Unit          string `json:"unit"`
	ShelfLocation string `json:"shelf_location"`
	OriginalPrice int    `json:"original_price"`
	Tag           string `json:"tag"`
	StockNote     string `json:"stock_note"`
}
