import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function validateEnv() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change_me_in_production') {
    console.error('❌ JWT_SECRET est absent ou non défini. Arrêt du serveur.');
    process.exit(1);
  }
  if (secret.length < 32) {
    console.error('❌ JWT_SECRET trop court (minimum 32 caractères). Arrêt du serveur.');
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'];
  app.enableCors({ origin: allowedOrigins });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  console.log(`🚀 Backend running on port ${process.env.PORT ?? 3001}`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
