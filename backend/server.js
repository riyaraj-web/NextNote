import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './src/routes/auth.js';
import notesRoutes from './src/routes/notes.js';
import tenantsRoutes from './src/routes/tenants.js';
import healthRoute from './src/routes/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://*.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tenants', tenantsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

export default app;