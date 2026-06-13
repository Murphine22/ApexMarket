const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ApexMarket API',
      version: '1.0.0',
      description:
        'Production-ready REST API for the ApexMarket Supermarket Management System. ' +
        'JWT-secured with role-based access control.',
    },
    servers: [{ url: `http://localhost:${env.port}/api`, description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
