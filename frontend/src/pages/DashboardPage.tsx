import { ArrowUpRight, Box, ClipboardList, GitBranch, MapPin, ShoppingBag, Store, UserRound, UserRoundPlus, Users, Sparkles, type LucideIcon } from 'lucide-react';
import type { CrmData, EntityType, Page } from '../types';
import { formatDate, labelFor, rupees } from '../lib/format';
import { SectionTitle } from '../components/ui';

export function Dashboard({ data, counts, onNavigate, onCreate }: {
  data: CrmData; counts: Record<'dealers' | 'lines' | 'products' | 'salesmen' | 'orders', number>;
  onNavigate: (page: Page) => void; onCreate: (entity: EntityType) => void;
}) {
  const openOrders = data.orders.filter((order) => order.status === 'Pending');
  const totalValue = data.orders.reduce((sum, order) => sum + order.finalRate, 0);
  const metrics: { title: string; count: number; note: string; icon: LucideIcon; tone: string; page: Page }[] = [
    { title: 'Dealers', count: counts.dealers, note: 'Your local partners', icon: Store, tone: 'blue', page: 'Dealer' },
    { title: 'Supply lines', count: counts.lines, note: `${data.lines.filter((line) => line.dealerId).length} with a dealer`, icon: GitBranch, tone: 'gold', page: 'Lines' },
    { title: 'Products', count: counts.products, note: 'In your catalog', icon: Box, tone: 'violet', page: 'Products' },
    { title: 'Sales team', count: counts.salesmen, note: 'Sales representatives', icon: UserRound, tone: 'coral', page: 'Salesman' },
    { title: 'Orders', count: counts.orders, note: `${openOrders.length} pending`, icon: ShoppingBag, tone: 'green', page: 'Orders' },
  ];
  return (
    <>
      <SectionTitle eyebrow={new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()} title="Good to see you." description="Here’s what’s happening across your sales network." action={<div className="today-pill"><span className="pulse-dot" /> Your workspace is looking good</div>} />
      <div className="metric-grid">
        {metrics.map(({ title, count, note, icon: Icon, tone, page }) => (
          <button className={`metric-card metric-${tone}`} key={title} onClick={() => onNavigate(page)}>
            <span className="metric-top"><span className="metric-icon"><Icon size={17} /></span><ArrowUpRight size={16} className="metric-arrow" /></span>
            <span className="metric-title">{title}</span><span className="metric-number">{count}</span>
            <span className="metric-note">{note}</span>
          </button>
        ))}
      </div>
      <div className="overview-strip">
        <div><span className="overview-label">Open orders</span><strong>{openOrders.length}</strong></div>
        <span className="overview-divider" />
        <div><span className="overview-label">Recorded order value</span><strong>{rupees(totalValue)}</strong></div>
        <button className="text-action overview-link" onClick={() => onNavigate('Orders')}>Open order register <ArrowUpRight size={15} /></button>
      </div>
      <div className="dashboard-panels">
        <section className="dashboard-panel activity-panel">
          <div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />LATEST ACTIVITY</div><h2>Recent orders</h2></div><button className="text-action" onClick={() => onNavigate('Orders')}>View all <ArrowUpRight size={14} /></button></div>
          {data.orders.length === 0 ? (
            <div className="empty-activity"><span className="empty-icon"><ClipboardList size={18} /></span><div><strong>A fresh start.</strong><span>Your order activity will show up here.</span></div></div>
          ) : data.orders.slice(0, 4).map((order) => (
            <div className="activity-row" key={order.id}><span className="activity-icon"><ShoppingBag size={16} /></span><span className="activity-info"><strong>{order.party}</strong><span>{labelFor(data.lines, order.lineId)} · {formatDate(order.date)}</span></span><span className="activity-value">{rupees(order.finalRate)}</span></div>
          ))}
        </section>
        <section className="dashboard-panel coverage-panel">
          <div className="panel-heading"><div><div className="eyebrow"><span className="eyebrow-line" />SUPPLY NETWORK</div><h2>Line coverage</h2></div><button className="text-action" onClick={() => onNavigate('Lines')}>Manage <ArrowUpRight size={14} /></button></div>
          <div className="coverage-summary"><strong>{data.lines.filter((line) => line.dealerId).length}</strong><span> / {data.lines.length} lines assigned to a dealer</span></div>
          <div className="coverage-track"><span style={{ width: `${data.lines.length ? data.lines.filter((line) => line.dealerId).length / data.lines.length * 100 : 0}%` }} /></div>
          <div className="coverage-list">
            {data.lines.slice(0, 4).map((line) => <div className="coverage-item" key={line.id}><span className="coverage-pin"><MapPin size={15} /></span><span><strong>{line.name}</strong><span>{labelFor(data.dealers, line.dealerId)}{!line.dealerId && 'Unassigned'}</span></span><span className={`coverage-status ${line.dealerId ? 'assigned' : ''}`} /></div>)}
            {data.lines.length === 0 && <div className="empty-inline">Add a supply line to start building your distribution network.</div>}
          </div>
        </section>
      </div>
      <section className="quick-actions">
        <div className="quick-intro"><div className="eyebrow"><span className="eyebrow-line" />YOUR WORKSPACE</div><h2>Make your next move.</h2><p>A few shortcuts to keep things moving.</p></div>
        <div className="quick-links">
          {([
            ['dealers', 'Add a dealer', Users],
            ['lines', 'Add a supply line', GitBranch],
            ['products', 'Add a product', Box],
            ['salesmen', 'Add a salesperson', UserRoundPlus],
          ] as const).map(([entity, label, Icon]) => <button key={entity} className="quick-link" onClick={() => onCreate(entity)}><span><Icon size={16} /></span>{label}<ArrowUpRight size={14} className="quick-arrow" /></button>)}
        </div>
      </section>
      <p className="dashboard-footnote"><Sparkles size={13} /> A good day to grow something.</p>
    </>
  );
}
