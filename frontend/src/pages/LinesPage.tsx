import { MapPin, Trash2, Users } from 'lucide-react';
import type { CrmData } from '../types';
import { labelFor } from '../lib/format';
import { EmptyState, PageAction, SectionTitle, SearchField } from '../components/ui';

export function LinesPage({ data, search, setSearch, onCreate, onEdit, onDelete }: {
  data: CrmData; search: string; setSearch: (value: string) => void; onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const filtered = data.lines.filter((line) => `${line.name} ${line.description} ${labelFor(data.dealers, line.dealerId)}`.toLowerCase().includes(search.toLowerCase()));
  const assigned = data.lines.filter((line) => line.dealerId).length;
  return (
    <>
      <SectionTitle eyebrow="DISTRIBUTION NETWORK" title="Supply lines." description="Routes and regions supplied by your dealers." action={<PageAction onClick={onCreate}>Add supply line</PageAction>} />
      <div className="inline-stats"><div className="inline-stat"><span className="stat-icon icon-blue"><MapPin size={17} /></span><span><strong>{data.lines.length}</strong><span>Total lines</span></span></div><span className="inline-stat-divider" /><div className="inline-stat"><span className="stat-icon icon-gold"><Users size={17} /></span><span><strong>{assigned}</strong><span>Assigned to a dealer</span></span></div></div>
      <div className="directory-heading"><div><h2>Route directory</h2><span className="record-count">{filtered.length} records</span></div><SearchField value={search} onChange={setSearch} placeholder="Search lines or dealers…" /></div>
      <div className="line-directory">{filtered.map((line) => <article className="line-row" key={line.id}><span className="line-pin"><MapPin size={18} /></span><span className="line-name"><strong>{line.name}</strong><span>{line.description || 'Supply route'}</span></span><span className="line-dealer"><span>RESPONSIBLE DEALER</span><strong>{labelFor(data.dealers, line.dealerId)}</strong><span className="muted">{data.dealers.find((dealer) => dealer.id === line.dealerId)?.phone || (line.dealerId ? '' : 'Not assigned')}</span></span><span className="line-row-actions"><button onClick={() => onEdit(line.id)} aria-label={`Edit ${line.name}`}>Edit</button><button className="delete-icon" onClick={() => onDelete(line.id)} aria-label={`Delete ${line.name}`}><Trash2 size={15} /></button></span></article>)}
        {filtered.length === 0 && <EmptyState title={search ? 'No routes match that search' : 'No supply lines yet'} detail={search ? 'Try another line name or dealer.' : 'Create your first supply line to connect dealers to their regions.'} action={!search ? <PageAction onClick={onCreate}>Add a supply line</PageAction> : undefined} />}
      </div>
    </>
  );
}
