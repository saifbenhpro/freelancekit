import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { QuotesModule } from './quotes/quotes.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 60 },   // 60 req/min par défaut
      { name: 'auth', ttl: 60000, limit: 10 },       // 10 req/min sur /auth
    ]),
    PrismaModule,
    AuthModule,
    ClientsModule,
    QuotesModule,
    ProfileModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
