const router = require("express").Router();
const economy = require("../../services/economy.service");

/* ===== Profile ===== */
router.get("/profile/:id", async (req, res) => {
  const profile = await economy.getProfile(req.client.db, req.params.id);
  if (!profile) return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
  res.json(profile);
});

/* ===== Register ===== */
router.post("/register", async (req, res) => {
  const { id, tag } = req.body;
  if (!id || !tag) return res.status(400).json({ error: "INVALID_DATA" });

  const data = await economy.register(req.client.db, { id, tag });
  if (!data) return res.status(400).json({ error: "ALREADY_REGISTERED" });

  res.json(data);
});

/* ===== Mine ===== */
router.post("/mine", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "USER_ID_REQUIRED" });

  const result = await economy.mine(req.client.db, userId);
  if (result.error) return res.status(400).json(result);

  res.json(result);
});

/* ===== Transfer ===== */
router.post("/transfer", async (req, res) => {
  const { from, to, amount } = req.body;
  if (!from || !to || !amount) {
    return res.status(400).json({ error: "INVALID_DATA" });
  }

  const result = await economy.transfer(req.client.db, from, to, amount);
  if (result.error) return res.status(400).json(result);

  res.json({ success: true });
});

/* ===== Top ===== */
router.get("/top", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const data = await economy.getTop(req.client.db, page);
  if (!data) return res.status(404).json({ error: "NO_USERS" });
  res.json(data);
});

module.exports = router;