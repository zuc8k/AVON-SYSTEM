const router = require("express").Router();
const economy = require("../../services/economy.service");

/* ================= Helpers ================= */
function isOwner(req) {
  const owners = req.client.config.owners || [];
  return owners.includes(req.user.id);
}

async function getAdmins(db) {
  return (await db.get("dashboard.admins")) || [];
}

async function isAdmin(req) {
  const owners = req.client.config.owners || [];
  const admins = await getAdmins(req.client.db);
  return owners.includes(req.user.id) || admins.includes(req.user.id);
}

/* ================= Auth Middleware ================= */
router.use(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "NOT_LOGGED_IN" });
  }
  next();
});

/* ================= Admin Management ================= */

/* ---- Add Admin (Owner Only) ---- */
router.post("/add-admin", async (req, res) => {
  if (!isOwner(req)) {
    return res.status(403).json({ error: "NOT_OWNER" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.json({ error: "NO_USER_ID" });
  }

  const db = req.client.db;
  const admins = await getAdmins(db);

  if (admins.includes(userId)) {
    return res.json({ error: "ALREADY_ADMIN" });
  }

  admins.push(userId);
  await db.set("dashboard.admins", admins);

  res.json({ success: true, admins });
});

/* ---- Remove Admin (Owner Only) ---- */
router.post("/remove-admin", async (req, res) => {
  if (!isOwner(req)) {
    return res.status(403).json({ error: "NOT_OWNER" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.json({ error: "NO_USER_ID" });
  }

  const db = req.client.db;
  const admins = await getAdmins(db);

  if (!admins.includes(userId)) {
    return res.json({ error: "NOT_ADMIN" });
  }

  const newAdmins = admins.filter(id => id !== userId);
  await db.set("dashboard.admins", newAdmins);

  res.json({ success: true, admins: newAdmins });
});

/* ---- Get Admins (Owner Only) ---- */
router.get("/admins", async (req, res) => {
  if (!isOwner(req)) {
    return res.status(403).json({ error: "NOT_OWNER" });
  }

  const admins = await getAdmins(req.client.db);
  res.json({ admins });
});

/* ================= Economy Control (Admin + Owner) ================= */

/* ---- Add Coins ---- */
router.post("/add", async (req, res) => {
  if (!await isAdmin(req)) {
    return res.status(403).json({ error: "NO_PERMISSION" });
  }

  const { userId, amount } = req.body;
  res.json(
    await economy.addCoins(
      req.client.db,
      userId,
      Number(amount),
      req.user.id
    )
  );
});

/* ---- Remove Coins ---- */
router.post("/remove", async (req, res) => {
  if (!await isAdmin(req)) {
    return res.status(403).json({ error: "NO_PERMISSION" });
  }

  const { userId, amount } = req.body;
  res.json(
    await economy.removeCoins(
      req.client.db,
      userId,
      Number(amount),
      req.user.id
    )
  );
});

/* ---- Reset Wallet ---- */
router.post("/reset", async (req, res) => {
  if (!await isAdmin(req)) {
    return res.status(403).json({ error: "NO_PERMISSION" });
  }

  const { userId } = req.body;
  res.json(
    await economy.resetWallet(
      req.client.db,
      userId,
      req.user.id
    )
  );
});

/* ---- Freeze / Unfreeze ---- */
router.post("/freeze", async (req, res) => {
  if (!await isAdmin(req)) {
    return res.status(403).json({ error: "NO_PERMISSION" });
  }

  const { userId } = req.body;
  res.json(
    await economy.toggleFreeze(
      req.client.db,
      userId,
      req.user.id
    )
  );
});

/* ================= Logs ================= */
router.get("/logs", async (req, res) => {
  if (!await isAdmin(req)) {
    return res.status(403).json({ error: "NO_PERMISSION" });
  }

  const logs = await economy.getLogs(req.client.db);
  res.json(logs);
});

module.exports = router;