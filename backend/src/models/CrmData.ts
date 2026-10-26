import mongoose, { Schema } from 'mongoose';
import type { CrmDataDocument } from '../types';

const crmDataSchema = new Schema<CrmDataDocument>(
  {
    key: { type: String, unique: true, default: 'primary' },
    dealers: { type: [Schema.Types.Mixed], default: [] },
    lines: { type: [Schema.Types.Mixed], default: [] },
    products: { type: [Schema.Types.Mixed], default: [] },
    salesmen: { type: [Schema.Types.Mixed], default: [] },
    orders: { type: [Schema.Types.Mixed], default: [] },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export default mongoose.model<CrmDataDocument>('CrmData', crmDataSchema);
