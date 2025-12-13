import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { appConfig } from './config/app.config';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CategoriesModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
  exports: [PrismaService],
})
export class AppModule {}
