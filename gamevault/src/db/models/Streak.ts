import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Streak extends Model {
  static table = 'streaks' as const;

  @field('user_id') userId!: string;
  @field('current_streak') currentStreak!: number;
  @field('longest_streak') longestStreak!: number;
  @date('last_deposit_date') lastDepositDate!: Date | null;
  @field('freeze_count') freezeCount!: number;
  @field('synced_at') syncedAt!: number | null;

  async incrementStreak(): Promise<void> {
    const newStreak = this.currentStreak + 1;
    const newLongest = Math.max(newStreak, this.longestStreak);

    await this.update((streak) => {
      streak.currentStreak = newStreak;
      streak.longestStreak = newLongest;
      streak.lastDepositDate = new Date();
    });
  }

  async resetStreak(): Promise<void> {
    await this.update((streak) => {
      streak.currentStreak = 0;
      streak.lastDepositDate = null;
    });
  }

  async useFreeze(): Promise<void> {
    if (this.freezeCount <= 0) {
      throw new Error('No freezes available. Current freeze count is 0.');
    }

    await this.update((streak) => {
      streak.freezeCount -= 1;
    });
  }
}
