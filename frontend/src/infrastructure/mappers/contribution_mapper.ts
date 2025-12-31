import { ContributionStatus } from '../../core/constants/enums';
import { DomainError, ContributionStatusError } from '../../core/errors/domain_errors';
import { Contribution } from '../../domain/entities/contribution';
import { EqubId, MemberId, UserId } from '../../domain/value_objects/ids';
import { ContributionDto } from '../backend/dto/contribution_dto';

/**
 * Mapper: Backend DTO → Domain Entity (with validation).
 * 
 * Validates status vocabulary and required fields.
 */
export class ContributionMapper {
  static toDomain(dto: ContributionDto): Contribution {
    // Validate status vocabulary
    const status = ContributionMapper.parseStatus(dto.status);


    // Parse dates
    const period = ContributionMapper.parseDate(dto.period);
    const setAt = ContributionMapper.parseDate(dto.setAt);

    return new Contribution({
      id: dto.id,
      equbId: new EqubId(dto.equbId),
      memberId: new MemberId(dto.memberId),
      period,
      roundNumber: dto.roundNumber,
      status,
      setBy: new UserId(dto.setBy),
      setAt,
      reason: dto.reason,
    });
  }

  static toDto(contribution: Contribution): ContributionDto {
    return new ContributionDto({
      id: contribution.id,
      equbId: contribution.equbId.value,
      memberId: contribution.memberId.value,
      period: contribution.period.toISOString(),
      roundNumber: contribution.roundNumber,
      status: ContributionMapper.statusToString(contribution.status),
      setBy: contribution.setBy.value,
      setAt: contribution.setAt.toISOString(),
      reason: contribution.reason,
    });
  }

  static parseStatus(status: string): ContributionStatus {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return ContributionStatus.confirmed;
      case 'unpaid':
      case 'pending':
        return ContributionStatus.pending;
      case 'onhold':
      case 'on_hold':
        return ContributionStatus.pending; // Fallback or reject? Let's say pending.
      default:
        throw new DomainError(
          `Invalid contribution status from backend: ${status}. ` +
          'Allowed values: paid, unpaid, onHold.',
          { code: 'INVALID_BACKEND_DATA' }
        );
    }
  }

  static statusToString(status: ContributionStatus): string {
    return status;
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
