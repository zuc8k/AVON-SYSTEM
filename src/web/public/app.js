let USER;

async function checkAuth() {
  const res = await fetch("/auth/me");
  if (!res.ok) return;

  USER = await res.json();

  document.getElementById("authBox").style.display = "none";
  document.getElementById("userBox").style.display = "block";
  document.getElementById("userInfo").textContent =
    `Logged in as ${USER.username}`;

  // لو Owner
  const logsTest = await fetch("/api/admin/logs");
  if (logsTest.ok) {
    document.getElementById("adminBox").style.display = "block";
    loadLogs();
  }
}

async function logout() {
  await fetch("/auth/logout");
  location.reload();
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
    data.error ? data.error : `Wallet Now: ${data.wallet}`;

  loadLogs();
}

async function loadLogs() {
  const res = await fetch("/api/admin/logs");
  const logs = await res.json();

  document.getElementById("logsBox").textContent =
    logs.map(l =>
      `[${new Date(l.time).toLocaleString()}] ${l.type} | from:${l.from || "-"} to:${l.to || "-"} | amount:${l.amount || "-"} | by:${l.by || "-"}`
    ).join("\n");
}

checkAuth();