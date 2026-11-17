/* ===== DỮ LIỆU TẬP TRUNG: danh mục, sản phẩm, bài viết (COFFEEHOUSE) ===== */
const CATEGORIES = {
  hat:       { name: "Cà phê hạt",          icon: "fa-seedling" },
  rangxay:   { name: "Cà phê rang xay",     icon: "fa-mortar-pestle" },
  hoatan:    { name: "Cà phê hòa tan",      icon: "fa-mug-hot" },
  tra:       { name: "Trà & trà túi lọc",   icon: "fa-leaf" },
  dongchai:  { name: "Đồ uống đóng chai",   icon: "fa-bottle-water" },
  banh:      { name: "Bánh ngọt",           icon: "fa-cake-candles" }
};

// Chuyển tiếng Việt có dấu thành slug không dấu (dùng cho tên file ảnh và tìm kiếm)
const slugify = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Thành phần và hướng dẫn mặc định theo danh mục
const DEFAULTS = {
  hat:      { ing: "100% hạt cà phê rang mộc, không phụ gia, không hương liệu.", guide: "Xay mới trước khi pha. Tỉ lệ 1:15 với nước 92–96°C. Phù hợp pha phin, French press hoặc máy espresso." },
  rangxay:  { ing: "100% cà phê rang xay nguyên chất, đóng gói hút chân không.", guide: "Dùng 20g cà phê cho 200ml nước nóng 92°C. Ủ 30 giây rồi pha phin 4–5 phút hoặc dùng Moka pot." },
  hoatan:   { ing: "Cà phê hòa tan, đường, sữa bột béo thực vật, chất ổn định thực phẩm.", guide: "Hòa 1 gói với 120ml nước nóng, khuấy đều. Thêm đá để có ly cà phê lạnh." },
  tra:      { ing: "Lá trà, hoa quả sấy tự nhiên, không chất bảo quản.", guide: "Hãm với nước 85–90°C trong 3–5 phút. Có thể thêm đá và mật ong." },
  dongchai: { ing: "Nước lọc, cà phê/trà chiết xuất, đường mía, hương liệu tự nhiên.", guide: "Lắc đều trước khi uống. Ngon nhất khi uống lạnh, bảo quản ngăn mát và dùng trong 7 ngày sau khi mở." },
  banh:     { ing: "Bột mì, bơ, trứng, đường, hương liệu tự nhiên.", guide: "Bảo quản ngăn mát, dùng ngon nhất trong 3 ngày. Làm ấm bánh 1 phút trong lò nướng trước khi thưởng thức." }
};

