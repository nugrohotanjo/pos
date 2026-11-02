package models

import "time"

type Role struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"column:name"`
	Description string    `json:"description" gorm:"column:description"`
	IsSystem    bool      `json:"is_system" gorm:"column:is_system"`
	Permissions string    `json:"permissions" gorm:"column:permissions;type:jsonb"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at"`
}

type Employee struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"column:name"`
	Username  string    `json:"username" gorm:"column:username;uniqueIndex"`
	Pin       string    `json:"pin" gorm:"column:pin"`
	RoleID    string    `json:"role_id" gorm:"column:role_id"`
	Phone     string    `json:"phone" gorm:"column:phone"`
	IsActive  bool      `json:"is_active" gorm:"column:is_active"`
	TokenVersion int    `gorm:"column:token_version;default:1" json:"token_version"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
}
