package models

import (
	"encoding/json"
	"time"
)

type ProductVariantType struct {
	ID        uint            `json:"id" gorm:"primaryKey"`
	ProductID uint            `json:"product_id" gorm:"not null;index"`
	Name      string          `json:"name" gorm:"type:varchar(100);not null"`
	Options   json.RawMessage `json:"options" gorm:"type:jsonb;default:'[]'"`
	SortOrder int             `json:"sort_order" gorm:"default:0"`
}

type ProductVariant struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	ProductID    uint      `json:"product_id" gorm:"not null;index"`
	SkuCode      string    `json:"sku_code" gorm:"type:varchar(100);uniqueIndex"`
	Barcode      string    `json:"barcode" gorm:"type:varchar(100);index"`
	Option1Value string    `json:"option1_value" gorm:"type:varchar(100)"`
	Option2Value string    `json:"option2_value" gorm:"type:varchar(100)"`
	Price        float64       `json:"price" gorm:"not null;default:0"`
	CostPrice    float64       `json:"cost_price" gorm:"default:0"`
	Stock        int       `json:"stock" gorm:"default:0"`
	ImageURL     string    `json:"image_url" gorm:"type:text"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ProductWholesalePrice struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProductID uint      `json:"product_id" gorm:"not null;index"`
	VariantID *uint     `json:"variant_id,omitempty" gorm:"index"`
	MinQty    int       `json:"min_qty" gorm:"not null"`
	MaxQty    *int      `json:"max_qty,omitempty"`
	UnitPrice float64       `json:"unit_price" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

type Product struct {
	ID              uint                    `json:"id" gorm:"primaryKey"`
	Barcode         string                  `json:"barcode" gorm:"uniqueIndex;not null"`
	Name            string                  `json:"name" gorm:"not null"`
	CategoryID      *uint                   `gorm:"index" json:"category_id,omitempty"`
	CategoryRef     *Category               `gorm:"foreignKey:CategoryID" json:"category_ref,omitempty"`
	Brand           string                  `gorm:"type:varchar(100);default:'Tidak Ada Merk'" json:"brand"`
	BrandID         *uint                   `gorm:"index" json:"brand_id,omitempty"`
	BrandRef        *Brand                  `gorm:"foreignKey:BrandID" json:"brand_ref,omitempty"`
	Price           float64                     `json:"price" gorm:"not null"`
	CostPrice       float64                     `json:"cost_price" gorm:"not null;default:0"`
	Stock           int                     `json:"stock" gorm:"default:0"`
	MinStock        int                     `json:"min_stock" gorm:"default:5"`
	Unit            string                  `json:"unit" gorm:"default:'Pcs'"`
	ShelfLocation   string                  `json:"shelf_location"`
	IsActive        bool                    `json:"is_active" gorm:"default:true"`
	OriginalPrice   float64                     `json:"original_price"`
	StockNote       string                  `json:"stock_note"`
	Dimension       string                  `gorm:"type:varchar(50)" json:"dimension,omitempty"`
	Origin          string                  `gorm:"type:varchar(100)" json:"origin,omitempty"`
	WarrantyPeriod  string                  `gorm:"type:varchar(50)" json:"warranty_period,omitempty"`
	WarrantyType    string                  `gorm:"type:varchar(100)" json:"warranty_type,omitempty"`
	IsCustom        *bool                   `gorm:"default:false" json:"is_custom,omitempty"`
	CertNumber      string                  `gorm:"type:varchar(100)" json:"cert_number,omitempty"`
	HasVariant      bool                    `gorm:"default:false" json:"has_variant"`
	VariantTypes    []ProductVariantType    `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"variant_types,omitempty"`
	Variants        []ProductVariant        `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"variants,omitempty"`
	WholesalePrices []ProductWholesalePrice `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"wholesale_prices,omitempty"`
	CreatedAt       time.Time               `json:"created_at"`
	UpdatedAt       time.Time               `json:"updated_at"`
}

type VariantTypeInput struct {
	Name      string   `json:"name"`
	Options   []string `json:"options"`
	SortOrder int      `json:"sort_order"`
}

type VariantItemInput struct {
	SkuCode      string `json:"sku_code"`
	Barcode      string `json:"barcode"`
	Option1Value string `json:"option1_value"`
	Option2Value string `json:"option2_value"`
	Price        float64    `json:"price"`
	CostPrice    float64    `json:"cost_price"`
	Stock        int    `json:"stock"`
	ImageURL     string `json:"image_url"`
}

type WholesalePriceInput struct {
	VariantID *uint `json:"variant_id"`
	MinQty    int   `json:"min_qty"`
	MaxQty    *int  `json:"max_qty"`
	UnitPrice float64   `json:"unit_price"`
}

type ProductRequest struct {
	Barcode         string                `json:"barcode" binding:"required"`
	Name            string                `json:"name" binding:"required"`
	Category        string                `json:"category"`
	CategoryID      *uint                 `json:"category_id"`
	Price           float64                   `json:"price"`
	CostPrice       float64                   `json:"cost_price"`
	Stock           int                   `json:"stock"`
	MinStock        int                   `json:"min_stock"`
	Unit            string                `json:"unit"`
	ShelfLocation   string                `json:"shelf_location"`
	OriginalPrice   float64                   `json:"original_price"`
	StockNote       string                `json:"stock_note"`
	Brand           string                `json:"brand"`
	BrandID         *uint                 `json:"brand_id"`
	Dimension       string                `json:"dimension"`
	Origin          string                `json:"origin"`
	WarrantyPeriod  string                `json:"warranty_period"`
	WarrantyType    string                `json:"warranty_type"`
	CertNumber      string                `json:"cert_number"`
	HasVariant      bool                  `json:"has_variant"`
	VariantTypes    []VariantTypeInput    `json:"variant_types"`
	Variants        []VariantItemInput    `json:"variants"`
	WholesalePrices []WholesalePriceInput `json:"wholesale_prices"`
}
