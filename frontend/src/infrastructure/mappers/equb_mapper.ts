import { EqubStatus, EqubFrequency } from '../../core/constants/enums';
import { DomainError } from '../../core/errors/domain_errors';
import { Equb } from '../../domain/entities/equb';
import { EqubId, MemberId } from '../../domain/value_objects/ids';
import { EqubDto } from '../backend/dto/equb_dto';
import { EqubMemberMapper } from './equb_member_mapper';

/**
 * Mapper: Backend DTO → Domain Entity (with validation).
 * 
 * This enforces: "The system rejects lies, even from its own backend."
 */
export class EqubMapper {
  static toDomain(dto: EqubDto): Equb {
    // Validate status vocabulary
    const status = EqubMapper.parseStatus(dto.status);

    // Validate frequency
    const frequency = EqubMapper.parseFrequency(dto.frequency);

    // Validate start date
    const startDate = EqubMapper.parseDate(dto.startDate);

    // Map members (with validation)
    const members = dto.members.map((m) => EqubMemberMapper.toDomain(m));

    // Map payout order
    const payoutOrder = dto.payoutOrder.map((id) => new MemberId(id));

    return new Equb({
      id: new EqubId(dto.id),
      name: dto.name,
      contributionAmount: dto.contributionAmount,
      frequency,
      startDate,
      status,
      members,
      payoutOrder,
      currentRoundNumber: dto.currentRoundNumber,
      totalRounds: dto.totalRounds,
    });
  }

  static toDto(equb: Equb): EqubDto {
    return new EqubDto({
      id: equb.id.value,
      name: equb.name,
      contributionAmount: equb.contributionAmount,
      frequency: EqubMapper.frequencyToString(equb.frequency),
      startDate: equb.startDate.toISOString(),
      status: EqubMapper.statusToString(equb.status),
      members: equb.members.map((m) => EqubMemberMapper.toDto(m)),
      payoutOrder: equb.payoutOrder.map((id) => id.value),
      currentRoundNumber: equb.currentRoundNumber,
      totalRounds: equb.totalRounds,
    });
  }

  static parseStatus(status: string): EqubStatus {
    switch (status.toLowerCase()) {
      case 'draft':
        return EqubStatus.draft;
      case 'planned':
        return EqubStatus.active;
      case 'active':
        return EqubStatus.active;
      case 'completed':
        return EqubStatus.completed;
      case 'canceled':
        return EqubStatus.terminated;
      default:
        throw new DomainError(
          `Invalid Equb status from backend: ${status}. ` +
          'Allowed values: draft, active, onHold, completed, terminated.',
          { code: 'INVALID_BACKEND_DATA' }
        );
    }
  }

  static statusToString(status: EqubStatus): string {
    return status;
  }

  static parseFrequency(frequency: string): EqubFrequency {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return EqubFrequency.daily;
      case 'weekly':
        return EqubFrequency.weekly;
      case 'monthly':
        return EqubFrequency.monthly;
      default:
        throw new DomainError(
          `Invalid Equb frequency from backend: ${frequency}. ` +
          'Allowed values: daily, weekly, monthly.',
          { code: 'INVALID_BACKEND_DATA' }
        );
    }
  }

  static frequencyToString(frequency: EqubFrequency): string {
    return frequency;
  }

  static parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new DomainError(
        `Invalid date format from backend: ${dateString}. Expected ISO 8601 format.`,
        { code: 'INVALID_BACKEND_DATA' }
      );
    }
    return date;
  }
}
