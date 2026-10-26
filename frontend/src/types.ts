export interface Dealer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  lineIds: string[];
}

export interface SupplyLine {
  id: string;
  name: string;
  description: string;
  dealerId: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  unit: string;
  rate: number;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  email: string;
  dealerIds: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Order {
  id: string;
  party: string;
  lineId: string;
  dealerId: string;
  salesmanId: string;
  date: string;
  status: 'Pending' | 'Completed';
  items: OrderItem[];
  amount: number;
  cashDiscount: number;
  finalRate: number;
}

export interface CrmData {
  dealers: Dealer[];
  lines: SupplyLine[];
  products: Product[];
  salesmen: Salesman[];
  orders: Order[];
  settings: { companyName: string; currency: string };
}

export type EntityType = 'dealers' | 'lines' | 'products' | 'salesmen' | 'orders';

export type Page = 'Dashboard' | 'Products' | 'Lines' | 'Dealer' | 'Salesman' | 'Orders' | 'Settings';
export type Draft = Record<string, string | number | string[]>;