// [tên, danh mục, giá, giá KM (0 = không KM), đánh giá, đã bán, sản phẩm mới, xuất xứ, mô tả]
const RAW_PRODUCTS = [
  ["Arabica Cầu Đất Rang Vừa 250g","hat",185000,159000,4.8,1240,false,"Cầu Đất, Đà Lạt","Hạt Arabica cao nguyên với hương hoa quả, vị chua thanh và hậu ngọt caramel."],
  ["Robusta Buôn Ma Thuột 500g","hat",165000,0,4.6,980,false,"Buôn Ma Thuột, Đắk Lắk","Robusta đậm đà, hậu vị socola đắng, cho ly cà phê phin mạnh mẽ."],
  ["Espresso Blend Signature 1kg","hat",420000,369000,4.9,760,true,"Blend Việt Nam – Brazil","Công thức blend độc quyền của COFFEEHOUSE, crema dày, vị cân bằng cho espresso."],
  ["Culi Đắk Lắk Nguyên Chất 250g","hat",175000,0,4.5,540,true,"Đắk Lắk","Hạt Culi tròn đều, hương thơm đậm và hậu vị kéo dài."],
  ["Phin Truyền Thống Rang Xay 500g","rangxay",145000,125000,4.7,2100,false,"Tây Nguyên","Hương vị cà phê phin đậm đà truyền thống, rang xay sẵn tiện lợi."],
  ["Arabica Sơn La Rang Xay 250g","rangxay",150000,0,4.6,610,false,"Sơn La","Arabica Tây Bắc thơm hương trái cây, vị chua nhẹ dễ uống."],
  ["Moka Cầu Đất Rang Xay 250g","rangxay",210000,189000,4.8,430,true,"Cầu Đất, Đà Lạt","Moka quý hiếm với hương thơm quyến rũ, hậu vị ngọt sâu."],
  ["Cold Brew Blend Xay Thô 500g","rangxay",195000,0,4.5,320,true,"Blend Việt Nam","Độ xay thô tối ưu cho cold brew, cho vị mượt, ít đắng."],
  ["Cà Phê Sữa Đá Hòa Tan 18 gói","hoatan",78000,65000,4.7,3200,false,"Việt Nam","Cà phê sữa đá béo thơm, pha nhanh trong 30 giây."],
  ["Cà Phê Đen Hòa Tan 20 gói","hoatan",69000,0,4.4,1450,false,"Việt Nam","Vị đen đậm, không đường, dành cho người yêu cà phê nguyên bản."],
  ["Cà Phê Muối Hòa Tan 12 gói","hoatan",89000,79000,4.8,870,true,"Việt Nam","Cà phê muối kem béo mặn nhẹ, hot trend của giới trẻ."],
  ["Cappuccino Hòa Tan Hộp 10 gói","hoatan",85000,0,4.5,690,false,"Việt Nam","Lớp bọt sữa mịn màng, vị cà phê êm dịu."],
  ["Trà Oolong Tứ Quý 200g","tra",135000,115000,4.7,820,false,"Lâm Đồng","Trà Oolong thơm hoa lan, hậu vị ngọt thanh."],
  ["Trà Hoa Cúc Mật Ong Túi Lọc 20 túi","tra",85000,0,4.6,640,true,"Việt Nam","Hoa cúc sấy nguyên bông, giúp thư giãn và dễ ngủ."],
  ["Trà Đào Cam Sả Túi Lọc 20 túi","tra",95000,79000,4.8,1180,false,"Việt Nam","Hương đào cam sả tươi mát, uống nóng hay lạnh đều ngon."],
  ["Matcha Nhật Bản 100g","tra",285000,249000,4.9,510,true,"Uji, Nhật Bản","Bột matcha xanh mịn, vị umami nhẹ, dùng pha latte hoặc làm bánh."],
  ["Cold Brew Original 250ml","dongchai",45000,0,4.6,2400,false,"Việt Nam","Ủ lạnh 18 giờ, vị êm, không gắt, uống ngay tiện lợi."],
  ["Cold Brew Caramel 250ml","dongchai",49000,42000,4.7,1900,false,"Việt Nam","Cold brew kết hợp caramel ngọt dịu, hậu vị béo."],
  ["Trà Đào Đóng Chai 350ml","dongchai",39000,0,4.5,1560,false,"Việt Nam","Trà đen ủ lạnh cùng đào miếng, giải khát sảng khoái."],
  ["Latte Sữa Yến Mạch 250ml","dongchai",55000,49000,4.8,740,true,"Việt Nam","Espresso kết hợp sữa yến mạch thuần chay, mượt và thơm."],
  ["Croissant Bơ Pháp","banh",42000,0,4.8,1320,false,"Làm tại COFFEEHOUSE","Vỏ ngàn lớp giòn rụm, nhân bơ Pháp thơm béo."],
  ["Tiramisu Cà Phê","banh",65000,55000,4.9,980,true,"Làm tại COFFEEHOUSE","Bánh mềm mịn thấm espresso, phủ cacao đắng."],
  ["Bánh Cookie Socola Chip (Hộp 6)","banh",98000,0,4.6,720,false,"Làm tại COFFEEHOUSE","Cookie giòn ngoài mềm trong với socola đen tan chảy."],
  ["Brownie Hạnh Nhân","banh",52000,45000,4.7,860,false,"Làm tại COFFEEHOUSE","Brownie socola đậm vị, phủ hạnh nhân lát giòn."]
];

const PRODUCTS = RAW_PRODUCTS.map((r, i) => ({
  id: i + 1, name: r[0], category: r[1], price: r[2], sale: r[3], rating: r[4], sold: r[5], isNew: r[6],
  origin: r[7], desc: r[8], ingredients: DEFAULTS[r[1]].ing, guide: DEFAULTS[r[1]].guide,
  image: "assets/images/products/" + slugify(r[0]) + ".png"
}));

