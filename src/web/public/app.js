let USER;

async function checkAuth() {
  const res = await fetch("/auth/me");
  if (!res.ok) return;

  USER = await res.json();

  document.getElementById("authBox").style.display = "none";
  document.getElementById("userBox").style.display = "block";
  document.getElementById("userInfo").textContent =
    `Logged in as ${USER.username}`;

  // Owner check
  const owners = await fetch("/api/admin/check").catch(() => null);
  if (owners?.ok) {
    document.getElementById("adminBox").style.display = "block";
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
    data.error ? data.error : `✅ Wallet: ${data.wallet}`;
}

async function loadTop() {
  const res = await fetch("/api/economy/top");
  const data = await res.json();

  const box = document.getElementById("topList");
  box.innerHTML = "";

  data.users.forEach(u => {
    const div = document.createElement("div");
    div.textContent = `#${u.rank} ${u.name} - ${u.wallet}`;
    box.appendChild(div);
  });
}

checkAuth();