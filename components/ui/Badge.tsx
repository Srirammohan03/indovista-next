
import React from 'react';

type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeType;
  className?: string;
}

const styles: Record<BadgeType, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const Badge: React.FC<BadgeProps> = ({ children, type = 'neutral', className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styles[type]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let type: BadgeType = 'neutral';
  let label = status.replace(/_/g, ' ');
  
  // Quote Statuses
  if (status === 'SENT') {
      type = 'purple';
      label = 'Sent';
  } else if (status === 'ACCEPTED') {
      type = 'success';
      label = 'Accepted';
  } else if (status === 'REJECTED' || status === 'EXPIRED') {
      type = 'error';
      label = status.charAt(0) + status.slice(1).toLowerCase();
  } else if (status === 'DRAFT') {
      type = 'neutral';
      label = 'Draft';
  } 
  // Document Statuses
  else if (status === 'FINAL' || status === 'SUBMITTED') {
      type = 'success';
      label = status.charAt(0) + status.slice(1).toLowerCase(); // Title case
  } else if (status === 'PENDING') {
      type = 'warning';
      label = 'Pending';
  } else if (status === 'NOT_RECEIVED' || status === 'MISSING') {
      type = 'error';
      label = 'Not Received';
  } 
  // Invoice Statuses
  else if (status === 'PAID') {
      type = 'success';
      label = 'Paid';
  } else if (status === 'OVERDUE') {
      type = 'error';
      label = 'Overdue';
  }
  // Shipment Statuses (Fallback)
  else {
      switch (status) {
        case 'DELIVERED':
        case 'APPROVED':
        case 'PAID':
          type = 'success';
          break;
        case 'ON_TIME':
          type = 'success';
          break;
        case 'EXCEPTION':
        case 'BREACHED':
        case 'OVERDUE':
          type = 'error';
          break;
        case 'AT_RISK':
        case 'MISSING_DOCS':
        case 'CUSTOMS_EXPORT':
        case 'CUSTOMS_IMPORT':
          type = 'warning';
          break;
        case 'IN_TRANSIT_ORIGIN':
        case 'AT_PORT_ORIGIN':
        case 'AT_PORT_DEST':
          type = 'info';
          break;
        case 'ON_VESSEL':
          type = 'purple';
          break;
        default:
          type = 'neutral';
      }
  }

  return <Badge type={type}>{label}</Badge>;
};

export const SLABadge: React.FC<{ status: 'ON_TIME' | 'AT_RISK' | 'BREACHED' }> = ({ status }) => {
  let type: BadgeType = 'neutral';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'ON_TIME':
      type = 'success';
      label = 'On Time';
      break;
    case 'AT_RISK':
      type = 'warning';
      label = 'At Risk';
      break;
    case 'BREACHED':
      type = 'error';
      label = 'Breached';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[type].split(' border')[0]}`}>
      {label}
    </span>
  );
};
