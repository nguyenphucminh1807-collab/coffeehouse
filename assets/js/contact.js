/* ===== COFFEEHOUSE – contact.js: form liên hệ ===== */
const cForm = $("#contactForm");
cForm.addEventListener("submit", e => {
  e.preventDefault(); clearErrs(cForm);
  const n = $("#ctName"), em = $("#ctEmail"), ph = $("#ctPhone"), sj = $("#ctSubject"), ms = $("#ctMsg"); let ok = true;
  const bad = (i, m) => { setErr(i, m); ok = false; };
  if (n.value.trim().length < 2) bad(n, "Vui lòng nhập họ tên");
  if (!isEmail(em.value.trim())) bad(em, "Email chưa hợp lệ");
  if (ph.value.trim() && !isPhone(ph.value)) bad(ph, "Số điện thoại chưa hợp lệ");
  if (sj.value.trim().length < 3) bad(sj, "Vui lòng nhập chủ đề");
  if (ms.value.trim().length < 10) bad(ms, "Nội dung cần ít nhất 10 ký tự");
  if (!ok) return toast("Vui lòng kiểm tra lại thông tin", "error");
  const list = LS.get("ch_contacts", []);
  list.unshift({ name: n.value.trim(), email: em.value.trim(), phone: ph.value.trim(), subject: sj.value.trim(), message: ms.value.trim(), date: new Date().toISOString() });
  LS.set("ch_contacts", list); cForm.reset();
  $("#contactMsg").className = "alert ok"; $("#contactMsg").textContent = "Gửi liên hệ thành công! COFFEEHOUSE sẽ phản hồi bạn trong vòng 24 giờ.";
});
