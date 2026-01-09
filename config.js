const { ActivityType } = require("discord.js");

module.exports = {
  /* ===============================
   * 🤖 Bot Core Settings
   * =============================== */
  token: process.env.TOKEN || "",
  prefix: process.env.PREFIX || "!",
  serverId: process.env.SERVER_ID || "",
  only_one_guild: false,


  /* ===============================
   * 💾 Database Settings
   * =============================== */
  source: {
    database: {
      type: process.env.DATABASE_TYPE || "json",

      mongoURL: process.env.MONGO_URI || "",

      mysql: {
        host: process.env.MYSQL_HOST || "",
        user: process.env.MYSQL_USER || "",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || ""
      }
    }
  },


  /* ===============================
   * 🟢 Bot Presence / Status
   * =============================== */
  status: {
    activity: [
      "Working in {servers} Servers",
      "Serving {members} Members"
    ],
    type: [
      ActivityType.Watching
    ],
    presence: [
      "online"
    ]
  },


  /* ===============================
   * 📡 Webhook (Logs / Errors)
   * =============================== */
  webhook: {
    url: process.env.WEBHOOK_URL || "",
    username: process.env.WEBHOOK_USERNAME || "Avon Logger",
    avatar: process.env.WEBHOOK_AVATAR || ""
  },


  /* ===============================
   * 👑 Owners (Full Permissions)
   * =============================== */
  owners: process.env.OWNERS
    ? process.env.OWNERS.split(",")
    : [
        "505023206529433603",
        "750936874146594888",
        "765800029159030835"
      ],


  /* ===============================
   * 🤖 Chat Bot (AI / Fun)
   * =============================== */
  chat_bot: {
    name: "zu8k",
    gender: "Female"
  }
};