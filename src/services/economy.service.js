const economyConfig = require("../storage/economy.json");

async function pushLog(db, data) {
  const log = {
    ...data,
    time: Date.now()
  };

  const logs = await db.get("logs.economy") || [];
  logs.unshift(log);

  // نخلي آخر 100 log بس
  await db.set("logs.economy", logs.slice(0, 100));
}

module.exports = {

  getProfile: async (db, userId) => {
    return await db.get(`users.${userId}`);
  },

  mine: async (db, userId) => {
    if (!await db.has(`users.${userId}`)) return { error: "NO_PROFILE" };

    const profile = await db.get(`users.${userId}`);
    if (profile.home <= 0) return { error: "NO_HOME" };
    if (profile.miner <= 0) return { error: "NO_MINER" };

    const reward = economyConfig.miner[profile.miner];
    await db.add(`users.${userId}.wallet`, reward);

    await pushLog(db, {
      type: "MINE",
      to: userId,
      amount: reward
    });

    return {
      reward,
      wallet: profile.wallet + reward
    };
  },

  transfer: async (db, from, to, amount) => {
    if (!await db.has(`users.${from}`)) return { error: "NO_PROFILE" };
    if (!await db.has(`users.${to}`)) return { error: "NO_TARGET" };

    const sender = await db.get(`users.${from}`);
    if (sender.wallet < amount) return { error: "NO_MONEY" };

    await db.sub(`users.${from}.wallet`, amount);
    await db.add(`users.${to}.wallet`, amount);

    await pushLog(db, {
      type: "TRANSFER",
      from,
      to,
      amount
    });

    return { success: true };
  },

  addCoins: async (db, targetId, amount, ownerId) => {
    if (!await db.has(`users.${targetId}`)) return { error: "NO_PROFILE" };

    await db.add(`users.${targetId}.wallet`, amount);

    await pushLog(db, {
      type: "ADD",
      to: targetId,
      amount,
      by: ownerId
    });

    const profile = await db.get(`users.${targetId}`);
    return { success: true, wallet: profile.wallet };
  },

  getLogs: async (db) => {
    return await db.get("logs.economy") || [];
  }

};