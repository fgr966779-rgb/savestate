import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'email', type: 'string' },
        { name: 'nickname', type: 'string' },
        { name: 'avatar_id', type: 'string', isOptional: true },
        { name: 'avatar_color', type: 'string', isOptional: true },
        { name: 'level', type: 'number' },
        { name: 'total_xp', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'goals',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'target_amount', type: 'number' },
        { name: 'current_amount', type: 'number' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'strategy', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'goal_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'category', type: 'string', isOptional: true },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'xp_earned', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'quests',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'quest_template_id', type: 'string' },
        { name: 'type', type: 'string', isIndexed: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'progress', type: 'number' },
        { name: 'target', type: 'number' },
        { name: 'xp_reward', type: 'number' },
        { name: 'coin_reward', type: 'number' },
        { name: 'expires_at', type: 'number', isOptional: true },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'achievements',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'achievement_id', type: 'string', isIndexed: true },
        { name: 'unlocked', type: 'boolean' },
        { name: 'unlocked_at', type: 'number', isOptional: true },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'streaks',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'current_streak', type: 'number' },
        { name: 'longest_streak', type: 'number' },
        { name: 'last_deposit_date', type: 'number', isOptional: true },
        { name: 'freeze_count', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'key', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
