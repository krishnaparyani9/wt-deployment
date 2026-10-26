import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import crmRouter from './routes/crm';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter((allowedOrigin): allowedOrigin is string => Boolean(allowedOrigin))
      .map((allowedOrigin) => allowedOrigin.replace(/\/+$/, ''));
    callback(null, !origin || allowedOrigins.includes(origin.replace(/\/+$/, '')));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', crmRouter);

const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error('CRM API error:', error);
  response.status(500).json({ error: 'The server could not complete this request.' });
};

app.use(handleError);

export default app;
