package models

import "time"

type AuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Module    string    `gorm:"size:50;not null" json:"module"`
	Action    string    `gorm:"size:50;not null" json:"action"`
	User      string    `gorm:"size:100;not null" json:"user"`
	Details   string    `gorm:"type:text" json:"details"`
	OldValues string    `gorm:"type:text" json:"old_values,omitempty"`
	NewValues string    `gorm:"type:text" json:"new_values,omitempty"`
	Timestamp string    `gorm:"size:50;not null" json:"timestamp"`
	CreatedAt time.Time `json:"created_at"`
}
