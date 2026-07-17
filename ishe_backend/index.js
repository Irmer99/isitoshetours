require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./lib/db');
const logger = require('./lib/logger');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpecs = require('./lib/swagger');
const { generalLimiter } = require('./middleware/rateLimit');
const cache = require('./middleware/cache');
const requireRole = require('./middleware/requireRole');

const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/bookings.routes');
const clientRoutes = require('./routes/clients.routes');
const discountRoutes = require('./routes/discounts.routes');
const statsRoutes = require('./routes/stats.routes');
const contentRoutes = require('./routes/content.routes');
const notificationRoutes = require('./routes/notifications.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();
const port = process.env.PORT || 3000;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
app.use(generalLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

app.use('/health', healthRoutes);

app.use('/api-docs', authMiddleware, requireRole('superadmin'), swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/content', cache(300), contentRoutes);

app.use(errorHandler);

connectDB();

app.listen(port, () => {
  logger.info({ port }, 'Server running');
});
