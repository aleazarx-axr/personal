import React from 'react';
import { Hammer, HardHat, AlertTriangle } from 'lucide-react';

export const UnderDevelopment: React.FC = () => {
  return (
    <div className="flex-1 bg-[#F8F9FA] p-6 lg:p-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <HardHat className="w-16 h-16 text-yellow-500 animate-bounce" />
          <Hammer className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Under Development</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We're working hard to bring this feature to life. 
          Please check back later!
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start text-left">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 shrink-0" />
          <div className="text-sm text-yellow-800">
            <span className="font-semibold block mb-1">Coming Soon</span>
            This module is currently restricted to Superusers while we finish construction.
          </div>
        </div>
      </div>
    </div>
  );
};
