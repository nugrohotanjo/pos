package models

import "time"

type Product struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Name          string    `json:"name" gorm:"not null"`
	Category      string    `json:"category"`
	Price         int       `json:"price" gorm:"not null"`
	OriginalPrice int       `json:"original_price"`
	Tag           string    `json:"tag"`
	StockNote     string    `json:"stock_note"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
