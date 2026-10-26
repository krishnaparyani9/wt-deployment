import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, CircleHelp, Ellipsis, GitBranch, LayoutDashboard, Menu, Package, Settings as SettingsIcon, ShoppingCart, Store, Users, X, type LucideIcon } from 'lucide-react';
import { loadData, saveData, SEED_DATA } from './data';
import { EntityModal } from './components/EntityModal';
import { Dashboard } from './pages/DashboardPage';
import { LinesPage } from './pages/LinesPage';
import { OrdersPage } from './pages/OrdersPage';
import { PeoplePage } from './pages/PeoplePage';
import { ProductsPage } from './pages/ProductsPage';
import { SettingsPage } from './pages/SettingsPage';
import { initials, labelFor, today } from './lib/format';
import type { CrmData, Dealer, Draft, EntityType, Order, Page, Product, Salesman, SupplyLine } from './types';

const navigation: { label: Page; icon: LucideIcon }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Products', icon: Package },
  { label: 'Lines', icon: GitBranch },
  { label: 'Dealer', icon: Store },
  { label: 'Salesman', icon: Users },
  { label: 'Orders', icon: ShoppingCart },
  { label: 'Settings', icon: SettingsIcon },
];

const entityTitles: Record<EntityType, string> = {
  dealers: 'Dealer', lines: 'Line', products: 'Product', salesmen: 'Salesman', orders: 'Order',
};

function updateRecord<T extends { id: string }>(records: T[], entry: T, editingId: string | null): T[] {
  return editingId ? records.map((record) => record.id === editingId ? entry : record) : [entry, ...records];
}

