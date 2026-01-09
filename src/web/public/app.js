let USER;
let currentPage = 1;
let totalPages = 1;
let cooldownTimer = null;
let cooldownEnd = 0;

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

async function checkAuth() {
  const res = await fetch("/auth/me");
  if (!res.ok) location.href = "/auth/discord";

  USER = await res.json();
  document.getElementById("userInfo").textContent = USER.username;

  loadProfile();
  loadTop(1);
  checkCooldown();

  const logsCheck = await fetch("/api/admin/logs");
  if (logsCheck.ok) {
    document.getElementById("ownerNav").style.display = "block";
    loadLogs();
  }
}

async function logout() {
  await fetch("/auth/logout");
  location.reload();
}

async function loadProfile() {
  const res = await fetch(`/api/economy/profile/${USER.id}`);
  const data = await res.json();

  document.getElementById("wallet").textContent = data.wallet.toLocaleString();
  document.getElementById("miner").textContent = data.miner;
  document.getElementById("home").textContent = data.home;
}

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
}

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
  // لو حابب بعدين نخزن آخر وقت Mine في DB
}

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
}

async function loadLogs() {
  const res = await fetch("/api/admin/logs");
  const logs = await res.json();

  document.getElementById("logsBox").textContent =
    logs.map(l =>
      `[${new Date(l.time).toLocaleString()}] ${l.type} | ${l.amount}`
    ).join("\n");
}

checkAuth();