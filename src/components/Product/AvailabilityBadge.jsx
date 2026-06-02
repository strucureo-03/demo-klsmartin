import React from 'react';

const AvailabilityBadge = ({ status }) => {
  const getLabel = (status) => {
    switch (status) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      case 'ordered':
        return 'On Backorder';
      default:
        return status;
    }
  };

  return (
    <span className={`availability-badge ${status}`}>
      <span className="badge-dot"></span>
      {getLabel(status)}
    </span>
  );
};

export default AvailabilityBadge;
