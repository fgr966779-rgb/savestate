import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Achievement extends Model {
  static table = 'achievements' as const;

  @field('user_id') userId!: string;
  @field('achievement_id') achievementId!: string;
  @field('unlocked') unlocked!: boolean;
  @date('unlocked_at') unlockedAt!: Date | null;
  @field('synced_at') syncedAt!: number | null;

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    await this.update((achievement) => {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
    });
  }
}
