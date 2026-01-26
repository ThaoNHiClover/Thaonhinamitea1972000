<script>
function orderProduct(name, size, price) {
  const customerName = prompt("Tên của bạn:");
  const phone = prompt("Số điện thoại:");
  const address = prompt("Địa chỉ giao hàng:");

  fetch("http://localhost:3000/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productName: name,
      size: size,
      price: price,
      customerName: customerName,
      phone: phone,
      address: address
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
  })
  .catch(err => {
    alert("❌ Lỗi đặt hàng");
    console.error(err);
  });
}
</script>
