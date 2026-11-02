package models

import (
	"time"
)

type Category struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	Name        string      `gorm:"type:varchar(100);not null" json:"name"`
	Slug        string      `gorm:"type:varchar(120);uniqueIndex;not null" json:"slug"`
	Description string      `gorm:"type:text" json:"description"`
	ParentID    *uint       `gorm:"index" json:"parent_id"`
	Parent      *Category   `gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"parent,omitempty"`
	Children    []Category  `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	IsActive    bool        `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}
