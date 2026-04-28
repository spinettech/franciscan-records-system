import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { showToast } from '../../utils/toast';
import FieldErr from '../shared/FieldErr';

const corrSchema = z.object({
  subject:   z.string().min(1, 'Subject is required'),
  type:      z.string().min(1),
  direction: z.string().min(1),
  sender:    z.string().min(1, 'Sender is required'),
  recipient: z.string().min(1, 'Recipient is required'),
  date:      z.string().min(1, 'Date is required'),
  status:    z.string().min(1),
  notes:     z.string().optional(),
});

type CorrFormData = z.infer<typeof corrSchema>;

const CorrespondenceForm = ({ onBack, onSave }: { onBack: () => void, onSave: () => void }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CorrFormData>({
    resolver: zodResolver(corrSchema),
    defaultValues: {
      subject: '', type: 'Official Letter', direction: 'Sent',
      sender: 'Secretary General', recipient: '',
      date: new Date().toISOString().split('T')[0], status: 'pending', notes: ''
    },
  });

  const onSubmit = async (data: CorrFormData) => {
    setLoading(true);
    try {
      // @ts-ignore
      await window.api.upsertCorrespondence(undefined, data);
      showToast('success', 'Entry Committed', 'Correspondence has been added to the registry.');
      onSave();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Failed to save the correspondence record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in wiz-wrap">
      <div className="wiz-hdr">
        <button onClick={onBack} className="icon-btn" style={{ background: 'white' }}><ArrowLeft size={20} /></button>
        <div>
          <h2 className="wiz-title">Registry Entry</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Add official communication to the repository.</p>
        </div>
      </div>

      <div className="glass-panel wiz-body">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <div className="form-group col-span-2">
            <label>Subject of Correspondence</label>
            <input {...register('subject')} className={errors.subject ? 'input-error' : ''} placeholder="e.g. Circular on Lenten Observance 2024" />
            <FieldErr msg={errors.subject?.message} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Communication Type</label>
              <select {...register('type')}>
                <option value="Official Letter">Official Letter</option>
                <option value="Circular">General Circular</option>
                <option value="Mission Appointment">Mission Appointment</option>
                <option value="Financial Record">Financial Record</option>
                <option value="Health Documentation">Health Documentation</option>
                <option value="Legal/Property">Legal / Property</option>
              </select>
            </div>
            <div className="form-group">
              <label>Registry Direction</label>
              <select {...register('direction')}>
                <option value="Sent">Outgoing (Sent by Curia)</option>
                <option value="Received">Incoming (Received by Curia)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Originator / Sender</label>
              <input {...register('sender')} className={errors.sender ? 'input-error' : ''} placeholder="e.g. Mother General" />
              <FieldErr msg={errors.sender?.message} />
            </div>
            <div className="form-group">
              <label>Intended Recipient</label>
              <input {...register('recipient')} className={errors.recipient ? 'input-error' : ''} placeholder="e.g. All Communities" />
              <FieldErr msg={errors.recipient?.message} />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Date Registered</label>
              <input type="date" {...register('date')} className={errors.date ? 'input-error' : ''} />
              <FieldErr msg={errors.date?.message} />
            </div>
            <div className="form-group">
              <label>Action Status</label>
              <select {...register('status')}>
                <option value="pending">Pending Review / Filing</option>
                <option value="followed-up">Followed Up / Actioned</option>
              </select>
            </div>
          </div>

          <div className="form-group col-span-2">
            <label>Internal Annotations & Notes</label>
            <textarea rows={4} {...register('notes')} placeholder="Briefly describe the contents or required follow-up actions..." />
          </div>

          <div className="flex gap-4 mt-6">
            <button type="button" className="btn btn-outline" style={{ background: 'white' }} onClick={onBack}>Discard Entry</button>
            <button type="submit" className="btn btn-primary ripple" style={{ flex: 1 }} disabled={loading}>
              <Upload size={18} /> {loading ? 'Encrypting & Saving...' : 'Commit to Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorrespondenceForm;
