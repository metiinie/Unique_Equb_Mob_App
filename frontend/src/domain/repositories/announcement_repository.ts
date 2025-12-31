import { Announcement } from '../entities/announcement';
import { EqubId } from '../value_objects/ids';

export interface AnnouncementRepository {
  getAnnouncements(equbId: EqubId): Promise<Announcement[]>;
  createAnnouncement(announcement: Announcement): Promise<Announcement>;
}
