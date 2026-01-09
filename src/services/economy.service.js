const economyConfig = require("../storage/economy.json");

module.exports = {

  hasProfile: async (db, userId) => {
    return await db.has(`users.${userId}`);
  },

  getProfile: async (db, userId) => {
    return await db.get(`users.${userId}`);
  },

  register: async (db, user) => {
    if (await db.has(`users.${user.id}`)) return null;

    const data = {
      name: user.tag,
      wallet: economyConfig.default_coin || 1000,
      miner: 0,
      home: 0,
      work: 0,
      rob: 0
    };

    await db.set(`users.${user.id}`, data);
    return data;
  },

  mine: async (db, userId) => {
    if (!await db.has(`users.${userId}`)) {
      return { error: "NO_PROFILE" };
    }

    const profile = await db.get(`users.${userId}`);

    if (profile.home <= 0) {
      return { error: "NO_HOME" };
    }

    if (profile.miner <= 0) {
      return { error: "NO_MINER" };
    }

    const reward = economyConfig.miner[profile.miner];

    await db.add(`users.${userId}.wallet`, reward);

    return {
      reward,
      wallet: profile.wallet + reward,
      minerLevel: profile.miner
    };
  },

  transfer: async (db, from, to, amount) => {
    const sender = await db.get(`users.${from}`);
    if (!sender) return { error: "NO_PROFILE" };
    if (sender.wallet < amount) return { error: "NO_MONEY" };

    await db.sub(`users.${from}.wallet`, amount);
    await db.add(`users.${to}.wallet`, amount);

    return { success: true };
  },

  getTop: async (db, page = 1, limit = 12) => {
    if (!await db.has("users")) return null;

    const users = Object.values(await db.get("users"))
      .sort((a, b) => b.wallet - a.wallet);

    const start = (page - 1) * limit;

    return {
      page,
      total: users.length,
      totalPages: Math.ceil(users.length / limit),
      users: users.slice(start, start + limit).map((u, i) => ({
        rank: start + i + 1,
        name: u.name,
        wallet: u.wallet
      }))
    };
  }

};