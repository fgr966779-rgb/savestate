import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Quest extends Model {
  static table = 'quests' as const;

  @field('user_id') userId!: string;
  @field('quest_template_id') questTemplateId!: string;
  @field('type') type!: 'daily' | 'weekly' | 'story';
  @field('status') status!: 'active' | 'completed' | 'expired';
  @field('progress') progress!: number;
  @field('target') target!: number;
  @field('xp_reward') xpReward!: number;
  @field('coin_reward') coinReward!: number;
  @date('expires_at') expiresAt!: Date | null;
  @date('completed_at') completedAt!: Date | null;
  @field('synced_at') syncedAt!: number | null;

  async advanceProgress(amount: number): Promise<void> {
    if (this.status !== 'active') return;

    const newProgress = Math.min(this.progress + amount, this.target);
    const isNowCompleted = newProgress >= this.target;

    await this.update((quest) => {
      quest.progress = newProgress;
      if (isNowCompleted) {
        quest.status = 'completed';
        quest.completedAt = new Date();
      }
    });
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isExpired(): boolean {
    if (this.status === 'expired') return true;
    if (this.expiresAt === null) return false;
    return new Date() > this.expiresAt;
  }
}
