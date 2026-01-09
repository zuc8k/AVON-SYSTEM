const router = require("express").Router();
const economy = require("../../services/economy.service");

/* Profile */
router.get("/profile/:id", async (req, res) => {
  const profile = await economy.getProfile(
    req.client.db,
    req.params.id
  );

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.json(profile);
});

/* Register */
router.post("/register", async (req, res) => {
  const user = req.body.user; // { id, tag }
  const data = await economy.register(req.client.db, user);

  if (!data) {
    return res.status(400).json({ error: "Profile already exists" });
  }

  res.json(data);
});

/* Top */
router.get("/top", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const data = await economy.getTop(req.client.db, page);

  if (!data) {
    return res.status(404).json({ error: "No users" });
  }

  res.json(data);
});

module.exports = router;