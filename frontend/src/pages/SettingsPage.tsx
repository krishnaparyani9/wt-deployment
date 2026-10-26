import { useState, type FormEvent } from 'react';
import { Check, Settings as SettingsIcon } from 'lucide-react';
import type { CrmData } from '../types';
import { SectionTitle } from '../components/ui';

export function SettingsPage({ data, onSave }: { data: CrmData; onSave: (next: CrmData) => Promise<void> | void }) {
  const [companyName, setCompanyName] = useState(data.settings.companyName);
  const [currency, setCurrency] = useState(data.settings.currency);
  const [saved, setSaved] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({ ...data, settings: { companyName: companyName.trim(), currency } });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }
  return <><SectionTitle eyebrow="MAKE IT YOURS" title="Settings." description="A few details to make Atlas feel like your own." /><form className="settings-card" onSubmit={(event) => void handleSubmit(event)}><div className="settings-card-heading"><span className="settings-card-icon"><SettingsIcon size={19} /></span><div><h2>Workspace preferences</h2><p>These details help personalize your admin portal.</p></div></div><label className="form-field"><span>Company or workspace name</span><input value={companyName} onChange={(event) => setCompanyName(event.target.value)} maxLength={60} required placeholder="e.g. Acme Distribution" /><span className="field-hint">This name appears in your workspace navigation.</span></label><label className="form-field"><span>Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="INR">Indian Rupee (₹ INR)</option><option value="USD">US Dollar ($ USD)</option><option value="EUR">Euro (€ EUR)</option><option value="GBP">British Pound (£ GBP)</option></select></label><div className="settings-save-row"><span><span className="pulse-dot" /> Saved automatically to your workspace</span><button className="primary-button" type="submit">{saved ? <><Check size={16} />Saved</> : 'Save preferences'}</button></div></form></>;
}
