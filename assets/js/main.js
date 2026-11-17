/* ===== COFFEEHOUSE – main.js: tiện ích chung, giỏ hàng, header/footer, trang chủ ===== */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
const priceOf = p => (p.sale > 0 ? p.sale : p.price);
const findProduct = id => PRODUCTS.find(p => p.id === Number(id));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = d => new Date(d).toLocaleDateString("vi-VN");
const stars = r => {
  let h = "";
  for (let i = 1; i <= 5; i++) h += r >= i ? '<i class="fa-solid fa-star"></i>' : r >= i - 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>' : '<i class="fa-regular fa-star"></i>';
  return `<span class="stars" aria-label="${r} trên 5 sao">${h}</span>`;
};

/* ---------- Thông báo ---------- */
function toast(msg, type = "ok") {
  const w = $("#toast-wrap"); if (!w) return;
  const t = document.createElement("div");
  t.className = "toast " + (type === "error" ? "error" : ""); t.textContent = msg; w.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ---------- Kiểm tra form ---------- */
function setErr(input, msg) {
  const f = input.closest(".field"); if (!f) return;
  f.classList.toggle("invalid", !!msg);
  const e = f.querySelector(".err"); if (e) e.textContent = msg || "";
}
const clearErrs = form => $$("input,textarea", form).forEach(i => setErr(i, ""));
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = v => /^(0|\+84)\d{9}$/.test(v.replace(/\s/g, ""));

/* ---------- Giỏ hàng (LocalStorage) ---------- */
const COUPONS = {
  COFFEE10: { type: "percent", value: 10, label: "Giảm 10% tổng đơn" },
  WELCOME50: { type: "amount", value: 50000, label: "Giảm 50.000 VNĐ" },
  FREESHIP: { type: "ship", value: 0, label: "Miễn phí vận chuyển" }
};
const SHIP_FEE = 30000, FREE_SHIP_FROM = 500000;
const Cart = {
  get: () => LS.get("ch_cart", []),
  save(c) { LS.set("ch_cart", c); updateBadge(); },
  add(id, qty = 1) {
    const c = this.get(), it = c.find(i => i.id === Number(id));
    if (it) it.qty = Math.min(99, it.qty + qty); else c.push({ id: Number(id), qty });
    this.save(c);
  },
  setQty(id, qty) { const c = this.get(), it = c.find(i => i.id === Number(id)); if (it) { it.qty = Math.max(1, Math.min(99, qty)); this.save(c); } },
  remove(id) { this.save(this.get().filter(i => i.id !== Number(id))); },
  clear() { this.save([]); LS.set("ch_coupon", ""); },
  count: () => Cart.get().reduce((s, i) => s + i.qty, 0)
};
function calcTotals() {
  const items = Cart.get().map(i => ({ ...i, p: findProduct(i.id) })).filter(i => i.p);
  const subtotal = items.reduce((s, i) => s + priceOf(i.p) * i.qty, 0);
  const code = LS.get("ch_coupon", ""), cp = COUPONS[code];
  let discount = 0;
  if (cp && cp.type === "percent") discount = Math.round(subtotal * cp.value / 100);
  if (cp && cp.type === "amount") discount = Math.min(cp.value, subtotal);
  const freeShip = (cp && cp.type === "ship") || subtotal >= FREE_SHIP_FROM;
  const shipping = subtotal === 0 || freeShip ? 0 : SHIP_FEE;
  return { items, subtotal, discount, shipping, total: subtotal - discount + shipping, code: cp ? code : "" };
}
function updateBadge() { const b = $("#cartBadge"); if (b) b.textContent = Cart.count(); }

/* ---------- Đăng nhập (mô phỏng) ---------- */
const currentUser = () => { try { return JSON.parse(sessionStorage.getItem("ch_session") || localStorage.getItem("ch_session") || "null"); } catch (e) { return null; } };
function logout() { sessionStorage.removeItem("ch_session"); localStorage.removeItem("ch_session"); location.href = "index.html"; }

/* ---------- Header & Footer dùng chung ---------- */
const PAGE = document.body.dataset.page;
function renderLayout() {
  const nav = [["home", "index.html", "Trang chủ"], ["shop", "shop.html", "Cửa hàng"], ["about", "about.html", "Giới thiệu"], ["blog", "blog.html", "Blog"], ["contact", "contact.html", "Liên hệ"]];
  const u = currentUser();
  const account = u
    ? `<div class="acc-wrap"><button class="icon-btn" id="accBtn" aria-label="Tài khoản"><i class="fa-solid fa-user-check"></i></button>
       <div class="acc-menu" id="accMenu"><span>Xin chào, ${esc(u.name)}</span><a href="cart.html">Giỏ hàng của tôi</a><button id="logoutBtn">Đăng xuất</button></div></div>`
    : `<a class="icon-btn" href="login.html" aria-label="Đăng nhập"><i class="fa-regular fa-user"></i></a>`;
  $("#site-header").innerHTML = `
  <div class="topbar">Miễn phí vận chuyển cho đơn từ ${fmt(FREE_SHIP_FROM)} · Mã COFFEE10 giảm 10%</div>
  <header class="site-header"><div class="container header-inner">
    <a class="logo" href="index.html"><img src="assets/images/logo/logo.svg" alt="Logo COFFEEHOUSE"><span>COFFEEHOUSE</span></a>
    <nav class="nav" id="mainNav" aria-label="Điều hướng chính"><ul>${nav.map(n => `<li><a href="${n[1]}" class="${PAGE === n[0] ? "active" : ""}">${n[2]}</a></li>`).join("")}</ul></nav>
    <div class="header-actions">
      <button class="icon-btn" id="searchBtn" aria-label="Tìm kiếm"><i class="fa-solid fa-magnifying-glass"></i></button>
      ${account}
      <a class="icon-btn" href="cart.html" aria-label="Giỏ hàng"><i class="fa-solid fa-bag-shopping"></i><span class="badge-count" id="cartBadge">0</span></a>
      <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Mở menu"><i class="fa-solid fa-bars"></i></button>
    </div></div></header>
  <div class="search-overlay" id="searchOverlay"><form class="search-box" id="searchForm" role="search">
    <input type="search" id="searchInput" placeholder="Tìm cà phê, trà, bánh..." aria-label="Từ khóa tìm kiếm">
    <button class="btn" type="submit">Tìm kiếm</button></form></div>`;
  $("#site-footer").innerHTML = `
  <footer class="site-footer"><div class="container"><div class="footer-grid">
    <div><a class="logo" href="index.html"><img src="assets/images/logo/logo.svg" alt="Logo COFFEEHOUSE"><span>COFFEEHOUSE</span></a>
      <p>Brew Your Moment – Đánh Thức Mọi Khoảnh Khắc. Cà phê, trà và bánh ngọt chọn lọc, giao tận nơi.</p>
      <div class="socials"><a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
      <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
      <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
      <a href="https://tiktok.com" target="_blank" rel="noopener" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a></div></div>
    <div><h4>Liên kết nhanh</h4><ul>${nav.map(n => `<li><a href="${n[1]}">${n[2]}</a></li>`).join("")}<li><a href="cart.html">Giỏ hàng</a></li><li><a href="login.html">Đăng nhập</a></li></ul></div>
    <div><h4>Liên hệ</h4><ul><li><i class="fa-solid fa-location-dot"></i>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
      <li><i class="fa-solid fa-phone"></i><a href="tel:0901234567">0901 234 567</a></li>
      <li><i class="fa-solid fa-envelope"></i><a href="mailto:hello@coffeehouse.vn">hello@coffeehouse.vn</a></li></ul></div>
    <div><h4>Danh mục</h4><ul>${Object.entries(CATEGORIES).map(([k, c]) => `<li><a href="shop.html?cat=${k}">${c.name}</a></li>`).join("")}</ul></div>
  </div><div class="copyright">© 2026 COFFEEHOUSE. Dự án học tập môn Thiết kế Web. Đã đăng ký bản quyền.</div></div></footer>`;
}

function bindLayout() {
  updateBadge();
  $("#menuBtn").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  const ov = $("#searchOverlay");
  $("#searchBtn").addEventListener("click", () => { ov.classList.add("open"); $("#searchInput").focus(); });
  ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") ov.classList.remove("open"); });
  $("#searchForm").addEventListener("submit", e => {
    e.preventDefault(); const q = $("#searchInput").value.trim();
    location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  });
  const ab = $("#accBtn");
  if (ab) {
    ab.addEventListener("click", () => $("#accMenu").classList.toggle("open"));
    $("#logoutBtn").addEventListener("click", logout);
  }
}

/* ---------- Thẻ sản phẩm dùng chung ---------- */
function productCard(p) {
  const off = p.sale > 0 ? Math.round((1 - p.sale / p.price) * 100) : 0;
  return `<article class="product-card">
    <a class="pic" href="product-detail.html?id=${p.id}">
      <img src="${p.image}" alt="${esc(p.name)}" loading="lazy">
      ${off ? `<span class="tag">-${off}%</span>` : ""}${p.isNew ? '<span class="tag new">Mới</span>' : ""}
    </a>
    <div class="info">
      <span class="cat">${CATEGORIES[p.category].name}</span>
      <h3><a href="product-detail.html?id=${p.id}">${esc(p.name)}</a></h3>
      <div class="rate-row">${stars(p.rating)}<span>Đã bán ${new Intl.NumberFormat("vi-VN").format(p.sold)}</span></div>
      <div class="price"><span class="now">${fmt(priceOf(p))}</span>${off ? `<span class="old">${fmt(p.price)}</span>` : ""}</div>
      <div class="card-actions">
        <a class="btn btn-ghost" href="product-detail.html?id=${p.id}">Xem chi tiết</a>
        <button class="btn" data-add="${p.id}"><i class="fa-solid fa-cart-plus"></i> Thêm</button>
      </div>
    </div></article>`;
}
function blogCard(b, withFull = false) {
  return `<article class="blog-card" id="post-${b.id}">
    <img src="${b.image}" alt="${esc(b.title)}" loading="lazy">
    <div class="body"><div class="meta"><span><i class="fa-regular fa-calendar"></i> ${fmtDate(b.date)}</span><span><i class="fa-solid fa-tag"></i> ${b.cat}</span></div>
    <h3>${esc(b.title)}</h3><p>${esc(b.excerpt)}</p>
    ${withFull ? `<div class="more">${b.content.map(c => `<p>${esc(c)}</p>`).join("")}</div><button class="read-more" data-read="${b.id}">Đọc thêm</button>`
      : `<a class="read-more" href="blog.html#post-${b.id}">Đọc thêm</a>`}</div></article>`;
}

/* ---------- Sự kiện toàn cục: thêm vào giỏ, combo ---------- */
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) { Cart.add(add.dataset.add); toast("Đã thêm “" + findProduct(add.dataset.add).name + "” vào giỏ hàng"); }
  const combo = e.target.closest("[data-combo]");
  if (combo) { combo.dataset.combo.split(",").forEach(id => Cart.add(id)); toast("Đã thêm combo vào giỏ hàng"); }
  const copy = e.target.closest("[data-copy]");
  if (copy) {
    const done = () => toast("Đã sao chép mã " + copy.dataset.copy + ". Dán vào ô mã giảm giá ở giỏ hàng.");
    (navigator.clipboard ? navigator.clipboard.writeText(copy.dataset.copy) : Promise.reject()).then(done, done);
  }
  if (!e.target.closest(".acc-wrap")) { const m = $("#accMenu"); if (m) m.classList.remove("open"); }
});

