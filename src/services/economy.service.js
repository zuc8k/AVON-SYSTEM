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
      wallet: 1000,
      miner: 0,
      home: 0,
      work: 0,
      rob: 0
    };

    await db.set(`users.${user.id}`, data);
    return data;
  },

  addCoins: async (db, userId, amount) => {
    await db.add(`users.${userId}.wallet`, amount);
  },

  removeCoins: async (db, userId, amount) => {
    await db.sub(`users.${userId}.wallet`, amount);
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