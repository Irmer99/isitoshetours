require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./lib/db');
const logger = require('./lib/logger');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpecs = require('./lib/swagger');
const { generalLimiter } = require('./middleware/rateLimit');

const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/bookings.routes');
const clientRoutes = require('./routes/clients.routes');
const discountRoutes = require('./routes/discounts.routes');
const statsRoutes = require('./routes/stats.routes');
const contentRoutes = require('./routes/content.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(generalLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api-docs', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/content', contentRoutes);

app.use(errorHandler);

connectDB();

app.listen(port, () => {
  logger.info({ port }, 'Server running');
});
