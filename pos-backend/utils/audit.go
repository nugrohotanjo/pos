package utils

import (
	"encoding/json"
	"time"

	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

// GetActorName mengambil nama actor dari Header HTTP, Query, atau Context
func GetActorName(c *gin.Context, fallbackActor string) string {
	if fallbackActor != "" && fallbackActor != "Staff" && fallbackActor != "Sistem" {
		return fallbackActor
	}
	actor := c.GetHeader("X-User-Name")
	if actor != "" {
		return actor
	}
	if val, exists := c.Get("user_name"); exists {
		if s, ok := val.(string); ok && s != "" {
			return s
		}
	}
	if fallbackActor != "" {
		return fallbackActor
	}
	return "Fadhil"
}

// RecordAudit menyimpan log audit trail lengkap dengan snapshot forensic diff
func RecordAudit(c *gin.Context, module string, action string, details string, oldSnap interface{}, newSnap interface{}, actorHint ...string) {
	hint := ""
	if len(actorHint) > 0 {
		hint = actorHint[0]
	}
	actor := GetActorName(c, hint)

	var oldStr, newStr string
	if oldSnap != nil {
		if b, err := json.Marshal(oldSnap); err == nil {
			oldStr = string(b)
		}
	}
	if newSnap != nil {
		if b, err := json.Marshal(newSnap); err == nil {
			newStr = string(b)
		}
	}

	entry := models.AuditLog{
		Module:    module,
		Action:    action,
		User:      actor,
		Details:   details,
		OldValues: oldStr,
		NewValues: newStr,
		Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
	}

	go func(log models.AuditLog) {
		if config.DB != nil {
			config.DB.Create(&log)
		}
	}(entry)
}
