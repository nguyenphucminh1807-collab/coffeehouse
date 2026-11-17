/* ===== COFFEEHOUSE – auth.js: đăng nhập / đăng ký MÔ PHỎNG phía frontend (không an toàn cho thực tế) ===== */
const hashPw = s => btoa(unescape(encodeURIComponent("ch::" + s))); // chỉ che mờ, KHÔNG phải mã hóa bảo mật

const loginForm = $("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault(); clearErrs(loginForm);
    const id = $("#loginId"), pw = $("#loginPw"); let ok = true;
    if (!id.value.trim()) { setErr(id, "Vui lòng nhập email hoặc số điện thoại"); ok = false; }
    if (!pw.value) { setErr(pw, "Vui lòng nhập mật khẩu"); ok = false; }
    if (!ok) return;
    const key = id.value.trim().toLowerCase();
    const user = LS.get("ch_users", []).find(u => u.email === key || u.phone === key);
    if (!user || user.pw !== hashPw(pw.value)) { $("#loginMsg").className = "alert bad"; $("#loginMsg").textContent = "Email/số điện thoại hoặc mật khẩu chưa đúng."; return; }
    const session = JSON.stringify({ name: user.name, email: user.email, phone: user.phone });
    (document.getElementById("remember").checked ? localStorage : sessionStorage).setItem("ch_session", session);
    $("#loginMsg").className = "alert ok"; $("#loginMsg").textContent = "Đăng nhập thành công! Đang chuyển hướng...";
    setTimeout(() => location.href = "index.html", 900);
  });
}

const regForm = $("#registerForm");
if (regForm) {
  regForm.addEventListener("submit", e => {
    e.preventDefault(); clearErrs(regForm);
    const n = $("#regName"), em = $("#regEmail"), ph = $("#regPhone"), pw = $("#regPw"), pw2 = $("#regPw2"); let ok = true;
    const bad = (i, m) => { setErr(i, m); ok = false; };
    if (n.value.trim().length < 2) bad(n, "Vui lòng nhập họ tên (ít nhất 2 ký tự)");
    if (!isEmail(em.value.trim())) bad(em, "Email chưa hợp lệ");
    if (!isPhone(ph.value)) bad(ph, "Số điện thoại gồm 10 số, bắt đầu bằng 0");
    if (pw.value.length < 6 || !/\d/.test(pw.value) || !/[a-zA-Z]/.test(pw.value)) bad(pw, "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số");
    if (pw2.value !== pw.value) bad(pw2, "Mật khẩu xác nhận chưa khớp");
    if (!ok) return;
    const users = LS.get("ch_users", []), email = em.value.trim().toLowerCase(), phone = ph.value.replace(/\s/g, "");
    if (users.some(u => u.email === email)) return bad(em, "Email này đã được đăng ký");
    if (users.some(u => u.phone === phone)) return bad(ph, "Số điện thoại này đã được đăng ký");
    users.push({ name: n.value.trim(), email, phone, pw: hashPw(pw.value) }); LS.set("ch_users", users);
    regForm.reset(); $("#regMsg").className = "alert ok";
    $("#regMsg").innerHTML = 'Đăng ký thành công! <a href="login.html"><strong>Đăng nhập ngay</strong></a>';
  });
}
