import React from 'react';

interface FGProps {
  label: string;
  full?: boolean;
  required?: boolean;
  confidential?: boolean;
  children: React.ReactNode;
}

const FG: React.FC<FGProps> = ({ label, full = false, required = false, confidential = false, children }) => (
  <div className={`form-group${full ? ' col-span-2' : ''}`}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {label}
      {required && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>*</span>}
      {confidential && (
        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em' }}>CONFIDENTIAL</span>
      )}
    </label>
    {children}
  </div>
);

export default FG;
