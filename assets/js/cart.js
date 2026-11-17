/* ===== COFFEEHOUSE – cart.js: trang giỏ hàng ===== */
function renderCart() {
  const t = calcTotals(), has = t.items.length > 0;
  $("#cartFull").classList.toggle("hidden", !has);
  $("#cartEmpty").classList.toggle("hidden", has);
  if (!has) return;
  $("#cartBody").innerHTML = t.items.map(({ p, qty }) => `<tr>
    <td class="prod-cell"><div class="cart-prod"><img src="${p.image}" alt="${esc(p.name)}"><a href="product-detail.html?id=${p.id}">${esc(p.name)}</a></div></td>
    <td data-label="Đơn giá">${fmt(priceOf(p))}</td>
    <td data-label="Số lượng"><div class="qty"><button data-dec="${p.id}" aria-label="Giảm">−</button><input type="number" min="1" max="99" value="${qty}" data-qty="${p.id}" aria-label="Số lượng"><button data-inc="${p.id}" aria-label="Tăng">+</button></div></td>
    <td data-label="Thành tiền"><strong>${fmt(priceOf(p) * qty)}</strong></td>
    <td data-label="Xóa"><button class="remove-btn" data-rm="${p.id}" aria-label="Xóa sản phẩm"><i class="fa-solid fa-trash-can"></i></button></td></tr>`).join("");
  $("#sumSub").textContent = fmt(t.subtotal);
  $("#sumDiscount").textContent = t.discount ? "− " + fmt(t.discount) : "0 VNĐ";
  $("#sumShip").textContent = t.shipping ? fmt(t.shipping) : "Miễn phí";
  $("#sumTotal").textContent = fmt(t.total);
  $("#couponMsg").textContent = t.code ? "Đang áp dụng: " + t.code + " – " + COUPONS[t.code].label : "Mã có sẵn: COFFEE10, WELCOME50, FREESHIP";
  $("#couponInput").value = t.code;
}
$("#cartBody").addEventListener("click", e => {
  const g = a => e.target.closest(`[${a}]`);
  if (g("data-inc")) { const id = g("data-inc").dataset.inc; Cart.setQty(id, Cart.get().find(i => i.id == id).qty + 1); }
  else if (g("data-dec")) { const id = g("data-dec").dataset.dec; Cart.setQty(id, Cart.get().find(i => i.id == id).qty - 1); }
  else if (g("data-rm")) { Cart.remove(g("data-rm").dataset.rm); toast("Đã xóa sản phẩm khỏi giỏ hàng"); }
  else return;
  renderCart();
});
$("#cartBody").addEventListener("change", e => { if (e.target.dataset.qty) { Cart.setQty(e.target.dataset.qty, parseInt(e.target.value) || 1); renderCart(); } });
$("#clearCart").addEventListener("click", () => { if (confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?")) { Cart.clear(); renderCart(); toast("Đã xóa toàn bộ giỏ hàng"); } });
$("#couponForm").addEventListener("submit", e => {
  e.preventDefault(); const code = $("#couponInput").value.trim().toUpperCase();
  if (!code) { LS.set("ch_coupon", ""); renderCart(); return toast("Đã gỡ mã giảm giá"); }
  if (!COUPONS[code]) return toast("Mã giảm giá không hợp lệ", "error");
  LS.set("ch_coupon", code); renderCart(); toast("Áp dụng mã " + code + " thành công");
});
renderCart();
