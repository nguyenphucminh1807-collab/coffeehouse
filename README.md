# COFFEEHOUSE – Website thương mại điện tử cà phê & đồ uống

Slogan: **Brew Your Moment – Đánh Thức Mọi Khoảnh Khắc**
Bài thực hành Thiết kế Web (LAB 1) · HTML5, CSS3, JavaScript ES6+ thuần, LocalStorage.
Không dùng framework, không cần build. Mở `index.html` (khuyến nghị dùng Live Server) hoặc deploy GitHub Pages.

## Cấu trúc
- `*.html`: index, shop, product-detail, cart, checkout, about, blog, contact, login, register
- `assets/css`: `style.css` (nền tảng, header, hero, footer), `components.css` (nút, thẻ, form, bảng), `responsive.css`
- `assets/js`: `products.js` (24 sản phẩm, 6 bài blog), `main.js` (header/footer, giỏ hàng, trang chủ, blog), `shop.js` (cửa hàng + chi tiết), `cart.js`, `checkout.js`, `auth.js`, `contact.js`
- `assets/images`: logo, banner, products, categories, blog, about (tên file theo slug; thay ảnh thật bằng cách giữ nguyên tên file)
- `assets/videos`: đặt video demo (.mp4) tại đây

## Chức năng
- Tìm kiếm không dấu, lọc danh mục, lọc giá, sắp xếp (giá, tên, đánh giá), phân trang
- Chi tiết sản phẩm, chọn số lượng, sản phẩm liên quan, đánh giá khách hàng (LocalStorage)
- Giỏ hàng: tăng/giảm, xóa, xóa tất cả; mã `COFFEE10` (-10%), `WELCOME50` (-50.000), `FREESHIP`; ship 30.000 VNĐ, miễn phí từ 500.000 VNĐ
- Thanh toán COD / chuyển khoản (mô phỏng), kiểm tra dữ liệu, mã đơn `CHyyyymmdd-xxxx`, lưu `ch_orders`, xóa giỏ sau khi đặt
- Đăng ký / đăng nhập mô phỏng (không an toàn, chỉ để học), liên hệ, newsletter

## Triển khai GitHub Pages
1. Đổi tên thư mục gốc thành `<MSSV>_LAB1`, tạo repository và upload toàn bộ (kèm video demo trong `assets/videos`).
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Truy cập `https://<user>.github.io/<repo>/` sau 1–2 phút.
4. Nộp file PDF: họ tên + MSSV từng thành viên, link repository, link website.
