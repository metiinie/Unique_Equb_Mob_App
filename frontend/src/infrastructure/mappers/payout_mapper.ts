import { PayoutStatus } from '../../core/constants/enums';
import { DomainError } from '../../core/errors/domain_errors';
import { Payout } from '../../domain/entities/payout';
import { EqubId, MemberId } from '../../domain/value_objects/ids';
import { PayoutDto } from '../backend/dto/payout_dto';

/**
 * Mapper: Backend DTO → Domain Entity (with validation).
 */
export class PayoutMapper {
  static toDomain(dto: PayoutDto): Payout {
    // Validate status vocabulary
    const status = PayoutMapper.parseStatus(dto.status);

    return new Payout({
      id: dto.id,
      equbId: new EqubId(dto.equbId),
      memberId: new MemberId(dto.memberId),
      roundNumber: dto.roundNumber,
      status,
      blockedReason: dto.blockedReason,
    });
  }

  static toDto(payout: Payout): PayoutDto {
    return new PayoutDto({
      id: payout.id,
      equbId: payout.equbId.value,
      memberId: payout.memberId.value,
      roundNumber: payout.roundNumber,
      status: PayoutMapper.statusToString(payout.status),
      blockedReason: payout.blockedReason,
    });
  }

  static parseStatus(status: string): PayoutStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return PayoutStatus.pending;
      case 'adminconfirmed':
      case 'admin_confirmed':
        return PayoutStatus.adminConfirmed;
      case 'memberconfirmed':
      case 'member_confirmed':
        return PayoutStatus.memberConfirmed;
      case 'completed':
        return PayoutStatus.completed;
      default:
        throw new DomainError(
          `Invalid payout status from backend: ${status}. ` +
          'Allowed values: pending, adminConfirmed, memberConfirmed, completed.',
          { code: 'INVALID_BACKEND_DATA' }
        );
    }
  }

  static statusToString(status: PayoutStatus): string {
    return status;
  }
}
