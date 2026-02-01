// ==================== CẤU HÌNH BACKEND ====================
// Dùng localhost khi dev, dùng link Render khi deploy
const API_URL = "https://thaonhinamitea1972000-1.onrender.com";

// ==================== LOAD SẢN PHẨM ====================
async function loadProducts() {
  try {
    const res = await fetch("product.json"); // file product.json
    const products = await res.json();

    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "col-md-3 mb-4";
      div.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${p.image}" class="card-img-top" style="height:200px;object-fit:cover">
          <div class="card-body text-center">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text text-danger font-weight-bold">S: ${formatPrice(p.priceS)} | L: ${formatPrice(p.priceL)}</p>
            <button class="btn btn-success" onclick="openSizeModal('${p.id}', '${p.name.replace(/'/g, "\\'")}',   ${p.priceS},
  ${p.priceL})">
              🛒 Thêm vào giỏ
            </button>
             <br>
      <a href="https://www.facebook.com/nguyen.ngoc.thao.nhi.809045"
         target="_blank"
         style="color:#1877f2;font-size:14px;">
        📘 Liên hệ Facebook
      </a>
          </div>
        </div>
      `;
      grid.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Lỗi load product.json:", err);
  }
}
// Thêm vào giỏ hàng
// Thêm vào giỏ hàng
let cart = []
let currentProduct = {}

// 🔹 MỞ MODAL CHỌN SIZE
function openSizeModal(id, name, priceS, priceL) {
  currentProduct = { id, name, priceS, priceL }

  document.getElementById("modalProductName").innerText = name
  document.getElementById("priceS").innerText = priceS.toLocaleString()
  document.getElementById("priceL").innerText = priceL.toLocaleString()

  document.getElementById("sizeSBtn").onclick = () => addToCartWithSize("S")
  document.getElementById("sizeLBtn").onclick = () => addToCartWithSize("L")

  new bootstrap.Modal(document.getElementById("sizeModal")).show()
}

// 🔹 THÊM VÀO GIỎ THEO SIZE
async function addToCartWithSize(size) {
  const price = size === "S"
    ? currentProduct.priceS
    : currentProduct.priceL

  await fetch(`${API_URL}/api/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `${currentProduct.id}-${size}`,
      name: `${currentProduct.name} (Size ${size})`,
      price
    })
  })

  // Đóng modal chọn size
  bootstrap.Modal.getInstance(
    document.getElementById("sizeModal")
  ).hide()

  // 👉 MỞ GIỎ HÀNG (ĐÚNG HÀM)
  openCartModal()
}

// 🔹 MỞ MODAL GIỎ HÀNG
function openCartModal() {
  new bootstrap.Modal(
    document.getElementById("cartModal")
  ).show()

  loadCart() // nếu bạn có hàm render giỏ
}

// ==================== HÀM ĐỊNH DẠNG GIÁ ====================
function formatPrice(value) {
  return Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// ==================== GIỎ HÀNG ====================

// Mở popup giỏ hàng
function toggleCart() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    // Nếu bạn dùng Bootstrap 5:
    const cartModal = new bootstrap.Modal(modal);
    cartModal.show();
  } else {
    alert("Không tìm thấy phần tử #cartModal trong HTML!");
  }
  refreshCart();
}
// Cập nhật số lượng
async function updateQty(id, qty) {
  if (qty < 1) return removeFromCart(id);
  await fetch(`${API_URL}/api/cart/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty })
  });
  refreshCart();
}

// Xóa sản phẩm
async function removeFromCart(id) {
  await fetch(`${API_URL}/api/cart/${id}`, { method: "DELETE" });
  refreshCart();
}

// Lấy giỏ hàng từ backend
async function refreshCart() {
  try {
    const res = await fetch(`${API_URL}/api/cart`);
    const data = await res.json();
    updateCart(data);
  } catch (err) {
    console.error("❌ Lỗi refreshCart:", err);
  }
}

// Render giỏ hàng trong popup
function updateCart(cart) {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";
  let total = 0;

  if (!cart || cart.length === 0) {
    container.innerHTML = "<p>🛒 Giỏ hàng trống!</p>";
    document.getElementById("cartTotal").innerText = formatPrice(0);
    return;
  }

  cart.forEach(i => {
    total += i.price * i.qty;
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between align-items-center mb-2";
    row.innerHTML = `
      <div>${i.name} x${i.qty} - ${formatPrice(i.price * i.qty)}</div>
      <div>
        <button class="btn btn-sm btn-outline-secondary" onclick="updateQty('${i.id}', ${i.qty - 1})">-</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="updateQty('${i.id}', ${i.qty + 1})">+</button>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart('${i.id}')">Xóa</button>
      </div>
    `;
    container.appendChild(row);
  });

  document.getElementById("cartTotal").innerText = formatPrice(total);
}

// Thanh toán
async function checkout() {
  const hoten = document.getElementById("hoten").value.trim();
  const sdt = document.getElementById("sdt").value.trim();
  const diachi = document.getElementById("diachi").value.trim();

  if (!hoten || !sdt) {
    alert("Vui lòng nhập họ tên và số điện thoại");
    return;
  }

  // 🔥 LẤY GIỎ HÀNG TỪ BACKEND RENDER
  const res = await fetch(`${API_URL}/api/cart`);
  const cart = await res.json();

  if (!cart || cart.length === 0) {
    alert("🛒 Giỏ hàng trống");
    return;
  }

  // 🔥 GỬI ĐƠN SANG BACKEND PHP
  const send = await fetch("http://namiteacoffeeandmilktea.site/xuly_dathang.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      hoten: hoten,
      sdt: sdt,
      diachi: diachi,
      cart: cart
    })
  });

  const result = await send.json();

  if (result.status === "success") {
    alert("✅ Đặt hàng thành công!");

    // XÓA GIỎ HÀNG BÊN RENDER
    await fetch(`${API_URL}/api/cart/clear`, { method: "POST" });
    refreshCart();
  } else {
    alert("❌ Lỗi gửi đơn hàng");
  }
}
// ==================== KHI LOAD TRANG ====================
window.onload = () => {
  loadProducts();
  refreshCart();
};








