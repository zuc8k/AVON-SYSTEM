const router = require("express").Router();
const economy = require("../../services/economy.service");

/* ===== Owner Check ===== */
function onlyOwner(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "NOT_LOGGED_IN" });

  const owners = req.client.config.owners || [];
  if (!owners.includes(req.user.id)) {
    return res.status(403).json({ error: "NOT_OWNER" });
  }
  next();
}

/* ===== Add Coins ===== */
router.post("/add", onlyOwner, async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount || isNaN(amount)) {
    return res.status(400).json({ error: "INVALID_DATA" });
  }

  const result = await economy.addCoins(
    req.client.db,
    userId,
    Number(amount),
    req.user.id
  );

  if (result.error) return res.status(400).json(result);
  res.json(result);
});

/* ===== Logs ===== */
router.get("/logs", onlyOwner, async (req, res) => {
  const logs = await economy.getLogs(req.client.db);
  res.json(logs);
});

module.exports = router;