function App() {
  const [data, setData] = useState<CrmData>(() => structuredClone(SEED_DATA));
  const [page, setPage] = useState<Page>('Dashboard');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState<EntityType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function refreshData() {
    setLoading(true);
    setLoadError('');
    try {
      const result = await loadData();
      setData(result);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load CRM data from MongoDB.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(() => ({
    dealers: data.dealers.length,
    lines: data.lines.length,
    products: data.products.length,
    salesmen: data.salesmen.length,
    orders: data.orders.length,
  }), [data]);

  async function persist(next: CrmData) {
    try {
      await saveData(next);
      setData(next);
      setNotice('Your changes have been saved.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save your changes.');
    }
  }

  function openCreate(entity: EntityType) {
    setEditingId(null);
    setModal(entity);
  }

  function openEdit(entity: EntityType, id: string) {
    setEditingId(id);
    setModal(entity);
  }

  function handleSave(entity: EntityType, draft: Draft) {
    const singular: Record<EntityType, string> = { dealers: 'dealer', lines: 'line', products: 'product', salesmen: 'salesman', orders: 'order' };
    const id = editingId || `${singular[entity]}-${crypto.randomUUID()}`;
    let next: CrmData = { ...data };
    if (entity === 'products') {
      const entry: Product = { id, name: String(draft.name), type: String(draft.type), unit: String(draft.unit), rate: Number(draft.rate) };
      next.products = updateRecord(data.products, entry, editingId);
    } else if (entity === 'dealers') {
      const lineIds = (draft.lineIds as string[]) || [];
      const entry: Dealer = {
        id, name: String(draft.name), phone: String(draft.phone || ''), email: String(draft.email || ''),
        location: String(draft.location || ''), lineIds,
      };
      next.dealers = updateRecord(data.dealers, entry, editingId);
      next.lines = data.lines.map((line) => ({
        ...line,
        dealerId: lineIds.includes(line.id) ? id : line.dealerId === id ? '' : line.dealerId,
      }));
      next.dealers = next.dealers.map((dealer) => ({
        ...dealer,
        lineIds: next.lines.filter((line) => line.dealerId === dealer.id).map((line) => line.id),
      }));
    } else if (entity === 'lines') {
      const entry: SupplyLine = {
        id, name: String(draft.name), description: String(draft.description || ''),
        dealerId: String(draft.dealerId || ''),
      };
      next.lines = updateRecord(data.lines, entry, editingId);
      next.dealers = data.dealers.map((dealer) => ({
        ...dealer,
        lineIds: dealer.id === entry.dealerId
          ? [...new Set([...dealer.lineIds, id])]
          : dealer.lineIds.filter((lineId) => lineId !== id),
      }));
    } else if (entity === 'salesmen') {
      const entry: Salesman = {
        id, name: String(draft.name), phone: String(draft.phone || ''), email: String(draft.email || ''),
        dealerIds: (draft.dealerIds as string[]) || [],
      };
      next.salesmen = updateRecord(data.salesmen, entry, editingId);
    } else {
      const product = data.products.find((item) => item.id === String(draft.productId));
      const quantity = Number(draft.quantity);
      const rate = Number(product?.rate || 0);
      const amount = quantity * rate;
      const discount = Number(draft.cashDiscount || 0);
      const entry: Order = {
        id,
        party: String(draft.party),
        lineId: String(draft.lineId || ''),
        dealerId: String(draft.dealerId || ''),
        salesmanId: String(draft.salesmanId || ''),
        date: String(draft.date || today()),
        status: String(draft.status || 'Pending') === 'Completed' ? 'Completed' : 'Pending',
        items: product ? [{ productId: product.id, productName: product.name, quantity, rate, amount }] : [],
        amount,
        cashDiscount: discount,
        finalRate: Math.max(0, amount - discount),
      };
      next.orders = updateRecord(data.orders, entry, editingId);
    }
    void persist(next);
    setModal(null);
    setEditingId(null);
  }

  async function removeRecord(entity: EntityType, id: string) {
    if (!window.confirm(`Delete this ${entityTitles[entity].toLowerCase()}? This action cannot be undone.`)) return;
    const next: CrmData = {
      ...data,
      [entity]: data[entity].filter((record) => record.id !== id),
    };
    if (entity === 'dealers') {
      next.lines = data.lines.map((line) => line.dealerId === id ? { ...line, dealerId: '' } : line);
      next.salesmen = data.salesmen.map((salesman) => ({ ...salesman, dealerIds: salesman.dealerIds.filter((dealerId) => dealerId !== id) }));
    }
    if (entity === 'lines') {
      next.dealers = data.dealers.map((dealer) => ({ ...dealer, lineIds: dealer.lineIds.filter((lineId) => lineId !== id) }));
    }
    void persist(next);
  }

  function exportOrders() {
    const headers = ['Date', 'Party', 'Line', 'Dealer', 'Salesman', 'Amount', 'Discount', 'Final rate', 'Status'];
    const rows = data.orders.map((order) => [
      order.date, order.party, labelFor(data.lines, order.lineId), labelFor(data.dealers, order.dealerId),
      labelFor(data.salesmen, order.salesmanId), order.amount, order.cashDiscount, order.finalRate, order.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'atlas-crm-orders.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage('Dashboard'); }}>
          <span className="brand-mark">A</span><span className="brand-name">{data.settings.companyName || 'Atlas CRM'}</span>
          <span className="brand-tag">ADMIN PORTAL</span>
        </a>
        <div className="topbar-right">
          <button className="avatar-button" aria-label="Account menu">{initials(data.settings.companyName || 'Atlas CRM')}</button>
        </div>
      </header>

      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link ${page === label ? 'active' : ''}`} onClick={() => { setPage(label); setSearch(''); setMobileNavOpen(false); }}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {label === 'Orders' && counts.orders > 0 && <span className="nav-count">{counts.orders}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={16} /></span><strong>Need a hand?</strong><span>Find your way around Atlas.</span><button onClick={() => setNotice('Tip: use Quick actions on the dashboard to add your first records.')}>Explore the guide <ArrowUpRight size={13} /></button></div>
          <div className="sidebar-profile"><span className="profile-avatar">{initials(data.settings.companyName || 'Atlas CRM')}</span><span className="profile-meta"><strong>{data.settings.companyName || 'Atlas CRM'}</strong><span>Administrator</span></span><button className="icon-button profile-more" aria-label="More account options"><Ellipsis size={18} /></button></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <div className="breadcrumb-bar"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{page}</strong></div>
        {loading ? (
          <div className="loading-state"><span className="spinner" /> Preparing your workspace…</div>
        ) : loadError ? (
          <div className="database-error" role="alert">
            <span className="database-error-icon"><CircleHelp size={21} /></span>
            <span className="eyebrow"><span className="eyebrow-line" />DATABASE CONNECTION</span>
            <h1>Couldn’t connect to MongoDB.</h1>
            <p>{loadError}</p>
            <p className="database-error-hint">Check that MongoDB is running and your backend environment settings are correct. CRM data will not be loaded or saved until the database is available.</p>
            <button className="primary-button" onClick={() => void refreshData()}>Try again</button>
          </div>
        ) : (
          <div className="page-content">
            {page === 'Dashboard' && <Dashboard data={data} counts={counts} onNavigate={setPage} onCreate={openCreate} />}
            {page === 'Products' && <ProductsPage products={data.products} search={search} setSearch={setSearch} onCreate={() => openCreate('products')} onEdit={(id) => openEdit('products', id)} onDelete={(id) => void removeRecord('products', id)} />}
            {page === 'Lines' && <LinesPage data={data} search={search} setSearch={setSearch} onCreate={() => openCreate('lines')} onEdit={(id) => openEdit('lines', id)} onDelete={(id) => void removeRecord('lines', id)} />}
            {page === 'Dealer' && <PeoplePage type="dealers" data={data} search={search} setSearch={setSearch} onCreate={() => openCreate('dealers')} onEdit={(id) => openEdit('dealers', id)} onDelete={(id) => void removeRecord('dealers', id)} />}
            {page === 'Salesman' && <PeoplePage type="salesmen" data={data} search={search} setSearch={setSearch} onCreate={() => openCreate('salesmen')} onEdit={(id) => openEdit('salesmen', id)} onDelete={(id) => void removeRecord('salesmen', id)} />}
            {page === 'Orders' && <OrdersPage data={data} search={search} setSearch={setSearch} onCreate={() => openCreate('orders')} onEdit={(id) => openEdit('orders', id)} onDelete={(id) => void removeRecord('orders', id)} onExport={exportOrders} />}
            {page === 'Settings' && <SettingsPage data={data} onSave={persist} />}
          </div>
        )}
      </main>

      {modal && (
        <EntityModal
          key={`${modal}-${editingId || 'new'}`}
          entity={modal}
          data={data}
          initial={editingId ? data[modal].find((record) => record.id === editingId) as unknown as Draft : undefined}
          onClose={() => { setModal(null); setEditingId(null); }}
          onSave={(draft) => handleSave(modal, draft)}
        />
      )}
      {notice && <div className="toast" role="status"><span className="toast-check"><Check size={14} /></span>{notice}<button className="icon-button" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </div>
  );
}

export default App;
