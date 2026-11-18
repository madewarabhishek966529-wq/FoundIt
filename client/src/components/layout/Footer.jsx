import React from 'react';
import { Compass, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Found<span className="text-blue-600">It</span>
            </span>
            <span className="text-xs text-slate-400">
              — Campus Lost & Found with AI Matching
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>Security Desk Handover Supported</span>
            <span>•</span>
            <span>Atlas Vector Search + CLIP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
