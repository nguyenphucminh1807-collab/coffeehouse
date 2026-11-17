/* ===== COFFEEHOUSE – checkout.js: thanh toán và tạo đơn hàng (mô phỏng) ===== */
const t0 = calcTotals();
if (!t0.items.length) { $("#checkoutFull").classList.add("hidden"); $("#checkoutEmpty").classList.remove("hidden"); }
const u = currentUser();
if (u) { $("#coName").value = u.name || ""; $("#coEmail").value = u.email || ""; $("#coPhone").value = u.phone || ""; }

function renderSummary() {
  const t = calcTotals();
  $("#miniList").innerHTML = t.items.map(({ p, qty }) => `<div class="mini-item"><img src="${p.image}" alt="${esc(p.name)}"><span>${esc(p.name)} × ${qty}</span><span>${fmt(priceOf(p) * qty)}</span></div>`).join("");
  $("#sumSub").textContent = fmt(t.subtotal);
  $("#sumDiscount").textContent = t.discount ? "− " + fmt(t.discount) : "0 VNĐ";
  $("#sumShip").textContent = t.shipping ? fmt(t.shipping) : "Miễn phí";
  $("#sumTotal").textContent = fmt(t.total);
  $("#couponMsg").textContent = t.code ? "Đang áp dụng: " + t.code : "Chưa áp dụng mã giảm giá";
}
$("#couponForm").addEventListener("submit", e => {
  e.preventDefault(); const code = $("#couponInput").value.trim().toUpperCase();
  if (code && !COUPONS[code]) return toast("Mã giảm giá không hợp lệ", "error");
  LS.set("ch_coupon", code); renderSummary(); toast(code ? "Áp dụng mã " + code + " thành công" : "Đã gỡ mã giảm giá");
});
$$("input[name=pay]").forEach(r => r.addEventListener("change", () => $("#bankBox").classList.toggle("hidden", r.value !== "bank" || !r.checked)));

$("#checkoutForm").addEventListener("submit", e => {
  e.preventDefault(); clearErrs(e.target);
  const f = { name: $("#coName"), phone: $("#coPhone"), email: $("#coEmail"), address: $("#coAddress") }; let ok = true;
  const bad = (i, m) => { setErr(i, m); ok = false; };
  if (f.name.value.trim().length < 2) bad(f.name, "Vui lòng nhập họ tên (ít nhất 2 ký tự)");
  if (!isPhone(f.phone.value)) bad(f.phone, "Số điện thoại gồm 10 số, bắt đầu bằng 0 (hoặc +84)");
  if (!isEmail(f.email.value.trim())) bad(f.email, "Email chưa hợp lệ, ví dụ ten@email.com");
  if (f.address.value.trim().length < 8) bad(f.address, "Vui lòng nhập địa chỉ giao hàng đầy đủ");
  if (!ok) return toast("Vui lòng kiểm tra lại thông tin", "error");
  const t = calcTotals(); if (!t.items.length) return;
  const d = new Date(), pad = n => String(n).padStart(2, "0");
  const id = "CH" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + Math.floor(1000 + Math.random() * 9000);
  const orders = LS.get("ch_orders", []);
  orders.unshift({ id, date: d.toISOString(), customer: { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), address: f.address.value.trim(), note: $("#coNote").value.trim() },
    payment: $("input[name=pay]:checked").value, items: t.items.map(i => ({ id: i.id, name: i.p.name, qty: i.qty, price: priceOf(i.p) })),
    subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, total: t.total, coupon: t.code });
  LS.set("ch_orders", orders);
  Cart.clear();
  $("#checkoutFull").classList.add("hidden");
  $("#orderCode").textContent = id; $("#orderTotal").textContent = fmt(t.total);
  $("#orderPay").textContent = $("input[name=pay]:checked").value === "bank" ? "Vui lòng chuyển khoản theo thông tin đã cung cấp, ghi mã đơn hàng ở nội dung." : "Bạn thanh toán khi nhận hàng (COD).";
  $("#orderSuccess").classList.remove("hidden"); window.scrollTo({ top: 0, behavior: "smooth" });
});
renderSummary();
