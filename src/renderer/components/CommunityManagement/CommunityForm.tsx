import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Book, Activity, Heart, Cross, Globe, Briefcase, GraduationCap, Coffee, Check } from 'lucide-react';
import { showToast } from '../../utils/toast';
import FieldErr from '../shared/FieldErr';

const communitySchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  location: z.string().min(1, 'Location is required'),
  diocese: z.string().min(1, 'Diocese is required'),
  superiorName: z.string().optional(),
  capacity: z.coerce.number().int().min(1, 'Must be at least 1'),
  contactPhone: z.string().optional(),
  apostolateType: z.array(z.string()).min(1, 'Select at least one apostolate'),
  isActive: z.boolean(),
});

type CommunityFormData = z.infer<typeof communitySchema>;

const APOSTOLATES = [
  { id: 'Education', icon: Book, color: '#3b82f6' },
  { id: 'Healthcare', icon: Activity, color: '#ef4444' },
  { id: 'Social Services', icon: Heart, color: '#ec4899' },
  { id: 'Pastoral', icon: Cross, color: '#8b5cf6' },
  { id: 'Missions', icon: Globe, color: '#10b981' },
  { id: 'Administration', icon: Briefcase, color: '#64748b' },
  { id: 'Formation', icon: GraduationCap, color: '#f59e0b' },
  { id: 'Hospitality', icon: Coffee, color: '#f43f5e' }
];

const CommunityForm = ({ community, onBack, onSave }: any) => {
  const [loading, setLoading] = useState(false);
  const [sisters, setSisters] = useState<any[]>([]);
  const [dynamicApostolates, setDynamicApostolates] = useState<any[]>([]);

  useEffect(() => {
    // @ts-ignore
    window.api.getSisters().then(setSisters).catch(console.error);
    // @ts-ignore
    window.api.getApostolates().then(data => {
      if (data && data.length > 0) {
        setDynamicApostolates(data.map((ap: any) => ({
          id: ap.name,
          icon: Briefcase,
          color: '#64748b'
        })));
      } else {
        setDynamicApostolates(APOSTOLATES);
      }
    }).catch(console.error);
  }, []);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: community?.name || '',
      location: community?.location || '',
      diocese: community?.diocese || '',
      superiorName: community?.superiorName || '',
      capacity: community?.capacity || 10,
      contactPhone: community?.contactPhone || '',
      apostolateType: community?.apostolateType ? community.apostolateType.split(', ') : ['Missions'],
      isActive: community?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CommunityFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        apostolateType: data.apostolateType.join(', ')
      };
      // @ts-ignore
      await window.api.upsertCommunity(community?.id, payload);
      showToast('success', community ? 'Community Updated' : 'Community Registered', `${data.name} has been saved to the registry.`);
      onSave();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not save the community record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-btn"><ArrowLeft size={20} /></button>
          <div>
            <h1>{community ? 'Edit Community' : 'Register House'}</h1>
            <p>{community ? `Modifying records for ${community.name}` : 'Establish a new community or missionary station record.'}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <div className="form-group">
            <label>Community / Convent Name</label>
            <input {...register('name')} className={errors.name ? 'input-error' : ''} placeholder="e.g. St. Claire Curia House" />
            <FieldErr msg={errors.name?.message} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Location / Town</label>
              <input {...register('location')} className={errors.location ? 'input-error' : ''} />
              <FieldErr msg={errors.location?.message} />
            </div>
            <div className="form-group">
              <label>Diocese</label>
              <input {...register('diocese')} className={errors.diocese ? 'input-error' : ''} />
              <FieldErr msg={errors.diocese?.message} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" {...register('capacity')} className={errors.capacity ? 'input-error' : ''} />
              <FieldErr msg={errors.capacity?.message} />
            </div>
            <div className="form-group">
              <label>Co-ordinator</label>
              <select {...register('superiorName')}>
                <option value="">Select Sister...</option>
                {sisters.map(s => (
                  <option key={s.id} value={s.religiousName || s.fullName}>
                    {s.religiousName || s.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input {...register('contactPhone')} placeholder="e.g. +234 ..." />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800 }}>Apostolates / Mission Types</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select all that apply</span>
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '1rem'
            }}>
              {dynamicApostolates.map(ap => {
                const Icon = ap.icon;
                const isSelected = watch('apostolateType')?.includes(ap.id);
                return (
                  <label key={ap.id} style={{ 
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input 
                      type="checkbox" 
                      value={ap.id} 
                      {...register('apostolateType')} 
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? ap.color : 'var(--border)'}`,
                      background: isSelected ? `${ap.color}10` : 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${ap.color}20` : 'none'
                    }}>
                      <div style={{ 
                        color: isSelected ? ap.color : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={18} />
                      </div>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 700, 
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)' 
                      }}>{ap.id}</span>
                      {isSelected && (
                        <div style={{ marginLeft: 'auto', color: ap.color }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            <FieldErr msg={errors.apostolateType?.message as string} />
          </div>

          <div className="form-group">
            <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} style={{ width: 'auto' }} />
              <span>Is this community currently active?</span>
            </label>
          </div>

          <div className="flex gap-4" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ background: 'white' }} onClick={onBack}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : <><Save size={18} /> {community ? 'Update Records' : 'Register Community'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityForm;
