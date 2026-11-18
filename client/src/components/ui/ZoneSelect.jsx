import React from 'react';
import { CAMPUS_ZONES } from '../../utils/constants';

export const ZoneSelect = ({ value, onChange, placeholder = 'Select campus zone', required = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
    >
      <option value="">{placeholder}</option>
      {CAMPUS_ZONES.map((zone) => (
        <option key={zone} value={zone}>
          {zone}
        </option>
      ))}
    </select>
  );
};
