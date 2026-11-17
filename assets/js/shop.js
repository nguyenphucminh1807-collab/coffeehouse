/* ===== COFFEEHOUSE – shop.js: cửa hàng (lọc, tìm kiếm, sắp xếp, phân trang) + chi tiết sản phẩm ===== */
const norm = s => slugify(s).replace(/-/g, " ");

function initShop() {
  const PER_PAGE = 9, params = new URLSearchParams(location.search);
  const st = { cat: CATEGORIES[params.get("cat")] ? params.get("cat") : "all", q: params.get("q") || "", price: "all", sort: "default", page: 1 };
  $("#shopSearch").value = st.q;

  const inRange = (p, r) => { if (r === "all") return true; const [a, b] = r.split("-").map(Number); const v = priceOf(p); return v >= a && (!b || v < b); };
  const sorters = {
    default: (a, b) => b.sold - a.sold, "price-asc": (a, b) => priceOf(a) - priceOf(b), "price-desc": (a, b) => priceOf(b) - priceOf(a),
    name: (a, b) => a.name.localeCompare(b.name, "vi"), rating: (a, b) => b.rating - a.rating || b.sold - a.sold
  };
  function render() {
    const q = norm(st.q);
    const list = PRODUCTS.filter(p => (st.cat === "all" || p.category === st.cat) && inRange(p, st.price)
      && (!q || norm(p.name + " " + CATEGORIES[p.category].name).includes(q))).sort(sorters[st.sort]);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)); st.page = Math.min(st.page, pages);
    const shown = list.slice((st.page - 1) * PER_PAGE, st.page * PER_PAGE);
    $("#shopCount").textContent = list.length ? `Hiển thị ${shown.length} trên tổng ${list.length} sản phẩm` : "Không có sản phẩm";
    $("#shopGrid").innerHTML = shown.length ? shown.map(productCard).join("")
      : '<div class="empty"><i class="fa-solid fa-mug-saucer"></i><h3>Không tìm thấy sản phẩm</h3><p>Hãy thử từ khóa khác hoặc xóa bộ lọc.</p></div>';
    $("#pagination").innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === st.page ? "active" : ""}" data-page="${i + 1}">${i + 1}</button>`).join("") : "";
    $("#catList").innerHTML = `<li><button data-cat="all" class="${st.cat === "all" ? "active" : ""}"><span>Tất cả</span><span>${PRODUCTS.length}</span></button></li>` +
      Object.entries(CATEGORIES).map(([k, c]) => `<li><button data-cat="${k}" class="${st.cat === k ? "active" : ""}"><span>${c.name}</span><span>${PRODUCTS.filter(p => p.category === k).length}</span></button></li>`).join("");
  }
  $("#catList").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) { st.cat = b.dataset.cat; st.page = 1; render(); } });
  $("#pagination").addEventListener("click", e => { const b = e.target.closest("[data-page]"); if (b) { st.page = +b.dataset.page; render(); $("#shopGrid").scrollIntoView({ behavior: "smooth", block: "start" }); } });
  $("#shopSearch").addEventListener("input", e => { st.q = e.target.value; st.page = 1; render(); });
  $("#sortSelect").addEventListener("change", e => { st.sort = e.target.value; st.page = 1; render(); });
  $$("input[name=price]").forEach(r => r.addEventListener("change", () => { st.price = r.value; st.page = 1; render(); }));
  $("#resetFilters").addEventListener("click", () => {
    Object.assign(st, { cat: "all", q: "", price: "all", sort: "default", page: 1 });
    $("#shopSearch").value = ""; $("#sortSelect").value = "default"; $("input[name=price][value=all]").checked = true; render();
  });
  render();
}

