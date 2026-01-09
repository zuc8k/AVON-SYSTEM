const economyConfig = require("../storage/economy.json");

/* ================= Logs Helper ================= */
async function pushLog(db, data) {
  const log = {
    ...data,
    time: Date.now()
  };

  const logs = (await db.get("logs.economy")) || [];
  logs.unshift(log);

  // نحتفظ بآخر 100 عملية بس
  await db.set("logs.economy", logs.slice(0, 100));
}

/* ================= Economy Service ================= */
module.exports = {

  /* ===== Get Profile ===== */
  getProfile: async (db, userId) => {
    return await db.get(`users.${userId}`);
  },

  /* ===== Mine ===== */
  mine: async (db, userId) => {
    if (!await db.has(`users.${userId}`)) {
      return { error: "NO_PROFILE" };
    }

    const profile = await db.get(`users.${userId}`);

    if ((profile.home || 0) <= 0) {
      return { error: "NO_HOME" };
    }

    if ((profile.miner || 0) <= 0) {
      return { error: "NO_MINER" };
    }

    const reward = Number(economyConfig.miner[profile.miner]) || 0;

    await db.add(`users.${userId}.wallet`, reward);

    // تسجيل Log
    await pushLog(db, {
      type: "MINE",
      to: userId,
      amount: reward
    });

    const newWallet = (profile.wallet || 0) + reward;

    return {
      success: true,
      reward,
      wallet: newWallet
    };
  },

  /* ===== Transfer ===== */
  transfer: async (db, from, to, amount) => {
    amount = Number(amount);

    if (!await db.has(`users.${from}`)) {
      return { error: "NO_PROFILE" };
    }

    if (!await db.has(`users.${to}`)) {
      return { error: "NO_TARGET" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { error: "INVALID_AMOUNT" };
    }

    const sender = await db.get(`users.${from}`);

    if ((sender.wallet || 0) < amount) {
      return { error: "NO_MONEY" };
    }

    await db.sub(`users.${from}.wallet`, amount);
    await db.add(`users.${to}.wallet`, amount);

    // تسجيل Log
    await pushLog(db, {
      type: "TRANSFER",
      from,
      to,
      amount
    });

    return { success: true };
  },

  /* ===== Add Coins (Owner) ===== */
  addCoins: async (db, targetId, amount, ownerId) => {
    amount = Number(amount);

    if (!await db.has(`users.${targetId}`)) {
      return { error: "NO_PROFILE" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { error: "INVALID_AMOUNT" };
    }

    await db.add(`users.${targetId}.wallet`, amount);

    // تسجيل Log
    await pushLog(db, {
      type: "ADD",
      to: targetId,
      amount,
      by: ownerId
    });

    const profile = await db.get(`users.${targetId}`);

    return {
      success: true,
      wallet: profile.wallet
    };
  },

  /* ===== Get Logs ===== */
  getLogs: async (db) => {
    return (await db.get("logs.economy")) || [];
  }

};