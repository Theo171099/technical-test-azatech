import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Azatech Backend API running at http://localhost:${PORT}`);
  console.log(`📖 Health Check: http://localhost:${PORT}/api/health`);
});
