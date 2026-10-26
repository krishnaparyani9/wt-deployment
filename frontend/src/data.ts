import type { CrmData } from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const SEED_DATA: CrmData = {
  dealers: [
    { id: 'dealer-1', name: 'TEST1', phone: '9568794521', email: '', location: 'TEST1', lineIds: ['line-1'] },
  ],
  lines: [
    { id: 'line-1', name: 'TEST1', description: 'Supply route', dealerId: 'dealer-1' },
  ],
  products: [
    { id: 'product-1', name: 'PRODUCTTEST1', type: 'TEA', unit: 'Kg', rate: 320 },
  ],
  salesmen: [
    { id: 'salesman-1', name: 'TEST1', phone: '78946112214', email: '', dealerIds: ['dealer-1'] },
  ],
  orders: [],
  settings: { companyName: 'Atlas CRM', currency: 'INR' },
};

async function readResponse(response: Response): Promise<unknown> {
  const result = await response.json() as { error?: string };
  if (!response.ok) {
    throw new Error(result.error || `CRM API returned ${response.status}.`);
  }
  return result;
}

export async function loadData(): Promise<CrmData> {
  const response = await fetch(`${API_URL}/api/data`);
  const result = await readResponse(response) as { data: CrmData | null };
  if (result.data) return result.data;

  await saveData(SEED_DATA);
  return structuredClone(SEED_DATA);
}

export async function saveData(data: CrmData): Promise<void> {
  const response = await fetch(`${API_URL}/api/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await readResponse(response);
}
