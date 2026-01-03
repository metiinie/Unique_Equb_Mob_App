import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { EqubModule } from './modules/equb/equb.module';
import { MembershipModule } from './modules/membership/membership.module';
import { ContributionModule } from './modules/contribution/contribution.module';
import { PayoutModule } from './modules/payout/payout.module';
import { AuditEventModule } from './modules/audit-event/audit-event.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SystemStatusService } from './modules/common/system-status.service'; // Provided via ReportingModule if exported? Or directly?
import { SystemSafetyGuard } from './common/guards/system-safety.guard';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        EqubModule,
        MembershipModule,
        ContributionModule,
        PayoutModule,
        AuditEventModule,
        AuthModule,
        UserModule,
        ReportingModule,
        NotificationModule,
        AnalyticsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: SystemSafetyGuard,
        },
    ],
})
export class AppModule { }
