package handlers

import (
	"fmt"
	"net/http"
	"time"
	"pos-backend/config"
	"pos-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	var req models.OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	orderCode := fmt.Sprintf("TRX-%s", time.Now().Format("20060102150405"))

	order := models.Order{
		OrderCode:    orderCode,
		CustomerName: req.CustomerName,
		Phone:        req.Phone,
		OrderMethod:  req.OrderMethod,
		TotalAmount:  req.TotalAmount,
	}

	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Gagal menyimpan transaksi ke database",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success":    true,
		"message":    "Pesanan berhasil dibuat dan tersimpan di database",
		"order_code": order.OrderCode,
		"data":       order,
	})
}
