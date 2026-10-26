import { ArrowUpRight, Store, Trash2, UserRound } from 'lucide-react';
import type { CrmData } from '../types';
import { initials } from '../lib/format';
import { EmptyState, PageAction, SectionTitle, SearchField } from '../components/ui';

export function PeoplePage({ type, data, search, setSearch, onCreate, onEdit, onDelete }: {
  type: 'dealers' | 'salesmen'; data: CrmData; search: string; setSearch: (value: string) => void; onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const isDealer = type === 'dealers';
  const title = isDealer ? 'Dealers.' : 'Your sales team.';
  const collection = isDealer ? data.dealers : data.salesmen;
  const filtered = collection.filter((person) => `${person.name} ${person.phone} ${person.email}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <SectionTitle eyebrow={isDealer ? 'YOUR LOCAL PARTNERS' : 'PEOPLE WHO MAKE IT HAPPEN'} title={title} description={isDealer ? 'The partners at the heart of your distribution network.' : 'Your salespeople and the relationships they manage.'} action={<PageAction tone="gold" onClick={onCreate}>Add {isDealer ? 'dealer' : 'salesperson'}</PageAction>} />
      <div className="people-intro"><div className="people-total"><span className={`stat-icon ${isDealer ? 'icon-gold' : 'icon-blue'}`}>{isDealer ? <Store size={17} /> : <UserRound size={17} />}</span><span><strong>{collection.length}</strong><span>{isDealer ? 'local partners' : 'team members'}</span></span></div><div className="people-search"><SearchField value={search} onChange={setSearch} placeholder={`Search ${isDealer ? 'dealers' : 'salespeople'}…`} /></div></div>
      {filtered.length ? <div className="people-grid">{filtered.map((person) => {
        const related = isDealer
          ? data.lines.filter((line) => line.dealerId === person.id).map((line) => line.name)
          : data.dealers.filter((dealer) => data.salesmen.find((salesman) => salesman.id === person.id)?.dealerIds.includes(dealer.id)).map((dealer) => dealer.name);
        return <article className="person-card" key={person.id}><div className="person-card-top"><span className={`person-avatar ${isDealer ? 'dealer-avatar' : ''}`}>{initials(person.name)}</span><span className="person-main"><strong>{person.name}</strong><span>{person.phone || 'No phone provided'}</span></span><div className="card-actions"><button onClick={() => onEdit(person.id)} aria-label={`Edit ${person.name}`}>Edit</button><button className="delete-icon" onClick={() => onDelete(person.id)} aria-label={`Delete ${person.name}`}><Trash2 size={15} /></button></div></div><div className="person-card-related"><span className="related-label">{isDealer ? 'COVERED SUPPLY LINES' : 'ASSIGNED DEALERS'}</span><div className="chips">{related.length ? related.map((name) => <span className="chip" key={name}><span className="chip-dot" />{name}</span>) : <span className="muted">No {isDealer ? 'lines' : 'dealers'} assigned yet</span>}</div></div>{person.email && <div className="person-contact">{person.email}</div>}{isDealer && <button className="person-details" onClick={() => onEdit(person.id)}>View and edit profile <ArrowUpRight size={14} /></button>}</article>;
      })}</div> : <EmptyState title={search ? 'No matches found' : `No ${isDealer ? 'dealers' : 'salespeople'} yet`} detail={search ? 'Try another name or phone number.' : `Add your first ${isDealer ? 'dealer' : 'salesperson'} to start growing your network.`} action={!search ? <PageAction tone="gold" onClick={onCreate}>Add {isDealer ? 'a dealer' : 'a salesperson'}</PageAction> : undefined} />}
    </>
  );
}
