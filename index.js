require("dotenv").config();

/* ================= Discord ================= */
const {
  Client,
  Collection,
  Partials,
  GatewayIntentBits
} = require("discord.js");

const clc = require("cli-color");
const fs = require("fs");

/* ================= Web ================= */
const express = require("express");
const session = require("express-session");
const app = express();

/* ================= OAuth ================= */
const passport = require("./src/web/auth/discord");

/* ================= Utils ================= */
const post = require("./src/functions/post.js");
const error = require("./src/functions/error.js");

/* ================= Client ================= */
const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(a => !isNaN(a)),
  partials: Object.values(Partials).filter(a => !isNaN(a))
});

/* ================= Player ================= */
const { Player } = require("discord-player");
const { YoutubeiExtractor, generateOauthTokens } = require("discord-player-youtubei");
const { DefaultExtractors } = require("@discord-player/extractor");

const player = new Player(client);

(async () => {
  await player.extractors.loadMulti(DefaultExtractors);
  await player.extractors.register(YoutubeiExtractor, {
    authentication: await generateOauthTokens()
  });
})();

/* ================= Config ================= */
client.config = require("./config.js");
client.token = client.config.token;

client.commands = new Collection();
client.cooldowns = new Collection();

/* ================= Handlers ================= */
let amount = 0;
const handlers = fs.readdirSync("./src/handlers").filter(f => f.endsWith(".js"));
const data = require("./package.json");

post(
  clc.cyanBright(`Welcome to ${clc.blueBright(data.name)}! | Version: ${clc.blueBright(data.version)}`) + "\n" +
  `Coded By ${clc.yellow("BooDyHsN")} & ${clc.yellow("AvonBots")} With ${clc.redBright("❤️")}` + "\n" +
  `Discord: ${clc.blueBright("Avon-Community.")} | ${clc.blueBright("mr.boodyhsn")}`,
  "W",
  "magentaBright",
  "cyanBright"
);

post(`Logging into the BOT...`, "S", "yellowBright", "greenBright");

handlers.forEach(file => {
  require(`./src/handlers/${file}`)(client);
  amount++;
});

post(`${clc.cyanBright(amount)} Handler Loaded Successfully!`, "S", "yellowBright", "greenBright");

/* ================= Web Middleware ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Dashboard Files
app.use(express.static("./src/web/public"));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "avon_dashboard_secret",
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Attach client to every request
app.use((req, res, next) => {
  req.client = client;
  next();
});

/* ================= Routes ================= */
app.use("/auth", require("./src/web/routes/auth"));

app.use("/api/overview", require("./src/web/routes/overview"));
app.use("/api/permissions", require("./src/web/routes/permissions"));
app.use("/api/economy", require("./src/web/routes/economy"));
app.use("/api/admin", require("./src/web/routes/admin"));

/* ================= Web Server ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  post(
    `🌐 Web Dashboard Running On Port ${PORT}`,
    "S",
    "cyanBright",
    "greenBright"
  );
});

/* ================= Login Bot ================= */
if (client.token) {
  client.login(client.token).catch(e => {
    post(
      "Bot Token Is Invalid Or INTENTS Are Disabled!",
      "E",
      "red",
      "redBright"
    );
    error(e);
  });
} else {
  post(
    "Please Add Your Bot Token In config.js!",
    "E",
    "red",
    "redBright"
  );
}

/* ================= Anti Crash ================= */
process.on("unhandledRejection", reason => error(reason));
process.on("rejectionHandled", promise => error(promise));
process.on("uncaughtException", e => error(e));
process.on("uncaughtExceptionMonitor", e => error(e));