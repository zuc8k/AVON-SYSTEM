const router = require("express").Router();

router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "NOT_LOGGED_IN" });
  }

  const userId = req.user.id;
  const db = req.client.db;

  const owners = req.client.config.owners || [];
  const isOwner = owners.includes(userId);

  const admins = (await db.get("dashboard.admins")) || [];
  const isAdmin = admins.includes(userId);

  res.json({
    isOwner,
    isAdmin: isOwner || isAdmin
  });
});

module.exports = router;