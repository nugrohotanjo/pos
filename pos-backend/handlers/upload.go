package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// Allowed MIME types
var allowedMIMETypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

func generateSecureFilename(ext string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("prod_%d_%s%s", time.Now().Unix(), hex.EncodeToString(b), ext)
}

// UploadProductImage menangani upload gambar mandiri dengan inspeksi magic byte
func UploadProductImage(c *gin.Context) {
	// Batasi ukuran request (maksimal 5MB per upload)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 5<<20)

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "File gambar tidak ditemukan: " + err.Error()})
		return
	}
	defer file.Close()

	// Sniff 512 bytes pertama untuk deteksi MIME tipe asli (cegah file executable palsu)
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal membaca file"})
		return
	}
	mimeType := http.DetectContentType(buffer[:n])

	ext, ok := allowedMIMETypes[mimeType]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Format file tidak didukung (%s). Hanya JPG, PNG, dan WebP yang diizinkan.", mimeType),
		})
		return
	}

	// Kembalikan cursor file ke awal
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal memproses file"})
		return
	}

	// Buat direktori jika belum ada
	uploadDir := "./uploads/products"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menyiapkan direktori penyimpanan"})
		return
	}

	newFilename := generateSecureFilename(ext)
	destPath := filepath.Join(uploadDir, newFilename)

	out, err := os.Create(destPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menyimpan file"})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Gagal menulis file"})
		return
	}

	// URL relatif yang disajikan via web server
	imageURL := "/uploads/products/" + newFilename
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"url":      imageURL,
			"filename": newFilename,
			"size":     header.Size,
		},
	})
}
