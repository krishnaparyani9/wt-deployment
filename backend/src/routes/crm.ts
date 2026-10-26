import { Router } from 'express';
import mongoose from 'mongoose';
import CrmData from '../models/CrmData';

const router = Router();

router.get('/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

router.get('/data', async (_request, response, next) => {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({ error: 'MongoDB is not connected.' });
  }
  try {
    const record = await CrmData.findOne({ key: 'primary' }).lean();
    if (!record) return response.json({ data: null });
    const { _id, __v, key, createdAt, updatedAt, ...data } = record;
    return response.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put('/data', async (request, response, next) => {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({ error: 'MongoDB is not connected.' });
  }
  try {
    const { dealers, lines, products, salesmen, orders, settings } = request.body as Record<string, unknown>;
    const collections = { dealers, lines, products, salesmen, orders };
    for (const [name, records] of Object.entries(collections)) {
      if (!Array.isArray(records)) return response.status(400).json({ error: `"${name}" must be an array.` });
      if (records.length > 5000) return response.status(400).json({ error: `"${name}" cannot contain more than 5000 records.` });
    }
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return response.status(400).json({ error: '"settings" must be an object.' });
    }
    const data = await CrmData.findOneAndUpdate(
      { key: 'primary' },
      { $set: { ...collections, settings } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    if (!data) return response.status(500).json({ error: 'The server could not save CRM data.' });
    return response.json({ saved: true, updatedAt: data.updatedAt });
  } catch (error) {
    return next(error);
  }
});

export default router;