const BLOGS = [
  { id: 1, title: "Arabica và Robusta: đâu là lựa chọn dành cho bạn?", cat: "Kiến thức cà phê", date: "2026-10-12",
    excerpt: "Hai dòng cà phê phổ biến nhất có hương vị và hàm lượng caffeine rất khác nhau.",
    content: ["Arabica thường có vị chua thanh, hương hoa quả và ít caffeine hơn. Robusta đậm, đắng, hậu vị socola và cho lớp crema dày.", "Nếu thích cà phê phin truyền thống, hãy chọn Robusta hoặc blend. Nếu thích hương vị tinh tế, hãy thử Arabica Cầu Đất."] },
  { id: 2, title: "Cách pha Cold Brew tại nhà chỉ với 3 bước", cat: "Công thức pha chế", date: "2026-10-28",
    excerpt: "Ly cold brew mượt mà, ít đắng, dễ làm ngay cả khi bạn là người mới.",
    content: ["Bước 1: trộn 100g cà phê xay thô với 1 lít nước lọc. Bước 2: ủ trong tủ lạnh 12–18 giờ.", "Bước 3: lọc qua giấy lọc, thêm đá và sữa tươi tùy thích. Cold brew để được 7 ngày trong ngăn mát."] },
  { id: 3, title: "Cà phê phin – nét văn hóa đặc trưng của người Việt", cat: "Văn hóa cà phê", date: "2026-11-03",
    excerpt: "Từng giọt cà phê chậm rãi rơi xuống kể câu chuyện về nhịp sống Việt Nam.",
    content: ["Chiếc phin nhôm giản dị đã gắn bó với người Việt hơn một thế kỷ, từ quán vỉa hè đến bàn làm việc.", "Cà phê phin cần sự kiên nhẫn: ủ, nhỏ giọt, rồi thưởng thức. Đó cũng là cách chúng ta tận hưởng khoảnh khắc."] },
  { id: 4, title: "Bí quyết bảo quản cà phê hạt luôn thơm ngon", cat: "Kiến thức cà phê", date: "2026-09-20",
    excerpt: "Ánh sáng, độ ẩm và không khí là kẻ thù của hương thơm cà phê.",
    content: ["Hãy bảo quản cà phê trong túi có van một chiều hoặc hũ kín, đặt nơi khô ráo, tránh ánh nắng.", "Không để cà phê trong tủ lạnh vì hơi ẩm sẽ làm mất hương. Chỉ xay lượng đủ dùng cho mỗi lần pha."] },
  { id: 5, title: "Công thức Cappuccino bọt sữa mịn như ngoài tiệm", cat: "Công thức pha chế", date: "2026-09-05",
    excerpt: "Tỉ lệ 1:1:1 và nhiệt độ sữa là chìa khóa cho ly Cappuccino hoàn hảo.",
    content: ["Pha 30ml espresso, đánh 100ml sữa tươi đến 60–65°C cho bọt mịn như nhung.", "Rót sữa từ từ vào tâm ly, phủ lớp bọt dày lên trên và rắc chút bột cacao."] },
  { id: 6, title: "Hành trình hạt cà phê từ Tây Nguyên đến ly của bạn", cat: "Văn hóa cà phê", date: "2026-08-18",
    excerpt: "Từ vườn cà phê trên cao nguyên đến quầy pha chế, mỗi hạt đều có một câu chuyện.",
    content: ["Cà phê được thu hái chín đỏ bằng tay, sơ chế ướt hoặc khô, sau đó phơi và rang ở mức phù hợp.", "COFFEEHOUSE làm việc trực tiếp với nông hộ để đảm bảo hạt cà phê chất lượng và giá công bằng."] }
].map(b => ({ ...b, image: "assets/images/blog/blog-" + b.id + ".jpg" }));

// Đánh giá mẫu của khách hàng (hiển thị ở trang chi tiết)
const SAMPLE_REVIEWS = [
  { name: "Minh Anh", stars: 5, text: "Chất lượng rất tốt, đóng gói cẩn thận, giao hàng nhanh." },
  { name: "Quốc Bảo", stars: 4, text: "Hương vị ổn, đúng như mô tả. Sẽ mua lại." },
  { name: "Thu Hà", stars: 5, text: "Mình rất thích, cả nhà đều khen ngon." }
];

if (typeof module !== "undefined") module.exports = { PRODUCTS, BLOGS, CATEGORIES };
