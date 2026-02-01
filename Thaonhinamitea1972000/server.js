
require("dotenv").config()

const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const connectDB = require("../config/db.js")
const Product = require("./models/Product")

const app = express()

// 🔗 Kết nối MongoDB (QUAN TRỌNG)
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// 🛒 Giỏ hàng (lưu tạm RAM)
let cart = []

// 📦 API lấy danh sách sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    // 👉 Nếu CHƯA dùng MongoDB, dùng JSON
    const filePath = path.join(__dirname, "product.json")
    const data = fs.readFileSync(filePath, "utf8")
    res.json(JSON.parse(data))

    // 👉 Nếu MUỐN dùng MongoDB thì mở dòng dưới
    // const products = await Product.find()
    // res.json(products)

  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm" })
  }
})

// ➕ Thêm vào giỏ hàng
app.post("/api/cart/add", (req, res) => {
  let { id, name, price } = req.body
  id = String(id)

  const item = cart.find(i => i.id === id)
  if (item) {
    item.qty++
  } else {
    cart.push({ id, name, price, qty: 1 })
  }

  res.json({ success: true, cart })
})

// 🔄 Cập nhật số lượng
app.put("/api/cart/:id", (req, res) => {
  const id = String(req.params.id)
  const { qty } = req.body

  const item = cart.find(i => i.id === id)
  if (!item) {
    return res.status(404).json({ success: false, msg: "Không tìm thấy sản phẩm" })
  }

  item.qty = Math.max(1, qty)
  res.json({ success: true, cart })
})

// ❌ Xóa 1 sản phẩm
app.delete("/api/cart/:id", (req, res) => {
  const id = String(req.params.id)
  cart = cart.filter(i => i.id !== id)
  res.json({ success: true, cart })
})

// 🧹 Xóa toàn bộ giỏ hàng
app.post("/api/cart/clear", (req, res) => {
  cart = []
  res.json({ success: true, cart })
})

// 📦 Xem giỏ hàng
app.get("/api/cart", (req, res) => {
  res.json(cart)
})

// 📬 Liên hệ
app.post("/api/contact", (req, res) => {
  const { email, phone, message } = req.body
  console.log("📩 Liên hệ:", { email, phone, message })

  res.json({
    success: true,
    msg: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm."
  })
})

// 🚀 Chạy server (CHỈ 1 LẦN)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
})

