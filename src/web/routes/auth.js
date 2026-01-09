const router = require("express").Router();
const passport = require("passport");

router.get("/discord",
  passport.authenticate("discord")
);

router.get("/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "NOT_LOGGED_IN" });
  res.json(req.user);
});

module.exports = router;