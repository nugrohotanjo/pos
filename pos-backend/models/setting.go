package models

import "time"

type Setting struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	AppName       string    `json:"app_name" gorm:"column:app_name"`
	StoreAddress  string    `json:"store_address" gorm:"column:store_address"`
	StorePhone    string    `json:"store_phone" gorm:"column:store_phone"`
	ReceiptFooter string    `json:"receipt_footer" gorm:"column:receipt_footer"`
	CashEnabled   bool      `json:"cash_enabled" gorm:"column:cash_enabled"`
	QrisEnabled   bool      `json:"qris_enabled" gorm:"column:qris_enabled"`
	EdcEnabled    bool      `json:"edc_enabled" gorm:"column:edc_enabled"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"column:updated_at"`
}