/* ---------- Trang chủ ---------- */
function initHome() {
  $("#categoryGrid").innerHTML = Object.entries(CATEGORIES).map(([k, c]) =>
    `<a class="cat-card" href="shop.html?cat=${k}"><div class="thumb"><img src="assets/images/categories/${k}.png" alt="${c.name}" loading="lazy"></div><h3>${c.name}</h3></a>`).join("");
  $("#featuredGrid").innerHTML = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8).map(productCard).join("");
  $("#newGrid").innerHTML = PRODUCTS.filter(p => p.isNew).slice(0, 4).map(productCard).join("");
  $("#blogGrid").innerHTML = [...BLOGS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map(b => blogCard(b)).join("");
  const form = $("#newsletterForm");
  form.addEventListener("submit", e => {
    e.preventDefault(); const i = $("#newsEmail"); const v = i.value.trim();
    if (!isEmail(v)) return setErr(i, "Vui lòng nhập email hợp lệ, ví dụ ten@email.com");
    setErr(i, "");
    const list = LS.get("ch_newsletter", []); if (!list.includes(v)) list.push(v); LS.set("ch_newsletter", list);
    form.reset(); toast("Đăng ký nhận tin thành công. Cảm ơn bạn!");
  });
}

renderLayout();
bindLayout();
if (PAGE === "home") initHome();

