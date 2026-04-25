// migration_v1.js — Initial migration: creates all SaveState tables
// This file is intentionally plain JS (no TypeScript) because WatermelonDB's
// SQLiteAdapter loads migrations via Metro/Webpack and expects simple modules.

const migration = {
  version: 1,
  tables: [
    {
      name: 'users',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        nickname TEXT NOT NULL,
        avatar_id TEXT,
        avatar_color TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        total_xp INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced_at INTEGER,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
    },
    {
      name: 'goals',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        target_amount INTEGER NOT NULL,
        current_amount INTEGER NOT NULL DEFAULT 0,
        icon TEXT,
        color TEXT,
        strategy TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        synced_at INTEGER,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
      index: 'CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals (user_id);',
    },
    {
      name: 'transactions',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        goal_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        category TEXT,
        note TEXT,
        xp_earned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        synced_at INTEGER,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);',
        'CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON transactions (goal_id);',
        'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);',
      ],
    },
    {
      name: 'quests',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        quest_template_id TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        progress INTEGER NOT NULL DEFAULT 0,
        target INTEGER NOT NULL,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL DEFAULT 0,
        expires_at INTEGER,
        completed_at INTEGER,
        synced_at INTEGER,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests (user_id);',
        'CREATE INDEX IF NOT EXISTS idx_quests_type ON quests (type);',
        'CREATE INDEX IF NOT EXISTS idx_quests_status ON quests (status);',
      ],
    },
    {
      name: 'achievements',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked INTEGER NOT NULL DEFAULT 0,
        unlocked_at INTEGER,
        synced_at INTEGER,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
      indexes: [
        'CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements (user_id);',
        'CREATE INDEX IF NOT EXISTS idx_achievements_achievement_id ON achievements (achievement_id);',
      ],
    },
    {
      name: 'streaks',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_deposit_date INTEGER,
        freeze_count INTEGER NOT NULL DEFAULT 0,
        synced_at INTEGER,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
      index: 'CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks (user_id);',
    },
    {
      name: 'settings',
      schema: `
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        _status TEXT NOT NULL DEFAULT 'created',
        _changed TEXT NOT NULL,
        _lsm INTEGER,
        is_synced INTEGER NOT NULL DEFAULT 0
      `,
      index: 'CREATE INDEX IF NOT EXISTS idx_settings_key ON settings (key);',
    },
  ],
};

async function up(db: any): Promise<void> {
  for (const table of migration.tables) {
    await db.unsafeExec({
      sqls: [
        `CREATE TABLE IF NOT EXISTS ${table.name} (${table.schema});`,
      ],
    });

    if (table.index) {
      await db.unsafeExec({ sqls: [table.index] });
    }
    if (table.indexes) {
      await db.unsafeExec({ sqls: table.indexes });
    }
  }
}

async function down(db: any): Promise<void> {
  for (const table of migration.tables) {
    await db.unsafeExec({
      sqls: [`DROP TABLE IF EXISTS ${table.name};`],
    });
  }
}

export default { up, down };
