import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrProps {
  msg?: string;
}

const FieldErr: React.FC<FieldErrProps> = ({ msg }) => {
  if (!msg) return null;
  return (
    <span className="field-error">
      <AlertCircle size={12} /> {msg}
    </span>
  );
};

export default FieldErr;
