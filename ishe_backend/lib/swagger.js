const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ishe Tours API',
      version: '1.0.0',
      description: 'Backend API for Ishe Tours — booking management, admin dashboard, and content management.',
    },
    servers: [
      { url: '/api', description: 'API base path' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'superadmin'] },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            admin: { '$ref': '#/components/schemas/Admin' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        ClientInput: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            clientId: { '$ref': '#/components/schemas/Client' },
            itinerary: { type: 'string' },
            status: { type: 'string', enum: ['enquiry', 'confirmed', 'completed', 'cancelled'] },
            travelDate: { type: 'string', format: 'date' },
            participants: { type: 'integer' },
            totalAmount: { type: 'number' },
            discountCode: { type: 'string' },
            discountApplied: { type: 'number' },
            notes: { type: 'string' },
          },
        },
        BookingInput: {
          type: 'object',
          required: ['clientId', 'itinerary', 'travelDate', 'participants', 'totalAmount'],
          properties: {
            clientId: { type: 'string', description: 'MongoDB ObjectId of the client' },
            itinerary: { type: 'string' },
            itineraryTitle: { type: 'string' },
            travelDate: { type: 'string', format: 'date' },
            participants: { type: 'integer', minimum: 1 },
            totalAmount: { type: 'number' },
            discountCode: { type: 'string' },
            discountApplied: { type: 'number' },
            notes: { type: 'string' },
          },
        },
        BookingStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['enquiry', 'confirmed', 'completed', 'cancelled'] },
          },
        },
        Discount: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            code: { type: 'string' },
            type: { type: 'string', enum: ['percent', 'flat'] },
            value: { type: 'number' },
            appliesTo: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            usageLimit: { type: 'integer', nullable: true },
            usedCount: { type: 'integer' },
            active: { type: 'boolean' },
          },
        },
        DiscountInput: {
          type: 'object',
          required: ['code', 'type', 'value', 'appliesTo', 'startDate', 'endDate'],
          properties: {
            code: { type: 'string' },
            type: { type: 'string', enum: ['percent', 'flat'] },
            value: { type: 'number' },
            appliesTo: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            usageLimit: { type: 'integer' },
          },
        },
        DiscountValidateInput: {
          type: 'object',
          required: ['code', 'itineraryId'],
          properties: {
            code: { type: 'string' },
            itineraryId: { type: 'string' },
          },
        },
        DiscountValidateResponse: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            discount: { '$ref': '#/components/schemas/Discount' },
          },
        },
        Itinerary: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            slug: { type: 'string' },
            title: { type: 'string' },
            subtitle: { type: 'string' },
            difficulty: { type: 'string', enum: ['easy', 'moderate', 'hard'] },
            duration: { type: 'string' },
            pricing: {
              type: 'object',
              properties: {
                from: { type: 'number' },
                currency: { type: 'string' },
              },
            },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'integer' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  meals: { type: 'array', items: { type: 'string' } },
                  accommodation: { type: 'string' },
                },
              },
            },
          },
        },
        Destination: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            slug: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            highlights: { type: 'array', items: { type: 'string' } },
          },
        },
        Testimonial: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            text: { type: 'string' },
            rating: { type: 'integer' },
            avatar: { type: 'string' },
            order: { type: 'integer' },
          },
        },
        Team: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            bio: { type: 'string' },
            photo: { type: 'string' },
            order: { type: 'integer' },
          },
        },
        SiteSettings: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            key: { type: 'string' },
            data: { type: 'object' },
          },
        },
        StatsOverview: {
          type: 'object',
          properties: {
            bookingsThisMonth: { type: 'integer' },
            totalBookings: { type: 'integer' },
            totalRevenue: { type: 'number' },
            topItineraries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  count: { type: 'integer' },
                  revenue: { type: 'number' },
                },
              },
            },
          },
        },
        StatsConversion: {
          type: 'object',
          properties: {
            enquiries: { type: 'integer' },
            confirmed: { type: 'integer' },
            completed: { type: 'integer' },
            cancelled: { type: 'integer' },
            conversionRate: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
