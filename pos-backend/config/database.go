package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"pos-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := getEnv("DB_HOST", "pos-db")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "pos_db")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatalf("Gagal terhubung ke database Postgres: %v", err)
	}

	log.Println("Berhasil terhubung ke database PostgreSQL!")

	// Auto Migration Tabel
	err = DB.AutoMigrate(&models.Product{}, &models.Order{})
	if err != nil {
		log.Fatalf("AutoMigrate gagal: %v", err)
	}

	// Seed Data Produk Awal (jika tabel masih kosong)
	var count int64
	DB.Model(&models.Product{}).Count(&count)
	if count == 0 {
		initialProducts := []models.Product{
			{
				Name:          "Rak Bumbu Gantung Tempel Dapur Tanpa Bor",
				Category:      "Dapur & Masak",
				Price:         35000,
				OriginalPrice: 49000,
				Tag:           "Best Seller Toko",
				StockNote:     "Sisa 8 di rak kasir",
				CreatedAt:     time.Now(),
			},
			{
				Name:          "Lampu Tidur LED Sensor Gerak Otomatis Charge USB",
				Category:      "Perabot & Kamar",
				Price:         35000,
				OriginalPrice: 55000,
				Tag:           "Viral Offline",
				StockNote:     "Paling dicari ibu-ibu",
				CreatedAt:     time.Now(),
			},
			{
				Name:          "Botol Minum Motivasi 2 Liter Gradasi Aesthetic",
				Category:      "Alat Rumah Tangga",
				Price:         35000,
				OriginalPrice: 45000,
				Tag:           "Stok Baru",
				StockNote:     "Tersedia warna ungu & tosca",
				CreatedAt:     time.Now(),
			},
		}
		DB.Create(&initialProducts)
		log.Println("Seed data produk awal berhasil dimasukkan!")
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
