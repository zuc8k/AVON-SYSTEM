const router = require("express").Router();

router.get("/", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "NOT_LOGGED_IN" });

  const botGuilds = req.client.guilds.cache.map(g => g.id);

  const sharedGuilds = req.user.guilds.filter(g =>
    botGuilds.includes(g.id)
  );

  res.json(sharedGuilds.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.icon
  })));
});

router.post("/select", (req, res) => {
  req.session.guildId = req.body.guildId;
  res.json({ success: true });
});

module.exports = router;