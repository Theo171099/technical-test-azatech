import app from './app';
import { initDatabaseConnection } from './utils/prisma';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await initDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Azatech Backend API running at http://localhost:${PORT}`);
    console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
