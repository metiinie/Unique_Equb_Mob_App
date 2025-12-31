import { MemberStatus, UserRole } from '../../core/constants/enums';
import { DomainError } from '../../core/errors/domain_errors';
import { EqubMember } from '../../domain/entities/equb_member';
import { MemberId } from '../../domain/value_objects/ids';
import { EqubMemberDto } from '../backend/dto/equb_dto';

/**
 * Mapper: Backend DTO → Domain Entity (with validation).
 */
export class EqubMemberMapper {
  static toDomain(dto: EqubMemberDto): EqubMember {
    return new EqubMember({
      memberId: new MemberId(dto.memberId),
      name: dto.name,
      maskedPhone: dto.maskedPhone,
      roleInEqub: EqubMemberMapper.parseRole(dto.role),
      status: EqubMemberMapper.parseMemberStatus(dto.status),
    });
  }

  static toDto(member: EqubMember): EqubMemberDto {
    return new EqubMemberDto({
      memberId: member.memberId.value,
      name: member.name,
      maskedPhone: member.maskedPhone,
      role: EqubMemberMapper.roleToString(member.roleInEqub),
      status: EqubMemberMapper.memberStatusToString(member.status),
    });
  }

  static parseRole(role: string): UserRole {
    switch (role.toLowerCase()) {
      case 'member':
        return UserRole.member;
      case 'collector':
        return UserRole.collector;
      case 'admin':
        return UserRole.admin;
      default:
        throw new DomainError(
          `Invalid role from backend: ${role}. Allowed values: member, collector, admin.`,
          { code: 'INVALID_BACKEND_DATA' }
        );
    }
  }

  static roleToString(role: UserRole): string {
    return role;
  }

  static parseMemberStatus(status: string): MemberStatus {
    switch (status.toLowerCase()) {
      case 'ontime':
      case 'on_time':
        return MemberStatus.onTime;
      case 'late':
        return MemberStatus.late;
      case 'missed':
        return MemberStatus.missed;
      case 'onhold':
      case 'on_hold':
        return MemberStatus.onHold;
      default:
        throw new DomainError(
          `Invalid member status from backend: ${status}. ` +
          'Allowed values: onTime, late, missed, onHold.',
          { code: 'INVALID_BACKEND_DATA' }
        );
    }
  }

  static memberStatusToString(status: MemberStatus): string {
    return status;
  }
}
