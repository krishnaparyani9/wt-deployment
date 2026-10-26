export interface CrmDataDocument {
  key: string;
  dealers: unknown[];
  lines: unknown[];
  products: unknown[];
  salesmen: unknown[];
  orders: unknown[];
  settings: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}
