const express = require('express');
const helmet = require('helmet');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.tailwindcss.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
