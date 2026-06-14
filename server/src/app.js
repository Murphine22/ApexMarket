const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error');

function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow the configured client origin with credentials
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );

  // Body parsing + cookies
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Sanitize against NoSQL injection
  app.use(mongoSanitize());

  // Compression + logging (quiet in tests)
  app.use(compression());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  // Rate limiting to mitigate brute-force attacks
  const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // API docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'ApexMarket API Docs' }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

  // Routes
  app.use('/api', routes);

  app.get('/', (_req, res) =>
    res.json({ success: true, message: 'ApexMarket API. See /api/docs for documentation.' })
  );

  // 404 + error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
