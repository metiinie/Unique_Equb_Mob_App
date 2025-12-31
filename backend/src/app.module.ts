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
    ],
})
export class AppModule { }
