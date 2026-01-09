let USER;

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

async function checkAuth() {
  const res = await fetch("/auth/me");
  if (!res.ok) location.href = "/auth/discord";

  USER = await res.json();
  document.getElementById("userInfo").textContent =
    `${USER.username}`;

  loadProfile();
  loadTop();

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
  const res = await fetch("/api/economy/mine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER.id })
  });

  const data = await res.json();
  document.getElementById("mineResult").textContent =
    data.error ? data.error : `+${data.reward} Coins`;

  loadProfile();
}

async function loadTop() {
  const res = await fetch("/api/economy/top");
  const data = await res.json();

  const tbody = document.getElementById("topTable");
  tbody.innerHTML = "";

  data.users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${u.rank}</td><td>${u.name}</td><td>${u.wallet}</td>`;
    tbody.appendChild(tr);
  });
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