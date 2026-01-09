const router = require("express").Router();

/* ================= Helpers ================= */
function isOwner(req) {
  const owners = req.client.config.owners || [];
  return owners.includes(req.user.id);
}

async function getAdmins(db) {
  return (await db.get("dashboard.admins")) || [];
}

/* ================= Middleware ================= */
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "NOT_LOGGED_IN" });
  }
  next();
});

/* ================= Add Admin ================= */
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

/* ================= Remove Admin ================= */
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

/* ================= Get Admins ================= */
router.get("/admins", async (req, res) => {
  if (!isOwner(req)) {
    return res.status(403).json({ error: "NOT_OWNER" });
  }

  const admins = await getAdmins(req.client.db);
  res.json({ admins });
});

/* ================= Economy Logs ================= */
router.get("/logs", async (req, res) => {
  const db = req.client.db;
  const admins = await getAdmins(db);

  const owners = req.client.config.owners || [];
  const isAdmin = owners.includes(req.user.id) || admins.includes(req.user.id);

  if (!isAdmin) {
    return res.status(403).json({ error: "NO_PERMISSION" });
  }

  const logs = (await db.get("logs.economy")) || [];
  res.json(logs);
});

module.exports = router;