import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
  static table = 'transactions' as const;

  static associations = {
    goals: { type: 'belongs_to' as const, key: 'goal_id' },
  };

  @field('user_id') userId!: string;
  @field('goal_id') goalId!: string;
  @field('type') type!: 'deposit' | 'withdrawal' | 'bonus';
  @field('amount') amount!: number;
  @field('category') category!: string | null;
  @field('note') note!: string | null;
  @field('xp_earned') xpEarned!: number;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('synced_at') syncedAt!: number | null;
}
