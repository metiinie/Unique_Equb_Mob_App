import { ReminderSettings } from '../entities/reminder_settings';
import { UserId } from '../value_objects/ids';

export interface ReminderRepository {
  getReminderSettings(userId: UserId): Promise<ReminderSettings | null>;

  saveReminderSettings(settings: ReminderSettings): Promise<void>;
}
