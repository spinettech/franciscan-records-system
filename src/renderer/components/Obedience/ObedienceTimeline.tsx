import React, { useState, useEffect } from 'react';
import { Calendar, Briefcase, MapPin, Plus, ArrowLeft, Save, Info, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from '../../utils/toast';
import FieldErr from '../shared/FieldErr';

const ObedienceSchema = z.object({
  communityName: z.string().min(1, 'Community is required'),
  officeHeld: z.string().min(1, 'Office/Role is required'),
  ministryType: z.string().min(1),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(true),
  remarks: z.string().optional(),
});

type ObedienceFormData = z.infer<typeof ObedienceSchema>;

export const ObedienceForm = ({ sisterId, onBack, onSave, editingObedience }: { sisterId: string, onBack: () => void, onSave: () => void, editingObedience?: any }) => {
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    // @ts-ignore
    window.api.getCommunities().then(setCommunities).catch(console.error);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<ObedienceFormData>({
    resolver: zodResolver(ObedienceSchema),
    defaultValues: {
      communityName: editingObedience?.communityName || '',
      officeHeld: editingObedience?.officeHeld || '',
      ministryType: editingObedience?.ministryType || 'Education',
      startDate: editingObedience?.startDate ? new Date(editingObedience.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: editingObedience?.endDate ? new Date(editingObedience.endDate).toISOString().split('T')[0] : '',
      isCurrent: editingObedience ? !editingObedience.endDate : true,
      remarks: editingObedience?.remarks || '',
    },
  });

  const onSubmit = async (data: ObedienceFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      };
      // @ts-ignore
      await window.api.upsertObedience({ ...payload, sisterId, id: editingObedience?.id });
      showToast('success', editingObedience ? 'Obedience Updated' : 'Obedience Recorded', editingObedience ? 'The mission obedience has been updated.' : 'The mission obedience has been added to the timeline.');
      onSave();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Failed to record obedience.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-btn"><ArrowLeft size={20} /></button>
          <div>
            <h1>{editingObedience ? 'Update Obedience' : 'New Obedience'}</h1>
            <p>{editingObedience ? 'Modify existing mission obedience details.' : 'Assign a sister to a new community or office.'}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <div className="form-group">
            <label>Community House</label>
            <select {...register('communityName')}>
              <option value="">Select Community...</option>
              {communities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <FieldErr msg={errors.communityName?.message} />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input {...register('officeHeld')} placeholder="e.g. Co-ordinator, Bursar, Member" />
            <FieldErr msg={errors.officeHeld?.message} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" {...register('startDate')} />
              <FieldErr msg={errors.startDate?.message} />
            </div>
            <div className="form-group">
              <label>End Date (Optional)</label>
              <input type="date" {...register('endDate')} />
            </div>
            <div className="form-group">
              <label>Apostolate</label>
              <input {...register('ministryType')} placeholder="e.g. Education, Healthcare, Social Work" />
            </div>
          </div>

          <div className="form-group">
            <label>Remarks / Notes</label>
            <textarea {...register('remarks')} rows={3} placeholder="Additional details about this posting..." />
          </div>

          <div className="flex gap-4">
            <button type="button" className="btn btn-outline" onClick={onBack}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : editingObedience ? 'Update Obedience' : 'Confirm Obedience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ObedienceTimeline = ({ sisterId, sisterName }: { sisterId: string, sisterName: string }) => {
  const [obediences, setObediences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingObedience, setEditingObedience] = useState<any>(null);

  const fetchObediences = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getObediences(sisterId);
      setObediences(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObediences();
  }, [sisterId]);

  if (showForm) {
    return (
      <ObedienceForm
        sisterId={sisterId}
        editingObedience={editingObedience}
        onBack={() => { setShowForm(false); setEditingObedience(null); }}
        onSave={() => { setShowForm(false); setEditingObedience(null); fetchObediences(); }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h4 className="section-title" style={{ margin: 0 }}>Obedience Record</h4>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingObedience(null); setShowForm(true); }}>
          <Plus size={16} /> New Posting
        </button>
      </div>

      <div className="timeline-container" style={{ position: 'relative', paddingLeft: '2rem' }}>
        <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: 'var(--border)', opacity: 0.5 }} />

        {loading ? (
          <p className="text-muted">Loading history...</p>
        ) : obediences.length > 0 ? (
          obediences.map((as, i) => (
            <div key={as.id} className="timeline-item" style={{ position: 'relative', marginBottom: '2.5rem' }}>
              <div style={{ position: 'absolute', left: '-2rem', top: '0.25rem', width: '16px', height: '16px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'white', border: `3px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`, zIndex: 2 }} />

              <div className="flex justify-between items-start">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{as.communityName}</span>
                    {i === 0 && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>CURRENT</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <Briefcase size={14} /> <span>{as.officeHeld}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      <Calendar size={14} />
                      <span>
                        {new Date(as.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        {' — '}
                        {as.endDate ? new Date(as.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {as.ministryType}
                  </div>
                  {i === 0 && (
                    <button
                      className="btn btn-primary btn-sm ripple"
                      onClick={() => { setEditingObedience(as); setShowForm(true); }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        background: 'var(--accent)',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                      }}
                    >
                      Update Obedience
                    </button>
                  )}
                </div>
              </div>

              {as.remarks && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {as.remarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <p className="text-muted" style={{ margin: 0 }}>No obedience history recorded for this profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObedienceTimeline;
