export class CreateAuditEventDto {
    readonly actorUserId: string;
    readonly actorRole: string;
    readonly actionType: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly payload: any;
}
