import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Goal extends Model {
  static table = 'goals' as const;

  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'goal_id' },
  };

  @field('user_id') userId!: string;
  @field('title') title!: string;
  @field('target_amount') targetAmount!: number;
  @field('current_amount') currentAmount!: number;
  @field('icon') icon!: string | null;
  @field('color') color!: string | null;
  @field('strategy') strategy!: string | null;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('status') status!: 'active' | 'completed' | 'paused';
  @field('synced_at') syncedAt!: number | null;

  async deposit(amount: number): Promise<void> {
    const newAmount = this.currentAmount + amount;
    const isCompleted = newAmount >= this.targetAmount;

    await this.update((goal) => {
      goal.currentAmount = newAmount;
      goal.updatedAt = new Date();
      if (isCompleted) {
        goal.status = 'completed';
      }
    });
  }

  async withdraw(amount: number): Promise<void> {
    if (amount > this.currentAmount) {
      throw new Error(
        `Cannot withdraw ${amount}. Current amount is ${this.currentAmount}.`
      );
    }

    await this.update((goal) => {
      goal.currentAmount -= amount;
      goal.updatedAt = new Date();
      if (goal.status === 'completed') {
        goal.status = 'active';
      }
    });
  }

  getProgress(): number {
    if (this.targetAmount <= 0) return 0;
    const progress = (this.currentAmount / this.targetAmount) * 100;
    return Math.min(Math.round(progress * 100) / 100, 100);
  }
}