function initDetail() {
  const p = findProduct(new URLSearchParams(location.search).get("id"));
  const box = $("#detailBox");
  if (!p) { box.innerHTML = '<div class="empty"><i class="fa-solid fa-circle-exclamation"></i><h3>Không tìm thấy sản phẩm</h3><p><a class="btn" href="shop.html">Quay lại cửa hàng</a></p></div>'; $("#detailExtra").classList.add("hidden"); return; }
  document.title = p.name + " | COFFEEHOUSE";
  $("#crumbName").textContent = p.name;
  const off = p.sale > 0 ? Math.round((1 - p.sale / p.price) * 100) : 0;
  box.innerHTML = `
    <div class="gallery"><img src="${p.image}" alt="${esc(p.name)}"></div>
    <div><span class="cat">${CATEGORIES[p.category].name}</span><h1>${esc(p.name)}</h1>
      <div class="rate-row" style="justify-content:flex-start;gap:12px">${stars(p.rating)}<span>${p.rating}/5 · Đã bán ${new Intl.NumberFormat("vi-VN").format(p.sold)}</span></div>
      <div class="price" style="margin:14px 0"><span class="now">${fmt(priceOf(p))}</span>${off ? `<span class="old">${fmt(p.price)}</span><span class="tag" style="position:static">-${off}%</span>` : ""}</div>
      <p>${esc(p.desc)}</p>
      <dl class="spec"><div><dt>Thành phần</dt><dd>${esc(p.ingredients)}</dd></div><div><dt>Xuất xứ</dt><dd>${esc(p.origin)}</dd></div><div><dt>Hướng dẫn</dt><dd>${esc(p.guide)}</dd></div></dl>
      <div class="buy-row"><div class="qty"><button id="qMinus" aria-label="Giảm">−</button><input id="qInput" type="number" min="1" max="99" value="1" aria-label="Số lượng"><button id="qPlus" aria-label="Tăng">+</button></div>
        <button class="btn" id="addDetail"><i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng</button>
        <a class="btn btn-dark" id="buyNow" href="cart.html">Mua ngay</a></div></div>`;
  const qi = $("#qInput"), getQ = () => Math.max(1, Math.min(99, parseInt(qi.value) || 1));
  $("#qMinus").onclick = () => qi.value = Math.max(1, getQ() - 1);
  $("#qPlus").onclick = () => qi.value = Math.min(99, getQ() + 1);
  qi.onchange = () => qi.value = getQ();
  $("#addDetail").onclick = () => { Cart.add(p.id, getQ()); toast("Đã thêm " + getQ() + " sản phẩm vào giỏ hàng"); };
  $("#buyNow").onclick = () => Cart.add(p.id, getQ());

  $("#relatedGrid").innerHTML = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4).map(productCard).join("");

  // Đánh giá của khách hàng: mẫu + đánh giá người dùng lưu LocalStorage
  const key = "ch_reviews_" + p.id; let pick = 5;
  const drawStars = () => $("#starPick").innerHTML = [1, 2, 3, 4, 5].map(i => `<i class="fa-solid fa-star ${i <= pick ? "on" : ""}" data-s="${i}"></i>`).join("");
  const drawReviews = () => $("#reviewList").innerHTML = [...LS.get(key, []), ...SAMPLE_REVIEWS].map(r => `<div class="review"><strong>${esc(r.name)}</strong>${stars(r.stars)}<p style="margin:6px 0 0">${esc(r.text)}</p></div>`).join("");
  $("#starPick").addEventListener("click", e => { const s = e.target.closest("[data-s]"); if (s) { pick = +s.dataset.s; drawStars(); } });
  $("#reviewForm").addEventListener("submit", e => {
    e.preventDefault(); const n = $("#rvName"), t = $("#rvText"); let ok = true;
    if (n.value.trim().length < 2) { setErr(n, "Vui lòng nhập tên (ít nhất 2 ký tự)"); ok = false; } else setErr(n, "");
    if (t.value.trim().length < 10) { setErr(t, "Nội dung đánh giá cần ít nhất 10 ký tự"); ok = false; } else setErr(t, "");
    if (!ok) return;
    const list = LS.get(key, []); list.unshift({ name: n.value.trim(), stars: pick, text: t.value.trim() }); LS.set(key, list);
    e.target.reset(); pick = 5; drawStars(); drawReviews(); toast("Cảm ơn bạn đã đánh giá!");
  });
  drawStars(); drawReviews();
}
if (PAGE === "shop") initShop();
if (PAGE === "detail") initDetail();
