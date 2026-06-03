const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "fa-gauge-high" },
  { label: "Nạp Credit", href: "/credit", icon: "fa-wallet" },
  { label: "Tạo Order", href: "/orders", icon: "fa-bullhorn" },
  { label: "Lịch sử", href: "/history", icon: "fa-clock-rotate-left" },
  { label: "Admin Panel", href: "/admin", icon: "fa-shield-halved" }
];

const services = [
  { id: "like", name: "Facebook Like", unit: "like", price: 120, min: 50, max: 5000 },
  { id: "follow", name: "Facebook Follow", unit: "follow", price: 95, min: 50, max: 10000 },
  { id: "comment", name: "Facebook Comment", unit: "comment", price: 150, min: 10, max: 2000 },
  { id: "view", name: "TikTok View", unit: "view", price: 15, min: 1000, max: 500000 }
];

const recentOrders = [
  { code: "ORD-2409", service: "Facebook Like", target: "https://facebook.com/post/123", quantity: 500, status: "Hoàn thành", cost: 60000 },
  { code: "ORD-2410", service: "TikTok View", target: "https://tiktok.com/video/abc", quantity: 10000, status: "Đang chạy", cost: 150000 },
  { code: "ORD-2411", service: "Facebook Follow", target: "https://facebook.com/profile/like", quantity: 250, status: "Chờ xử lý", cost: 23750 }
];

const transactions = [
  { time: "10:30", label: "Nạp MoMo", amount: 200000, status: "Thành công" },
  { time: "11:15", label: "Tạo order Facebook Like", amount: -60000, status: "Đã trừ" },
  { time: "12:45", label: "Nạp ngân hàng", amount: 500000, status: "Thành công" }
];

const adminStats = [
  { label: "Người dùng", value: "1,248", delta: "+12%" },
  { label: "Order hôm nay", value: "384", delta: "+8%" },
  { label: "Doanh thu", value: "82.4M", delta: "+18%" },
  { label: "Tỷ lệ hoàn tất", value: "97.8%", delta: "+1.2%" }
];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  // Thêm mock user để hiển thị thông tin trên Sidebar và Header
  res.locals.user = {
    username: "Admin_Tester",
    balance: 1250000
  };
  res.locals.navItems = navItems;
  res.locals.currentPath = req.path;
  next();
});

function renderPage(res, view, options = {}) {
  return res.render(view, {
    pageTitle: "Like Panel",
    notice: "",
    error: "",
    ...options
  });
}

app.get("/", (req, res) => {
  return res.redirect("/dashboard");
});

app.get("/login", (req, res) => {
  return renderPage(res, "login", {
    pageTitle: "Đăng nhập",
    error: req.query.error || "",
    notice: req.query.notice || ""
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect("/login?error=Vui lòng nhập đầy đủ tài khoản và mật khẩu");
  }

  if (username.toLowerCase() === "admin" && password === "123456") {
    return res.redirect("/dashboard?notice=Đăng nhập thành công");
  }

  return res.redirect("/login?error=Sai tài khoản hoặc mật khẩu");
});

app.get("/dashboard", (req, res) => {
  return renderPage(res, "dashboard", {
    pageTitle: "Dashboard",
    stats: [
      { label: "Số dư hiện tại", value: "1,250,000đ", icon: "fa-wallet", accent: "violet" },
      { label: "Order đang chạy", value: "24", icon: "fa-spinner", accent: "pink" },
      { label: "Đã hoàn thành", value: "1,942", icon: "fa-circle-check", accent: "green" },
      { label: "Đơn chờ xử lý", value: "8", icon: "fa-triangle-exclamation", accent: "yellow" }
    ],
    recentOrders,
    transactions,
    notice: req.query.notice || ""
  });
});

app.get("/credit", (req, res) => {
  return renderPage(res, "credit", {
    pageTitle: "Nạp Credit",
    notice: req.query.notice || "",
    banks: [
      { name: "MOMO", account: "0987 654 321", owner: "NGUYEN VAN A" },
      { name: "VCB", account: "0123456789", owner: "NGUYEN VAN A" }
    ]
  });
});

app.post("/credit", (req, res) => {
  const amount = Number(req.body.amount || 0);
  if (!amount || amount < 10000) {
    return res.redirect("/credit?notice=Số tiền nạp tối thiểu là 10,000đ");
  }
  return res.redirect("/credit?notice=Yêu cầu nạp " + amount.toLocaleString("vi-VN") + "đ đã được ghi nhận");
});

app.get("/orders", (req, res) => {
  return res.redirect("/orders/like");
});

app.get("/orders/:type", (req, res) => {
  const service = services.find((item) => item.id === req.params.type) || services[0];
  return renderPage(res, "order", {
    pageTitle: "Tạo Order",
    services,
    service,
    notice: req.query.notice || ""
  });
});

app.post("/orders/:type", (req, res) => {
  const quantity = Number(req.body.quantity || 0);
  const target = String(req.body.target || "").trim();
  const service = services.find((item) => item.id === req.params.type) || services[0];

  if (!target) {
    return res.redirect(`/orders/${service.id}?notice=Vui lòng nhập link hoặc mục tiêu`);
  }

  if (quantity < service.min || quantity > service.max) {
    return res.redirect(
      `/orders/${service.id}?notice=Số lượng phải từ ${service.min} đến ${service.max}`
    );
  }

  return res.redirect(`/orders/${service.id}?notice=Đã tạo order ${service.name} thành công`);
});

app.get("/history", (req, res) => {
  return renderPage(res, "history", {
    pageTitle: "Lịch sử",
    orders: recentOrders,
    transactions
  });
});

app.get("/admin", (req, res) => {
  return renderPage(res, "admin", {
    pageTitle: "Admin Panel",
    adminStats,
    services,
    orders: recentOrders
  });
});

app.use((req, res) => {
  res.status(404);
  return renderPage(res, "not-found", { pageTitle: "Không tìm thấy" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