/* ---------- Trang blog: lọc danh mục, đọc thêm ---------- */
if (PAGE === "blog") {
  const cats = ["Tất cả", ...new Set(BLOGS.map(b => b.cat))];
  const sorted = [...BLOGS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const draw = c => { $("#blogList").innerHTML = sorted.filter(b => c === "Tất cả" || b.cat === c).map(b => blogCard(b, true)).join(""); };
  $("#blogChips").innerHTML = cats.map((c, i) => `<button class="chip ${i ? "" : "active"}" data-bcat="${c}">${c}</button>`).join("");
  $("#blogChips").addEventListener("click", e => {
    const b = e.target.closest("[data-bcat]"); if (!b) return;
    $$("#blogChips .chip").forEach(x => x.classList.toggle("active", x === b)); draw(b.dataset.bcat);
  });
  $("#blogList").addEventListener("click", e => {
    const b = e.target.closest("[data-read]"); if (!b) return;
    const card = b.closest(".blog-card"); card.classList.toggle("open"); b.textContent = card.classList.contains("open") ? "Thu gọn" : "Đọc thêm";
  });
  draw("Tất cả");
  const m = location.hash.match(/^#post-(\d+)$/), card = m && $("#post-" + m[1]);
  if (card) { card.classList.add("open"); $(".read-more", card).textContent = "Thu gọn"; card.scrollIntoView({ block: "center" }); }
}
