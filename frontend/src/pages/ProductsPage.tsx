import { Activity, Box, Package, SlidersHorizontal, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { rupees } from '../lib/format';
import { EmptyState, PageAction, SectionTitle, SearchField } from '../components/ui';

export function ProductsPage({ products, search, setSearch, onCreate, onEdit, onDelete }: {
  products: Product[]; search: string; setSearch: (value: string) => void; onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const filtered = products.filter((item) => `${item.name} ${item.type} ${item.unit}`.toLowerCase().includes(search.toLowerCase()));
  const averageRate = products.length ? products.reduce((sum, item) => sum + item.rate, 0) / products.length : 0;
  const stats = [
    ['Catalog products', products.length.toString(), Package],
    ['Product categories', new Set(products.map((product) => product.type.toLowerCase())).size.toString(), SlidersHorizontal],
    ['Unit types', new Set(products.map((product) => product.unit.toLowerCase())).size.toString(), Box],
    ['Average wholesale rate', rupees(averageRate), Activity],
  ] as const;
  return (
    <>
      <SectionTitle eyebrow="YOUR CATALOG" title="Products." description="The products you sell, all in one place." action={<PageAction tone="gold" onClick={onCreate}>Add product</PageAction>} />
      <div className="products-stats">{stats.map(([label, value, Icon], index) => <div key={label} className={`products-stat ${index === 3 ? 'highlight-stat' : ''}`}><span className="products-stat-icon"><Icon size={16} /></span><span className="stat-label">{label}</span><strong>{value}</strong></div>)}</div>
      <div className="directory-heading"><div><h2>Product catalog</h2><span className="record-count">{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</span></div><SearchField value={search} onChange={setSearch} placeholder="Search your products…" /></div>
      {filtered.length ? <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-card-cover"><span className="product-avatar"><Package size={22} /></span><span className="product-category">{product.type}</span><div className="card-actions"><button onClick={() => onEdit(product.id)} aria-label={`Edit ${product.name}`}>Edit</button><button className="delete-icon" onClick={() => onDelete(product.id)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button></div></div><div className="product-card-body"><h3>{product.name}</h3><span className="product-unit">Sold by <strong>{product.unit}</strong></span></div><div className="product-card-footer"><span>WHOLESALE RATE</span><strong>{rupees(product.rate)} <small>/ {product.unit}</small></strong></div></article>)}</div> : <EmptyState title={search ? 'No products found' : 'Your catalog is ready to grow'} detail={search ? 'Try another name, category or unit.' : 'Add the products you sell to start building your catalog.'} action={!search ? <PageAction tone="gold" onClick={onCreate}>Add your first product</PageAction> : undefined} />}
    </>
  );
}
