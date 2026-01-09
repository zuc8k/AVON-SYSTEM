const router = require("express").Router();

/*
  Overview API
  عرض فقط (Coins / Level / Rank)
*/
router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "NOT_LOGGED_IN" });
  }

  const db = req.client.db;
  const userId = req.user.id;

  if (!await db.has(`users.${userId}`)) {
    return res.json({
      wallet: 0,
      level: 0,
      rank: "—"
    });
  }

  const profile = await db.get(`users.${userId}`);

  res.json({
    wallet: Number(profile.wallet) || 0,
    level: Number(profile.level) || 0, // Placeholder
    rank: profile.rank || "—"
  });
});

module.exports = router;