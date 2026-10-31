package models

import "time"

type Order struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	OrderCode    string    `json:"order_code" gorm:"uniqueIndex;not null"`
	CustomerName string    `json:"customer_name" gorm:"not null"`
	Phone        string    `json:"phone" gorm:"not null"`
	OrderMethod  string    `json:"order_method" gorm:"not null"`
	TotalAmount  int       `json:"total_amount" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
}

type OrderRequest struct {
	CustomerName string `json:"customer_name" binding:"required"`
	Phone        string `json:"phone" binding:"required"`
	OrderMethod  string `json:"order_method" binding:"required"`
	TotalAmount  int    `json:"total_amount" binding:"required"`
}
