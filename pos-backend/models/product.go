package models

import "time"

type Product struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Barcode       string    `json:"barcode" gorm:"uniqueIndex;not null"`
	Name          string    `json:"name" gorm:"not null"`
	CategoryID    *uint     `gorm:"index" json:"category_id,omitempty"`
	CategoryRef   *Category `gorm:"foreignKey:CategoryID" json:"category_ref,omitempty"`
	Brand         string    `gorm:"type:varchar(100);default:'Tidak Ada Merk'" json:"brand"`
	BrandID       *uint     `gorm:"index" json:"brand_id,omitempty"`
	BrandRef      *Brand    `gorm:"foreignKey:BrandID" json:"brand_ref,omitempty"`
	Price         int       `json:"price" gorm:"not null"`
	CostPrice     int       `json:"cost_price" gorm:"not null;default:0"`
	Stock         int       `json:"stock" gorm:"default:0"`
	MinStock      int       `json:"min_stock" gorm:"default:5"`
	Unit          string    `json:"unit" gorm:"default:'Pcs'"`
	ShelfLocation string    `json:"shelf_location"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	OriginalPrice int       `json:"original_price"`
	StockNote     string    `json:"stock_note"`
		Dimension     string    `gorm:"type:varchar(50)" json:"dimension,omitempty"`
	Origin        string    `gorm:"type:varchar(100)" json:"origin,omitempty"`
	WarrantyPeriod string   `gorm:"type:varchar(50)" json:"warranty_period,omitempty"`
	WarrantyType   string   `gorm:"type:varchar(100)" json:"warranty_type,omitempty"`
	IsCustom       *bool    `gorm:"default:false" json:"is_custom,omitempty"`
	CertNumber     string   `gorm:"type:varchar(100)" json:"cert_number,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ProductRequest struct {
	Barcode       string `json:"barcode" binding:"required"`
	Name          string `json:"name" binding:"required"`
	Category       string `json:"category"`
	CategoryID     *uint  `json:"category_id"`
	Price         int    `json:"price" binding:"required"`
	CostPrice     int    `json:"cost_price"`
	Stock         int    `json:"stock"`
	MinStock      int    `json:"min_stock"`
	Unit          string `json:"unit"`
	ShelfLocation string `json:"shelf_location"`
	OriginalPrice int    `json:"original_price"`
	StockNote     string `json:"stock_note"`
	Brand         string `json:"brand" binding:"required"`
	BrandID       *uint  `json:"brand_id"`
}
