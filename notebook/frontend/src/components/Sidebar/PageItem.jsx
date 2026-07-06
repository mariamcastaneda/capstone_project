import React, { useState } from 'react';

export default function PageItem({ page, isActive, onSelect }) {
  return (
    <div className={`nb-page-item ${isActive ? 'active' : ''}`} onClick={onSelect}>
      📄 {page.name}
    </div>
  );
}
