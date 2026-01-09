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
const app = express();

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
const handle = fs.readdirSync("./src/handlers").filter(file => file.endsWith(".js"));
const data = require("./package.json");

post(
  clc.cyanBright(`Welcome to ${clc.blueBright(data.name)}! | Version: ${clc.blueBright(data.version)}`) + "\n" +
  `Coded By ${clc.yellow(`BooDyHsN`)} & ${clc.yellow(`AvonBots`)} With ${clc.redBright("❤️")}` + "\n" +
  `Discord: ${clc.blueBright(`Avon-Community.`)} | ${clc.blueBright(`mr.boodyhsn`)}`,
  "W",
  "magentaBright",
  "cyanBright"
);

post(`Logging into the BOT...`, "S", "yellowBright", "greenBright");

handle.forEach((file) => {
  require(`./src/handlers/${file}`)(client);
  amount += 1;
});

post(`${clc.cyanBright(amount)} Handler Is Loaded!!`, "S", "yellowBright", "greenBright");

/* ================= Web Server ================= */
app.use(express.json());

// ربط client بالـ API
app.use((req, res, next) => {
  req.client = client;
  next();
});

// Routes
app.use("/api/economy", require("./src/web/routes/economy"));

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  post(`🌐 Web Dashboard Running On Port ${PORT}`, "S", "cyanBright", "greenBright");
});

/* ================= Login ================= */
if (client.token) {
  client.login(client.token).catch(e => {
    post(
      "The Bot Token You Entered Is Incorrect Or Bot INTENTS Are OFF!",
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
process.on("unhandledRejection", (reason) => error(reason));
process.on("rejectionHandled", (promise) => error(promise));
process.on("uncaughtException", (e) => error(e));
process.on("uncaughtExceptionMonitor", (e) => error(e));