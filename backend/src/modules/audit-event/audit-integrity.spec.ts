import { AuditActionType, GlobalRole } from '@prisma/client';
import { AUDIT_ACTIVITY_MAP } from './audit-mapping';
import { MemberAuditEventDto } from './dto/audit-event-projection.dto';

/**
 * MANDATORY INTEGRITY GUARD
 * Enforces that the Activities Ledger remains a provable projection of AuditEvents.
 */
describe('Activities Ledger Hardening', () => {
    const roles = Object.values(GlobalRole);
    const actionTypes = Object.values(AuditActionType);

    test('Linguistic Hardening: Verb Whitelist & Length Constraint', () => {
        const WHITELIST = ['added', 'removed', 'executed', 'rejected', 'confirmed', 'activated', 'completed'];

        actionTypes.forEach(actionType => {
            const mapping = AUDIT_ACTIVITY_MAP[actionType];
            roles.forEach(role => {
                const label = mapping[role].label;

                // Rule: Max 60 chars
                expect(label.length).toBeLessThanOrEqual(60);

                // Rule: Verb whitelist only
                const words = label.toLowerCase().split(' ');
                const hasWhitelistedVerb = words.some(word => WHITELIST.includes(word));
                expect(hasWhitelistedVerb).toBe(true);

                // Rule: No causal phrases
                const forbidden = ['because', 'after', 'due to', 'mistakenly', 'decided', 'verification', 'error'];
                forbidden.forEach(word => {
                    expect(label.toLowerCase()).not.toContain(word);
                });
            });
        });
    });

    test('Provable Redaction: Assert Member Data Absence', () => {
        const memberDto = new MemberAuditEventDto();
        // Structural enforcement: DTO must not have these properties
        const forbiddenFields = [
            'actorUserId',
            'targetUserId',
            'internalReason',
            'metadata',
            'ipAddress',
            'deviceId',
            'actorRole'
        ];

        forbiddenFields.forEach(field => {
            expect(memberDto).not.toHaveProperty(field);
        });
    });

    test('100% Enum Coverage', () => {
        actionTypes.forEach(actionType => {
            expect(AUDIT_ACTIVITY_MAP[actionType]).toBeDefined();
        });
    });

    test('Visibility Proof', () => {
        actionTypes.forEach(actionType => {
            expect(AUDIT_ACTIVITY_MAP[actionType][GlobalRole.ADMIN].isUserVisible).toBe(true);
        });
    });
});
