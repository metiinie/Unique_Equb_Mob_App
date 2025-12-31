import { NotificationItem } from '../entities/notification_item';
import { UserId } from '../value_objects/ids';

export interface NotificationRepository {
  getNotifications(userId: UserId): Promise<NotificationItem[]>;

  markAsRead(notificationId: string): Promise<void>;
}
