const form = document.querySelector("#brokerage-form");
const accountType = document.querySelector("#account-type");
const accountButtons = document.querySelectorAll(".account-option");
const priceInput = document.querySelector("#account-price");
const feeInput = document.querySelector("#brokerage-fee");
const totalPrice = document.querySelector("#total-price");
const status = document.querySelector("#form-status");

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

function updateTotal() {
  const total = Number(priceInput.value || 0) + Number(feeInput.value || 0);
  totalPrice.textContent = formatCurrency(total);
}

accountButtons.forEach((button) => {
  button.addEventListener("click", () => {
    accountButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    accountType.value = button.dataset.value;
    document.querySelector('[data-error-for="account-type"]').textContent = "";
  });
});

priceInput.addEventListener("input", () => {
  if (!feeInput.dataset.edited) feeInput.value = (Number(priceInput.value || 0) * 0.05).toFixed(2);
  updateTotal();
});
feeInput.addEventListener("input", () => {
  feeInput.dataset.edited = "true";
  updateTotal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "";
  document.querySelectorAll(".field-error").forEach((item) => (item.textContent = ""));

  if (!accountType.value) {
    document.querySelector('[data-error-for="account-type"]').textContent = "اختر نوع الحساب للمتابعة.";
    status.textContent = "يرجى إكمال الحقول الإلزامية.";
    return;
  }
  if (!form.reportValidity()) {
    status.textContent = "يرجى إكمال الحقول الإلزامية.";
    return;
  }

  const receipt = `HBS-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`;
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    status.textContent = "تعذر فتح نافذة المستند. اسمح بالنوافذ المنبثقة ثم أعد المحاولة.";
    return;
  }

  const data = new FormData(form);
  const rows = [
    ["نوع الحساب", data.get("accountType")],
    ["تفاصيل الحساب", data.get("accountDetails")],
    ["سعر الحساب", formatCurrency(data.get("accountPrice"))],
    ["مبلغ الوساطة", formatCurrency(data.get("brokerageFee"))],
    ["الإجمالي", formatCurrency(Number(data.get("accountPrice") || 0) + Number(data.get("brokerageFee") || 0))],
    ["اسم البائع", data.get("sellerName")],
    ["البلد", data.get("sellerCountry")],
    ["رقم الجوال", data.get("sellerPhone")],
    ["البريد الإلكتروني", data.get("sellerEmail") || "—"],
    ["البنك", data.get("bankName") || "—"],
    ["الآيبان", data.get("iban") || "—"],
    ["طريقة الاستلام", data.get("payoutMethod")],
    ["اسم المشتري", data.get("buyerName")],
    ["رقم الجوال / المعرّف", data.get("buyerContact")],
    ["طريقة الدفع", data.get("paymentMethod")],
  ];
  printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>متجر حبس-${receipt}</title><style>
    @page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172521;margin:0;font-size:12px}header{border-bottom:4px solid #c9a55b;padding-bottom:14px;display:flex;justify-content:space-between;align-items:flex-start}h1{margin:0;color:#073c33;font-size:30px}h2{font-size:15px;margin:24px 0 8px;padding:8px 12px;color:#fff;background:#073c33;border-right:3px solid #c9a55b}.meta{color:#65736d;line-height:1.8}.receipt{color:#073c33;text-align:left;direction:ltr}.grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#dce4de;border:1px solid #dce4de}.row{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;background:#fff;min-height:32px}.row:nth-child(4n+1),.row:nth-child(4n+2){background:#f4f7f3}.label{color:#63716b}.value{font-weight:bold;text-align:left;white-space:pre-wrap}.total{color:#fff;background:#073c33!important;font-size:14px}.terms{line-height:1.8;padding:0 22px}.footer{margin-top:25px;border-top:1px solid #dce4de;padding-top:10px;color:#718079;text-align:center;font-size:10px}
  </style></head><body><header><div><h1>متجر حبس</h1><div class="meta">وسيط حسابات الألعاب والتواصل الاجتماعي<br>السجل التجاري: 891140163</div></div><div class="receipt">رقم المستند: ${receipt}<br>التاريخ: ${new Date().toLocaleString("ar-SA")}</div></header><h2>بيانات العملية</h2><div class="grid">${rows.map(([label, value]) => `<div class="row${label === "الإجمالي" ? " total" : ""}"><span class="label">${label}</span><span class="value">${String(value || "—").replace(/</g, "&lt;")}</span></div>`).join("")}</div><h2>شروط وأحكام عقد البيع</h2><ol class="terms"><li>يلتزم البائع بتسليم الحساب المذكور كاملًا وبالمواصفات الموضحة.</li><li>يلتزم المشتري بسداد المبلغ المتفق عليه قبل استلام بيانات الحساب.</li><li>تتولى متجر حبس دور الوسيط خلال عملية البيع وفق البيانات المقدمة.</li></ol><div class="footer">هذا المستند أنشئ من البيانات المدخلة في المتصفح ولا يمثل تحققًا مستقلًا من ملكية الحساب أو بيانات الأطراف.</div><script>window.onload=()=>window.print();<\/script></body></html>`);
  printWindow.document.close();
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    accountButtons.forEach((item) => item.classList.remove("selected"));
    feeInput.removeAttribute("data-edited");
    status.textContent = "";
    updateTotal();
  }, 0);
});

updateTotal();
