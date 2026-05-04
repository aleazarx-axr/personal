// src/pages/Dashboard.tsx
import React from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Megaphone, Calendar, FileText, Link as LinkIcon, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Get the logged-in user from localStorage
  const userString = localStorage.getItem('portalUser');
  const loggedInUser = userString ? JSON.parse(userString) : { firstName: 'User', role: 'Student' };

  return (
    <PortalLayout pageTitle="Overview">
      
      {/* Welcome Banner */}
      <div className="bg-[#9B1C1C] text-white p-6 md:p-8 mb-6 shadow-sm border border-[#7a1515]">
        <h2 className="text-2xl font-black tracking-widest mb-1">
          Welcome to MyWMSU, {loggedInUser.firstName + ' ' + loggedInUser.lastName}!
        </h2>
        <p className="text-red-100 text-sm font-medium tracking-wider">
          Access your documents, schedules, and university announcements here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Announcements Widget */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center">
              <Megaphone className="w-4 h-4 text-[#9B1C1C] mr-2" />
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">University Announcements</h3>
            </div>
            <div className="p-0">
              {/* Placeholder Announcement 1 */}
              <div className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">May 01, 2026</div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">Enrollment for First Semester Now Open</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Please be advised that the regular enrollment period for the upcoming semester has officially begun. Ensure all your clearance requirements are met before proceeding to the registrar.
                </p>
                <button className="text-[#9B1C1C] text-sm font-bold uppercase tracking-wider hover:underline flex items-center">
                  Read More <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              {/* Placeholder Announcement 2 */}
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">April 28, 2026</div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">Campus Maintenance Schedule</h4>
                <p className="text-gray-600 text-sm mb-3">
                  The main library will be closed this coming weekend for scheduled electrical maintenance. Online catalog services will remain uninterrupted.
                </p>
                <button className="text-[#9B1C1C] text-sm font-bold uppercase tracking-wider hover:underline flex items-center">
                  Read More <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Documents Widget */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center">
              <FileText className="w-4 h-4 text-blue-600 mr-2" />
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">My Recent Documents</h3>
            </div>
            <div className="p-6 text-center text-gray-500 text-sm">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p>You have no pending documents or recent approvals.</p>
            </div>
          </div>

        </div>

        {/* Sidebar Area (Right 1 Column) */}
        <div className="space-y-6">
          
          {/* Quick Links Widget */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center">
              <LinkIcon className="w-4 h-4 text-gray-600 mr-2" />
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Quick Links</h3>
            </div>
            <div className="flex flex-col">
              <a href="#" className="px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9B1C1C] border-b border-gray-100 transition-colors flex justify-between items-center">
                University Website <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9B1C1C] border-b border-gray-100 transition-colors flex justify-between items-center">
                Academic Calendar <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9B1C1C] border-b border-gray-100 transition-colors flex justify-between items-center">
                Library Portal <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#9B1C1C] transition-colors flex justify-between items-center">
                IT Helpdesk <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Upcoming Events Widget */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center">
              <Calendar className="w-4 h-4 text-green-600 mr-2" />
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Upcoming Events</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex">
                <div className="flex flex-col items-center justify-center bg-gray-100 border border-gray-200 px-3 py-1 mr-3 min-w-[50px]">
                  <span className="text-xs font-bold text-[#9B1C1C] uppercase">May</span>
                  <span className="text-lg font-black text-gray-800">15</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Final Examinations</h4>
                  <p className="text-xs text-gray-500">All Campuses</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col items-center justify-center bg-gray-100 border border-gray-200 px-3 py-1 mr-3 min-w-[50px]">
                  <span className="text-xs font-bold text-[#9B1C1C] uppercase">Jun</span>
                  <span className="text-lg font-black text-gray-800">02</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">University Intramurals</h4>
                  <p className="text-xs text-gray-500">Main Grandstand</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PortalLayout>
  );
};