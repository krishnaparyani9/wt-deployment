import type { ReactNode } from 'react';
import { Box, Plus, Search, X } from 'lucide-react';

export function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div><div className="eyebrow"><span className="eyebrow-line" />{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action}
    </div>
  );
}

export function PageAction({ children, onClick, tone = 'blue' }: { children: ReactNode; onClick: () => void; tone?: 'blue' | 'gold' }) {
  return <button className={`primary-button ${tone === 'gold' ? 'primary-gold' : ''}`} onClick={onClick}><Plus size={17} />{children}</button>;
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="search-field"><Search size={16} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button onClick={() => onChange('')} aria-label="Clear search"><X size={14} /></button>}</label>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-state-icon"><Box size={22} /></span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}
