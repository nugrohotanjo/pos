package models

import "time"

type AuditLog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Timestamp string    `json:"timestamp"`
	User      string    `json:"user"`
	Role      string    `json:"role"`
	Module    string    `json:"module"`
	Action    string    `json:"action"`
	Details   string    `json:"details"`
	Status    string    `json:"status" gorm:"default:'AUTO_RECORDED'"`
	CreatedAt time.Time `json:"created_at"`
}
