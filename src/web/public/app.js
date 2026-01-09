const API = "/api/economy";

/* Load Profile */
async function loadProfile() {
  const id = document.getElementById("userId").value;
  if (!id) return alert("Enter User ID");

  const res = await fetch(`${API}/profile/${id}`);
  const data = await res.json();

  document.getElementById("profileBox").textContent =
    JSON.stringify(data, null, 2);
}

/* Mine */
async function mine() {
  const id = document.getElementById("userId").value;
  if (!id) return alert("Enter User ID");

  const res = await fetch(`${API}/mine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id })
  });

  const data = await res.json();

  document.getElementById("mineResult").textContent =
    data.error ? `❌ ${data.error}` :
    `✅ +${data.reward} | Wallet: ${data.wallet}`;
}

/* Top */
async function loadTop() {
  const res = await fetch(`${API}/top`);
  const data = await res.json();

  const box = document.getElementById("topList");
  box.innerHTML = "";

  data.users.forEach(u => {
    const div = document.createElement("div");
    div.className = "rank";
    div.textContent = `#${u.rank} - ${u.name} | ${u.wallet.toLocaleString()} 💰`;
    box.appendChild(div);
  });
}