import Database from '@nozbe/watermelondb/Database';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import User from './models/User';
import Goal from './models/Goal';
import Transaction from './models/Transaction';
import Quest from './models/Quest';
import Achievement from './models/Achievement';
import Streak from './models/Streak';
import Setting from './models/Setting';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'SaveStateDB',
  jsi: true,
  onSetUpError: (error: Error) => {
    console.error('[SaveStateDB] Setup error:', error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [
    User,
    Goal,
    Transaction,
    Quest,
    Achievement,
    Streak,
    Setting,
  ],
});

export default database;
