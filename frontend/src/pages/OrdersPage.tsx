import { useState } from 'react';
import { Download, Search, ShoppingBag, SlidersHorizontal, Trash2 } from 'lucide-react';
import type { CrmData } from '../types';
import { formatDate, labelFor, rupees } from '../lib/format';
import { EmptyState, PageAction, SectionTitle } from '../components/ui';

export function OrdersPage({ data, search, setSearch, onCreate, onEdit, onDelete, onExport }: {
  data: CrmData; search: string; setSearch: (value: string) => void; onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void; onExport: () => void;
}) {
  const [dateFilter, setDateFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [dealerFilter, setDealerFilter] = useState('');
  const filtered = data.orders.filter((order) =>
    (!dateFilter || order.date === dateFilter)
    && (!lineFilter || order.lineId === lineFilter)
    && (!dealerFilter || order.dealerId === dealerFilter)
    && `${order.party} ${labelFor(data.lines, order.lineId)} ${labelFor(data.dealers, order.dealerId)} ${labelFor(data.salesmen, order.salesmanId)}`.toLowerCase().includes(search.toLowerCase()),
  );
  const resetFilters = () => { setDateFilter(''); setLineFilter(''); setDealerFilter(''); setSearch(''); };
  const totals = filtered.reduce((acc, order) => ({ amount: acc.amount + order.amount, discount: acc.discount + order.cashDiscount, final: acc.final + order.finalRate }), { amount: 0, discount: 0, final: 0 });
  const completed = filtered.filter((order) => order.status === 'Completed').length;
  return (
    <>
      <SectionTitle eyebrow="SALES & FULFILMENT" title="Order register." description="Every order, discount and delivery — in one view." action={<PageAction onClick={onCreate}>Create an order</PageAction>} />
      <div className="orders-toolbar"><div className="orders-filter-label"><SlidersHorizontal size={16} /><span>Filter your register</span></div><div className="filter-controls">
        <label className="filter-item"><span>Order date</span><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
        <label className="filter-item"><span>Supply line</span><select value={lineFilter} onChange={(event) => setLineFilter(event.target.value)}><option value="">All supply lines</option>{data.lines.map((line) => <option value={line.id} key={line.id}>{line.name}</option>)}</select></label>
        <label className="filter-item party-filter"><span>Search orders</span><div className="embedded-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Party, dealer, or rep…" /></div></label>
        <label className="filter-item"><span>Dealer</span><select value={dealerFilter} onChange={(event) => setDealerFilter(event.target.value)}><option value="">All dealers</option>{data.dealers.map((dealer) => <option value={dealer.id} key={dealer.id}>{dealer.name}</option>)}</select></label>
        <button className="clear-button" onClick={resetFilters}>Clear filters</button>
      </div></div>
      <div className="order-summary-grid">{[
        ['Total amount', rupees(totals.amount), 'blue'],
        ['Cash discounts', rupees(totals.discount), 'gold'],
        ['Final order value', rupees(totals.final), 'violet'],
        ['Orders in view', filtered.length.toString(), 'green'],
      ].map(([label, value, tone]) => <div key={label} className={`order-summary-card summary-${tone}`}><span>{label}</span><strong>{value}</strong><span className="summary-caption">Based on your current filters</span></div>)}</div>
      <div className="orders-secondary-stats"><div><span>COMPLETED</span><strong>{completed}</strong><span className="summary-caption">Orders fulfilled</span></div><div><span>AWAITING FULFILMENT</span><strong>{filtered.length - completed}</strong><span className="summary-caption">Pending orders</span></div><div><span>SHOWING</span><strong>{filtered.length}</strong><span className="summary-caption">of {data.orders.length} total orders</span></div></div>
      <div className="directory-heading order-directory-heading"><div><h2>All orders</h2><span className="record-count">{filtered.length} {filtered.length === 1 ? 'order' : 'orders'}</span></div><button className="export-button" onClick={onExport}><Download size={15} />Export CSV</button></div>
      {filtered.length ? <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>ORDER & PARTY</th><th>DATE</th><th>SUPPLY LINE</th><th>DEALER</th><th>FINAL AMOUNT</th><th>STATUS</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td><button className="table-party" onClick={() => onEdit(order.id)}><span className="table-order-icon"><ShoppingBag size={15} /></span><span><strong>{order.party}</strong><span>{order.items[0]?.productName || 'Order'}</span></span></button></td><td>{formatDate(order.date)}</td><td>{labelFor(data.lines, order.lineId)}</td><td>{labelFor(data.dealers, order.dealerId)}</td><td className="amount-cell">{rupees(order.finalRate)}</td><td><span className={`status-pill ${order.status.toLowerCase()}`}><span />{order.status}</span></td><td><button className="delete-icon" onClick={() => onDelete(order.id)} aria-label={`Delete order for ${order.party}`}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div> : <EmptyState title={data.orders.length && (dateFilter || lineFilter || dealerFilter || search) ? 'No orders match these filters' : 'Your order book starts here'} detail={data.orders.length && (dateFilter || lineFilter || dealerFilter || search) ? 'Try clearing a filter to see more orders.' : 'Create your first order to keep track of sales, discounts and fulfilment.'} action={data.orders.length && (dateFilter || lineFilter || dealerFilter || search) ? <button className="secondary-button" onClick={resetFilters}>Clear all filters</button> : <PageAction onClick={onCreate}>Create your first order</PageAction>} />}
    </>
  );
}
