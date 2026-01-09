let USER;
let currentPage = 1;
let totalPages = 1;
let cooldownTimer = null;
let cooldownEnd = 0;

/* ================= Page Switch ================= */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ================= Auth ================= */
async function checkAuth() {
  const res = await fetch("/auth/me");
  if (!res.ok) {
    location.href = "/auth/discord";
    return;
  }

  USER = await res.json();
  document.getElementById("userInfo").textContent = USER.username;

  // الصفحة الافتراضية
  showPage("overview");

  // تحميل الصلاحيات (Avon Panel)
  await loadPermissions();

  // تحميل البيانات
  loadOverview();
  loadProfile();
  loadTop(1);
  checkCooldown();
}

/* ================= Permissions ================= */
async function loadPermissions() {
  const res = await fetch("/api/permissions");
  if (!res.ok) return;

  const perms = await res.json();

  if (perms.isAdmin) {
    document.getElementById("ownerNav").style.display = "block";
  }
}

/* ================= Logout ================= */
async function logout() {
  await fetch("/auth/logout");
  location.reload();
}

/* ================= Overview ================= */
async function loadOverview() {
  const res = await fetch("/api/overview");
  const data = await res.json();

  document.getElementById("ovCoins").textContent =
    (data.wallet || 0).toLocaleString();

  document.getElementById("ovLevel").textContent =
    data.level ?? 0;

  document.getElementById("ovRank").textContent =
    data.rank || "—";
}

/* ================= Profile ================= */
async function loadProfile() {
  const res = await fetch(`/api/economy/profile/${USER.id}`);
  const data = await res.json();

  document.getElementById("wallet").textContent =
    (data.wallet || 0).toLocaleString();

  document.getElementById("miner").textContent =
    data.miner ?? 0;

  document.getElementById("home").textContent =
    data.home ?? 0;
}

/* ================= Mine ================= */
async function mine() {
  const btn = document.getElementById("mineBtn");
  btn.disabled = true;

  const res = await fetch("/api/economy/mine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER.id })
  });

  const data = await res.json();

  if (data.error) {
    document.getElementById("mineResult").textContent = data.error;
    btn.disabled = false;
    return;
  }

  document.getElementById("mineResult").textContent =
    `+${data.reward} Coins`;

  startCooldown(3600); // ساعة
  loadProfile();
  loadOverview();
}

/* ================= Cooldown ================= */
function startCooldown(seconds) {
  cooldownEnd = Date.now() + seconds * 1000;
  updateCooldown();
  cooldownTimer = setInterval(updateCooldown, 1000);
}

function updateCooldown() {
  const now = Date.now();
  const diff = cooldownEnd - now;

  const box = document.getElementById("cooldownBox");
  const btn = document.getElementById("mineBtn");

  if (diff <= 0) {
    clearInterval(cooldownTimer);
    box.textContent = "✅ Ready to mine again";
    btn.disabled = false;
    return;
  }

  btn.disabled = true;

  const min = Math.floor(diff / 60000);
  const sec = Math.floor((diff % 60000) / 1000);

  box.textContent =
    `⏳ Cooldown: ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function checkCooldown() {
  // جاهزة للتطوير لاحقًا
}

/* ================= Top ================= */
async function loadTop(page) {
  const res = await fetch(`/api/economy/top?page=${page}`);
  const data = await res.json();

  currentPage = data.page;
  totalPages = data.totalPages;

  const tbody = document.getElementById("topTable");
  tbody.innerHTML = "";

  data.users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${u.rank}</td><td>${u.name}</td><td>${u.wallet}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} / ${totalPages}`;

  document.getElementById("prevBtn").disabled = currentPage <= 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function prevPage() {
  if (currentPage > 1) loadTop(currentPage - 1);
}

function nextPage() {
  if (currentPage < totalPages) loadTop(currentPage + 1);
}

/* ================= Economy Admin ================= */
async function addCoins() {
  const userId = document.getElementById("targetId").value;
  const amount = document.getElementById("amount").value;

  const res = await fetch("/api/admin/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, amount })
  });

  const data = await res.json();

  document.getElementById("adminResult").textContent =
    data.error ? data.error : "Coins Added";

  loadLogs();
  loadOverview();
}

/* ================= Admin Management ================= */
async function addAdmin() {
  const userId = document.getElementById("adminId").value;

  const res = await fetch("/api/admin/add-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  alert(data.error || "Admin Added Successfully");
}

async function removeAdmin() {
  const userId = document.getElementById("adminId").value;

  const res = await fetch("/api/admin/remove-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  alert(data.error || "Admin Removed Successfully");
}

/* ================= Logs ================= */
async function loadLogs() {
  const res = await fetch("/api/admin/logs");
  const logs = await res.json();

  document.getElementById("logsBox").textContent =
    logs.map(l =>
      `[${new Date(l.time).toLocaleString()}] ${l.type} | ${l.amount}`
    ).join("\n");
}

/* ================= Init ================= */
checkAuth();