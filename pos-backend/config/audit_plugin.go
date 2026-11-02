package config

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"time"

	"pos-backend/models"

	"gorm.io/gorm"
)

type auditCtxKey string

const (
	AuditUserKey   auditCtxKey = "audit_user"
	auditOldValKey             = "audit:old_values"
)

// SetAuditUser menyisipkan nama actor ke context GORM
func SetAuditUser(ctx context.Context, user string) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithValue(ctx, AuditUserKey, user)
}

func getAuditActor(statement *gorm.Statement) string {
	if statement.Context != nil {
		if u, ok := statement.Context.Value(AuditUserKey).(string); ok && u != "" {
			return u
		}
	}
	return "Fadhil"
}

func resolveModuleName(statement *gorm.Statement) string {
	tableName := ""
	if statement.Schema != nil {
		tableName = statement.Schema.Table
	}
	if tableName == "" {
		tableName = statement.Table
	}
	if tableName == "" {
		return "SYSTEM"
	}
	return strings.ToUpper(tableName)
}

func structToMap(obj interface{}) map[string]interface{} {
	out := make(map[string]interface{})
	val := reflect.Indirect(reflect.ValueOf(obj))
	if val.Kind() != reflect.Struct {
		return out
	}
	typ := val.Type()
	for i := 0; i < val.NumField(); i++ {
		f := typ.Field(i)
		tag := f.Tag.Get("json")
		if tag == "-" || tag == "" {
			tag = strings.ToLower(f.Name)
		} else {
			tag = strings.Split(tag, ",")[0]
		}
		if f.Name != "CreatedAt" && f.Name != "UpdatedAt" && f.Name != "DeletedAt" {
			out[tag] = val.Field(i).Interface()
		}
	}
	return out
}

func RegisterAuditPlugin(db *gorm.DB) error {
	// 1. Hook Sebelum Update: Ambil snapshot data lama (OldValues)
	_ = db.Callback().Update().Before("gorm:update").Register("audit:before_update", func(tx *gorm.DB) {
		if tx.Statement.Table == "audit_logs" || tx.Statement.Schema == nil || tx.Statement.Schema.Table == "audit_logs" {
			return
		}
	if skip, ok := tx.Get("gorm:skip_audit"); ok && skip == true {
		return
	}
	if tx.Statement.Table == "products" || (tx.Statement.Schema != nil && tx.Statement.Schema.Table == "products") {
		return
	}

		if tx.Statement.Schema == nil {
			return
		}

		// Ambil primary key value
		pkField := tx.Statement.Schema.PrioritizedPrimaryField
		if pkField == nil {
			return
		}

		pkVal, _ := pkField.ValueOf(tx.Statement.Context, tx.Statement.ReflectValue)
		if pkVal == nil || pkVal == 0 || pkVal == "" {
			return
		}

		// Query record existing dari database sebagai OldValues
		destModel := reflect.New(tx.Statement.Schema.ModelType).Interface()
		if err := db.Session(&gorm.Session{NewDB: true}).Table(tx.Statement.Schema.Table).First(destModel, pkVal).Error; err == nil {
			tx.Set(auditOldValKey, structToMap(destModel))
		}
	})

	// 2. Hook Setelah Create
	_ = db.Callback().Create().After("gorm:create").Register("audit:after_create", func(tx *gorm.DB) {
		if tx.Statement.Table == "audit_logs" || tx.Statement.Schema == nil || tx.Statement.Schema.Table == "audit_logs" {
			return
		}
	if skip, ok := tx.Get("gorm:skip_audit"); ok && skip == true {
		return
	}
	if tx.Statement.Table == "products" || (tx.Statement.Schema != nil && tx.Statement.Schema.Table == "products") {
		return
	}


		actor := getAuditActor(tx.Statement)
		module := resolveModuleName(tx.Statement)
		newVals, _ := json.Marshal(structToMap(tx.Statement.Dest))

		log := models.AuditLog{
			Module:    module,
			Action:    "CREATE",
			User:      actor,
			Details:   fmt.Sprintf("Menambahkan data baru pada modul %s", module),
			NewValues: string(newVals),
			Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
		}

		go func(e models.AuditLog) {
			db.Session(&gorm.Session{NewDB: true}).Create(&e)
		}(log)
	})

	// 3. Hook Setelah Update
	_ = db.Callback().Update().After("gorm:update").Register("audit:after_update", func(tx *gorm.DB) {
		if tx.Statement.Table == "audit_logs" || tx.Statement.Schema == nil || tx.Statement.Schema.Table == "audit_logs" {
			return
		}
	if skip, ok := tx.Get("gorm:skip_audit"); ok && skip == true {
		return
	}
	if tx.Statement.Table == "products" || (tx.Statement.Schema != nil && tx.Statement.Schema.Table == "products") {
		return
	}


		actor := getAuditActor(tx.Statement)
		module := resolveModuleName(tx.Statement)

		var oldValsMap map[string]interface{}
		if v, ok := tx.Get(auditOldValKey); ok {
			oldValsMap, _ = v.(map[string]interface{})
		}

		newValsMap := structToMap(tx.Statement.Dest)
		oldJSON, _ := json.Marshal(oldValsMap)
		newJSON, _ := json.Marshal(newValsMap)

		log := models.AuditLog{
			Module:    module,
			Action:    "UPDATE",
			User:      actor,
			Details:   fmt.Sprintf("Memperbarui data pada modul %s", module),
			OldValues: string(oldJSON),
			NewValues: string(newJSON),
			Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
		}

		go func(e models.AuditLog) {
			db.Session(&gorm.Session{NewDB: true}).Create(&e)
		}(log)
	})

	// 4. Hook Setelah Delete
	_ = db.Callback().Delete().After("gorm:delete").Register("audit:after_delete", func(tx *gorm.DB) {
		if tx.Statement.Table == "audit_logs" || tx.Statement.Schema == nil || tx.Statement.Schema.Table == "audit_logs" {
			return
		}
	if skip, ok := tx.Get("gorm:skip_audit"); ok && skip == true {
		return
	}
	if tx.Statement.Table == "products" || (tx.Statement.Schema != nil && tx.Statement.Schema.Table == "products") {
		return
	}


		actor := getAuditActor(tx.Statement)
		module := resolveModuleName(tx.Statement)

		log := models.AuditLog{
			Module:    module,
			Action:    "DELETE",
			User:      actor,
			Details:   fmt.Sprintf("Menghapus data pada modul %s", module),
			Timestamp: time.Now().Format("02 Jan 2006, 15:04:05"),
		}

		go func(e models.AuditLog) {
			db.Session(&gorm.Session{NewDB: true}).Create(&e)
		}(log)
	})

	return nil
}
