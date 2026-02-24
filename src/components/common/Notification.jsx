import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
};

export default function Notification({ type, message }) {
  if (!type || !message) return null;
  const Icon = icons[type] || Info;

  return (
    <div className={`notification ${type}`}>
      <Icon size={16} />
      {message}
    </div>
  );
}
