import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfileFieldProps {
  label: string;
  value?: string | null;
  icon: LucideIcon;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, icon: Icon }) => (
  <div className="profile-field" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
    <div className="field-icon" style={{ color: 'var(--accent)', background: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
      <Icon size={18} />
    </div>
    <div className="field-content">
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)', fontSize: '1rem' }}>{value || 'N/A'}</p>
    </div>
  </div>
);

export default ProfileField;
