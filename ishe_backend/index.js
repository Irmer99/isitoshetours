require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./lib/db');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpecs = require('./lib/swagger');

const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/bookings.routes');
const clientRoutes = require('./routes/clients.routes');
const discountRoutes = require('./routes/discounts.routes');
const statsRoutes = require('./routes/stats.routes');
const contentRoutes = require('./routes/content.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { explorer: true }));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/content', contentRoutes);

app.use(errorHandler);

connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
