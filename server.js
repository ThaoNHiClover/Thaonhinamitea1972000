const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Giỏ hàng lưu tạm trong bộ nhớ (RAM)
let cart = [];

// 🧪 Route kiểm tra server
app.get("/", (req, res) => {
  res.send("✅ Backend giỏ hàng đang hoạt động!");
});

// ➕ Thêm vào giỏ hàng
app.post("/api/cart/add", (req, res) => {
  let { id, name, price } = req.body;
  id = String(id); // ép kiểu tránh lỗi
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  res.json({ success: true, cart });
});

// 🔄 Cập nhật số lượng
app.put("/api/cart/:id", (req, res) => {
  const id = String(req.params.id);
  const { qty } = req.body;
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    return res.json({ success: true, cart });
  }
  res.status(404).json({ success: false, msg: "Không tìm thấy sản phẩm" });
});

// ❌ Xóa sản phẩm
app.delete("/api/cart/:id", (req, res) => {
  const id = String(req.params.id);
  cart = cart.filter(i => i.id !== id);
  res.json({ success: true, cart });
});

// 🧹 Xóa toàn bộ giỏ hàng
app.post("/api/cart/clear", (req, res) => {
  cart = [];
  res.json({ success: true, cart });
});

// 📦 Xem giỏ hàng
app.get("/api/cart", (req, res) => {
  res.json(cart);
});

// 📬 Liên hệ
app.post("/api/contact", (req, res) => {
  const { email, phone, message } = req.body;
  console.log("📩 Liên hệ từ:", { email, phone, message });
  res.json({ success: true, msg: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm." });
});

// 🚀 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});