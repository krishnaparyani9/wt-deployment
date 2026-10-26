import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, Plus, ShoppingBag, X } from 'lucide-react';
import type { CrmData, Draft, EntityType } from '../types';
import { rupees, today } from '../lib/format';

const entityTitles: Record<EntityType, string> = {
  dealers: 'Dealer', lines: 'Line', products: 'Product', salesmen: 'Salesman', orders: 'Order',
};

export function EntityModal({ entity, data, initial, onClose, onSave }: {
  entity: EntityType; data: CrmData; initial?: Draft; onClose: () => void; onSave: (draft: Draft) => void;
}) {
  const title = entityTitles[entity];
  const editing = Boolean(initial);
  const [draft, setDraft] = useState<Draft>(() => initial || initialDraft(entity, data));
  const [error, setError] = useState('');
  function setField(key: string, value: string | number | string[]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(draft.quantity || 0) * Number(data.products.find((product) => product.id === draft.productId)?.rate || 0);
    if (entity === 'orders' && Number(draft.cashDiscount || 0) > amount) {
      setError('Discount cannot be greater than the order amount.');
      return;
    }
    setError('');
    onSave(draft);
  }

  return (
    <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header"><span className="modal-icon">{entity === 'orders' ? <ShoppingBag size={18} /> : <Plus size={18} />}</span><div><span className="modal-eyebrow">{editing ? 'UPDATE YOUR RECORD' : 'GROW YOUR WORKSPACE'}</span><h2 id="modal-title">{editing ? 'Edit' : 'Add a'} {title.toLowerCase()}</h2></div><button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {entity === 'products' && <>
              <Field label="Product name" required><input autoFocus value={String(draft.name || '')} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Premium Assam Tea" required maxLength={80} /></Field>
              <div className="form-grid-two"><Field label="Category" required><input value={String(draft.type || '')} onChange={(event) => setField('type', event.target.value)} placeholder="e.g. Tea" required maxLength={40} /></Field><Field label="Unit of measure" required><select value={String(draft.unit || '')} onChange={(event) => setField('unit', event.target.value)} required><option value="" disabled>Select unit</option>{['Kg', 'Gram', 'Litre', 'Piece', 'Box', 'Bag', 'Dozen', 'Ton'].map((unit) => <option key={unit}>{unit}</option>)}</select></Field></div>
              <Field label="Wholesale rate (₹)" required><input type="number" min="0" step="0.01" value={String(draft.rate ?? '')} onChange={(event) => setField('rate', event.target.value)} placeholder="0.00" required /></Field>
            </>}
            {entity === 'dealers' && <>
              <Field label="Dealer or business name" required><input autoFocus value={String(draft.name || '')} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Sharma & Sons" required maxLength={80} /></Field>
              <div className="form-grid-two"><Field label="Phone number"><input type="tel" value={String(draft.phone || '')} onChange={(event) => setField('phone', event.target.value)} placeholder="+91 98765 43210" maxLength={20} /></Field><Field label="Email address"><input type="email" value={String(draft.email || '')} onChange={(event) => setField('email', event.target.value)} placeholder="dealer@company.com" maxLength={100} /></Field></div>
              <Field label="City or location"><input value={String(draft.location || '')} onChange={(event) => setField('location', event.target.value)} placeholder="e.g. Jaipur, Rajasthan" maxLength={80} /></Field>
              <Field label="Assigned supply lines"><select multiple value={(draft.lineIds as string[]) || []} onChange={(event) => setField('lineIds', Array.from(event.target.selectedOptions, (option) => option.value))}>{data.lines.map((line) => <option value={line.id} key={line.id}>{line.name}</option>)}</select><span className="field-hint">Hold Ctrl (Windows) or Command (Mac) to choose multiple lines.</span></Field>
            </>}
            {entity === 'lines' && <>
              <Field label="Supply line name" required><input autoFocus value={String(draft.name || '')} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Jaipur North" required maxLength={80} /></Field>
              <Field label="Description"><input value={String(draft.description || '')} onChange={(event) => setField('description', event.target.value)} placeholder="e.g. Wholesale delivery route" maxLength={120} /></Field>
              <Field label="Responsible dealer"><select value={String(draft.dealerId || '')} onChange={(event) => setField('dealerId', event.target.value)}><option value="">Not assigned yet</option>{data.dealers.map((dealer) => <option value={dealer.id} key={dealer.id}>{dealer.name}</option>)}</select></Field>
            </>}
            {entity === 'salesmen' && <>
              <Field label="Salesperson name" required><input autoFocus value={String(draft.name || '')} onChange={(event) => setField('name', event.target.value)} placeholder="e.g. Ananya Sharma" required maxLength={80} /></Field>
              <div className="form-grid-two"><Field label="Phone number"><input type="tel" value={String(draft.phone || '')} onChange={(event) => setField('phone', event.target.value)} placeholder="+91 98765 43210" maxLength={20} /></Field><Field label="Email address"><input type="email" value={String(draft.email || '')} onChange={(event) => setField('email', event.target.value)} placeholder="sales@company.com" maxLength={100} /></Field></div>
              <Field label="Assigned dealers"><select multiple value={(draft.dealerIds as string[]) || []} onChange={(event) => setField('dealerIds', Array.from(event.target.selectedOptions, (option) => option.value))}>{data.dealers.map((dealer) => <option value={dealer.id} key={dealer.id}>{dealer.name}</option>)}</select><span className="field-hint">Hold Ctrl (Windows) or Command (Mac) to choose multiple dealers.</span></Field>
            </>}
            {entity === 'orders' && <>
              <Field label="Party or customer name" required><input autoFocus value={String(draft.party || '')} onChange={(event) => setField('party', event.target.value)} placeholder="e.g. Mehta General Store" required maxLength={80} /></Field>
              <div className="form-grid-two"><Field label="Order date" required><input type="date" value={String(draft.date || today())} onChange={(event) => setField('date', event.target.value)} required /></Field><Field label="Order status"><select value={String(draft.status || 'Pending')} onChange={(event) => setField('status', event.target.value)}><option>Pending</option><option>Completed</option></select></Field></div>
              <div className="form-grid-two"><Field label="Supply line"><select value={String(draft.lineId || '')} onChange={(event) => setField('lineId', event.target.value)}><option value="">Select a line</option>{data.lines.map((line) => <option value={line.id} key={line.id}>{line.name}</option>)}</select></Field><Field label="Dealer"><select value={String(draft.dealerId || '')} onChange={(event) => setField('dealerId', event.target.value)}><option value="">Select a dealer</option>{data.dealers.map((dealer) => <option value={dealer.id} key={dealer.id}>{dealer.name}</option>)}</select></Field></div>
              <Field label="Salesperson"><select value={String(draft.salesmanId || '')} onChange={(event) => setField('salesmanId', event.target.value)}><option value="">Unassigned</option>{data.salesmen.map((salesman) => <option value={salesman.id} key={salesman.id}>{salesman.name}</option>)}</select></Field>
              <div className="form-grid-two"><Field label="Product" required><select value={String(draft.productId || '')} onChange={(event) => setField('productId', event.target.value)} required><option value="" disabled>Select a product</option>{data.products.map((product) => <option value={product.id} key={product.id}>{product.name} · {rupees(product.rate)}/{product.unit}</option>)}</select></Field><Field label="Quantity" required><input type="number" min="0.01" step="0.01" value={String(draft.quantity || '')} onChange={(event) => setField('quantity', event.target.value)} placeholder="1" required /></Field></div>
              <Field label="Cash discount (₹)"><input type="number" min="0" step="0.01" value={String(draft.cashDiscount || 0)} onChange={(event) => setField('cashDiscount', event.target.value)} placeholder="0.00" /></Field>
              {data.products.length === 0 && <p className="form-warning">Add a product to your catalog before recording an order.</p>}
              <p className="form-hint-box">Your order total and final price are calculated automatically from the product rate, quantity and discount.</p>
            </>}
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>
          <div className="modal-footer"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Check size={16} />{editing ? 'Save changes' : `Add ${title.toLowerCase()}`}</button></div>
        </form>
      </section>
    </div>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="form-field"><span>{label}{required && <span className="required-mark"> *</span>}</span>{children}</label>;
}

function initialDraft(entity: EntityType, data: CrmData): Draft {
  if (entity === 'products') return { name: '', type: '', unit: '', rate: '' };
  if (entity === 'dealers') return { name: '', phone: '', email: '', location: '', lineIds: [] };
  if (entity === 'lines') return { name: '', description: '', dealerId: '' };
  if (entity === 'salesmen') return { name: '', phone: '', email: '', dealerIds: [] };
  return { party: '', date: today(), lineId: '', dealerId: '', salesmanId: '', status: 'Pending', productId: data.products[0]?.id || '', quantity: '', cashDiscount: 0 };
}
