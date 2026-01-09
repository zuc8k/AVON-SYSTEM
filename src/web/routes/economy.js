const economyConfig = require("../storage/economy.json");

/* ================= Logs ================= */
async function pushLog(db, data) {
  const logs = (await db.get("logs.economy")) || [];
  logs.unshift({
    ...data,
    time: Date.now()
  });

  // نخلي آخر 200 عملية بس
  await db.set("logs.economy", logs.slice(0, 200));
}

/* ================= Service ================= */
module.exports = {

  /* ===== Get Profile ===== */
  getProfile: async (db, userId) => {
    return await db.get(`users.${userId}`);
  },

  /* ===== Register ===== */
  register: async (db, { id, tag }) => {
    if (await db.has(`users.${id}`)) return null;

    const data = {
      name: tag,
      wallet: economyConfig.default_coin || 0,
      miner: 0,
      home: 0,
      work: 0,
      rob: 0,
      frozen: false
    };

    await db.set(`users.${id}`, data);
    return data;
  },

  /* ===== Mine ===== */
  mine: async (db, userId) => {
    const profile = await db.get(`users.${userId}`);
    if (!profile) return { error: "NO_PROFILE" };
    if (profile.frozen) return { error: "ACCOUNT_FROZEN" };
    if (profile.home <= 0) return { error: "NO_HOME" };
    if (profile.miner <= 0) return { error: "NO_MINER" };

    const reward = economyConfig.miner?.[profile.miner] || 0;
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

  /* ===== Transfer ===== */
  transfer: async (db, from, to, amount) => {
    const sender = await db.get(`users.${from}`);
    const receiver = await db.get(`users.${to}`);

    if (!sender) return { error: "NO_PROFILE" };
    if (!receiver) return { error: "NO_TARGET" };
    if (sender.frozen) return { error: "ACCOUNT_FROZEN" };
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

  /* ===== Add Coins ===== */
  addCoins: async (db, userId, amount, by) => {
    const profile = await db.get(`users.${userId}`);
    if (!profile) return { error: "NO_PROFILE" };
    if (profile.frozen) return { error: "ACCOUNT_FROZEN" };

    await db.add(`users.${userId}.wallet`, amount);

    await pushLog(db, {
      type: "ADD",
      to: userId,
      amount,
      by
    });

    return { success: true };
  },

  /* ===== Remove Coins ===== */
  removeCoins: async (db, userId, amount, by) => {
    const profile = await db.get(`users.${userId}`);
    if (!profile) return { error: "NO_PROFILE" };

    await db.sub(`users.${userId}.wallet`, amount);

    await pushLog(db, {
      type: "REMOVE",
      to: userId,
      amount,
      by
    });

    return { success: true };
  },

  /* ===== Reset Wallet ===== */
  resetWallet: async (db, userId, by) => {
    if (!await db.has(`users.${userId}`)) {
      return { error: "NO_PROFILE" };
    }

    await db.set(`users.${userId}.wallet`, 0);

    await pushLog(db, {
      type: "RESET",
      to: userId,
      by
    });

    return { success: true };
  },

  /* ===== Freeze / Unfreeze ===== */
  toggleFreeze: async (db, userId, by) => {
    const profile = await db.get(`users.${userId}`);
    if (!profile) return { error: "NO_PROFILE" };

    const frozen = !profile.frozen;
    await db.set(`users.${userId}.frozen`, frozen);

    await pushLog(db, {
      type: frozen ? "FREEZE" : "UNFREEZE",
      to: userId,
      by
    });

    return { frozen };
  },

  /* ===== Top ===== */
  getTop: async (db, page = 1, limit = 10) => {
    const users = await db.get("users");
    if (!users) return null;

    const list = Object.entries(users)
      .map(([id, u]) => ({
        id,
        name: u.name,
        wallet: u.wallet || 0
      }))
      .sort((a, b) => b.wallet - a.wallet);

    const totalPages = Math.ceil(list.length / limit);
    const start = (page - 1) * limit;

    return {
      page,
      totalPages,
      users: list.slice(start, start + limit).map((u, i) => ({
        rank: start + i + 1,
        name: u.name,
        wallet: u.wallet.toLocaleString()
      }))
    };
  },

  /* ===== Logs ===== */
  getLogs: async (db) => {
    return (await db.get("logs.economy")) || [];
  }

};