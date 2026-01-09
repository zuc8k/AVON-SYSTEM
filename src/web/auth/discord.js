const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: "/auth/discord/callback",
  scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
  return done(null, {
    id: profile.id,
    username: profile.username,
    avatar: profile.avatar
  });
}));

module.exports = passport;