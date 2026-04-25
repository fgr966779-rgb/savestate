import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users' as const;

  @field('email') email!: string;
  @field('nickname') nickname!: string;
  @field('avatar_id') avatarId!: string | null;
  @field('avatar_color') avatarColor!: string | null;
  @field('level') level!: number;
  @field('total_xp') totalXp!: number;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('synced_at') syncedAt!: number | null;

  static associations = {
    goals: { type: 'has_many' as const, foreignKey: 'user_id' },
    transactions: { type: 'has_many' as const, foreignKey: 'user_id' },
    quests: { type: 'has_many' as const, foreignKey: 'user_id' },
    achievements: { type: 'has_many' as const, foreignKey: 'user_id' },
    streaks: { type: 'has_many' as const, foreignKey: 'user_id' },
  };

  async updateLevel(newLevel: number): Promise<void> {
    await this.update((user) => {
      user.level = newLevel;
      user.updatedAt = new Date();
    });
  }

  async addXP(amount: number): Promise<void> {
    await this.update((user) => {
      user.totalXp += amount;
      user.updatedAt = new Date();
    });
  }
}
