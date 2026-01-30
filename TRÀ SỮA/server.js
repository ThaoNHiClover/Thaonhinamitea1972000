const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// file lưu đơn
const ORDER_FILE = "./orders.json";

// tạo file nếu chưa có
if (!fs.existsSync(ORDER_FILE)) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify([]));
}

// API đặt hàng
app.post("/api/order", (req, res) => {
  const { productName, size, price, customerName, phone, address } = req.body;

  if (!productName || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
  }

  const newOrder = {
    id: Date.now(),
    productName,
    size,
    price,
    customerName,
    phone,
    address,
    createdAt: new Date()
  };

  const orders = JSON.parse(fs.readFileSync(ORDER_FILE));
  orders.push(newOrder);
  fs.writeFileSync(ORDER_FILE, JSON.stringify(orders, null, 2));

  res.json({
    message: "🎉 Đặt hàng thành công!",
    order: newOrder
  });
});

// xem danh sách đơn (admin)
app.get("/api/orders", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDER_FILE));
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
