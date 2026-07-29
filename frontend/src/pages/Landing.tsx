// src/pages/Landing.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Newspaper,
  GraduationCap,
  FileCheck,
  Library,
  Monitor,
  X,
} from "lucide-react";

// --- SMART DATE FORMATTERS ---
const parseDateSafe = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const getCalendarBoxText = (
  startStr: string,
  endStr: string | null | undefined
) => {
  const s = parseDateSafe(startStr);
  const e = parseDateSafe(endStr);

  if (!s) return "--";
  if (!e) return s.getDate().toString();

  if (s.toDateString() === e.toDateString()) return s.getDate().toString();

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}-${e.getDate()}`;
  }

  return s.getDate().toString();
};

const getCalendarBoxMonth = (startStr: string) => {
  const s = parseDateSafe(startStr);
  return s ? s.toLocaleString("default", { month: "short" }) : "---";
};

const getFullRangeText = (
  startStr: string,
  endStr: string | null | undefined
) => {
  const s = parseDateSafe(startStr);
  const e = parseDateSafe(endStr);

  if (!s || !e) return null;
  if (s.toDateString() === e.toDateString()) return null;

  const sMonth = s.toLocaleString("default", { month: "short" });
  const eMonth = e.toLocaleString("default", { month: "short" });

  if (sMonth === eMonth && s.getFullYear() === e.getFullYear()) {
    return `${sMonth} ${s.getDate()} - ${e.getDate()}, ${s.getFullYear()}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${sMonth} ${s.getDate()} - ${eMonth} ${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${sMonth} ${s.getDate()}, ${s.getFullYear()} - ${eMonth} ${e.getDate()}, ${e.getFullYear()}`;
};

// --- STATIC ADMINISTRATION DATA ---
const administrators = [
  {
    name: "Dr. Ma. Carla A. Ochotorena",
    title: "University President",
    image: "/wmsu-logo.png",
  },
  {
    name: "Dr. Roberto M. Sala",
    title: "Vice President for Administration and Finance",
    image: "/wmsu-logo.png",
  },
  {
    name: "Dr. Ricardo A. Somblingo",
    title: "Campus Administrator, WMSU Ipil",
    image: "/wmsu-logo.png",
  },
];

export const Landing: React.FC = () => {
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [academicDates, setAcademicDates] = useState<any[]>([]);
  const [administrators, setAdministrators] = useState<any[]>([]);

  // Modal States
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Fetch Administrators
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/administrators`)
      .then((res) => res.json())
      .then((data) => setAdministrators(data))
      .catch((err) => console.error("Error fetching administrators:", err));
  }, []);

  // Fetch News & Dates
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/news`)
      .then((res) => res.json())
      .then((data) => setLiveNews(data.slice(0, 3)))
      .catch((err) => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL}/api/academic-dates`)
      .then((res) => res.json())
      .then((data) => setAcademicDates(data)) // Fetch ALL dates
      .catch((err) => console.error(err));
  }, []);

  // Only show the top 4 in the right-hand sidebar
  const sidebarDates = academicDates.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 flex flex-col">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 w-full">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 shrink-0">
                <img
                  src="/wmsu-esu-logo.png"
                  alt="WMSU ESU Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain mix-blend-multiply"
                />
                <img
                  src="/wmsu-logo.png"
                  alt="WMSU Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="flex flex-col shrink-0 justify-center">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight">
                  <span className="hidden lg:inline">
                    Western Mindanao State University
                  </span>
                  <span className="lg:hidden">WMSU</span>
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-[#9B1C1C]">
                  Ipil Campus
                </span>
              </div>
            </div>
            <div className="hidden xl:flex flex-1 items-center justify-start min-w-0 pl-6 ml-6 border-l border-gray-200 h-10">
              <img
                src="/seal.png"
                alt="Institutional Quality Seals"
                className="w-full h-full object-contain object-left mix-blend-multiply"
              />
            </div>
            <div className="flex items-center gap-4 lg:gap-6 shrink-0 ml-auto xl:ml-6">
              <div className="hidden lg:flex items-center gap-4 lg:gap-6 text-sm font-medium text-gray-600">
                <a
                  href="#"
                  className="hover:text-[#9B1C1C] transition-colors whitespace-nowrap"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="hover:text-[#9B1C1C] transition-colors whitespace-nowrap"
                >
                  Admissions
                </a>
                <a
                  href="#"
                  className="hover:text-[#9B1C1C] transition-colors whitespace-nowrap"
                >
                  Contact
                </a>
              </div>
              <Link
                to="/login"
                className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-4 sm:px-6 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all flex items-center whitespace-nowrap shrink-0"
              >
                MyWMSU
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (DASHBOARD GRID LAYOUT) --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ================= LEFT COLUMN (Span 2) ================= */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
            {/* 1. Hero Banner */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm relative overflow-hidden p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  WMSU Ipil Campus <br className="hidden lg:block" />
                  <span className="text-[#9B1C1C]">Academic Portal</span>
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl font-medium mx-auto md:mx-0">
                  Welcome to the official portal of Western Mindanao State
                  University - Ipil Campus. Access academic records, campus
                  services, and important university information in one secure
                  platform.
                </p>
              </div>
              <div className="hidden md:flex shrink-0 opacity-10 select-none pointer-events-none">
                <img
                  src="/wmsu-logo.png"
                  alt="WMSU Crest"
                  className="w-32 h-32 object-contain grayscale"
                />
              </div>
            </div>

            {/* 2. Latest News */}
<div className="flex flex-col gap-4 overflow-hidden">
  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider px-1 flex items-center">
    <Newspaper className="w-4 h-4 mr-2 text-[#9B1C1C]" /> Latest News
  </h2>

  {/* Changed to flex-row, added overflow-x-auto, snap scrolling, and padding */}
  <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
    {liveNews.length === 0 ? (
      <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500 shadow-sm border-dashed w-full">
        No recent news updates.
      </div>
    ) : (
      liveNews.map((newsItem) => (
        <div
          key={newsItem.id}
          // Added fixed width (w-[280px] sm:w-[320px]), flex-col for stacked layout, and snap-start
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 shrink-0 w-[280px] sm:w-[320px] snap-start"
        >
          <div
            onClick={() => setSelectedNews(newsItem)}
            // Adjusted image container to span full width of the card and fixed height
            className="w-full h-40 bg-gray-100 rounded-md border border-gray-200 shrink-0 overflow-hidden relative flex items-center justify-center cursor-pointer group"
          >
            {newsItem.image_url ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${newsItem.image_url}`}
                alt="News Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <Newspaper className="w-8 h-8 opacity-20 text-gray-500 group-hover:scale-110 transition-transform" />
            )}
          </div>
          
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-[#9B1C1C] uppercase tracking-widest mb-1.5 line-clamp-1">
              {newsItem.category} • {new Date(newsItem.created_at).toLocaleDateString()}
            </span>
            <h3
              onClick={() => setSelectedNews(newsItem)}
              className="text-base font-bold text-gray-900 mb-2 leading-snug hover:text-[#9B1C1C] cursor-pointer transition-colors line-clamp-2"
            >
              {newsItem.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {newsItem.content}
            </p>
            <button
              onClick={() => setSelectedNews(newsItem)}
              className="text-xs font-semibold text-[#9B1C1C] hover:text-[#7a1515] uppercase tracking-wider flex items-center w-max mt-auto group"
            >
              Read Full Article{" "}
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</div>
          </div>

          {/* ================= RIGHT COLUMN (Span 1) ================= */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* 3. Important Dates Sidebar */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider px-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#9B1C1C]" /> Important
                Dates
              </h2>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="divide-y divide-gray-100 flex-1">
                  {sidebarDates.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 italic">
                      No upcoming events scheduled.
                    </div>
                  ) : (
                    sidebarDates.map((item) => {
                      const boxText = getCalendarBoxText(
                        item.event_date,
                        item.end_date
                      );
                      const boxMonth = getCalendarBoxMonth(item.event_date);
                      const rangeText = getFullRangeText(
                        item.event_date,
                        item.end_date
                      );

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedDate(item)}
                          // Simple, subtle background color change on row hover
                          className="p-4 hover:bg-gray-50 flex gap-3.5 items-start group cursor-pointer transition-colors"
                        >
                          <div
                            // Removed the red background transition. Just a slight border darken on hover.
                            className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 group-hover:border-gray-300 rounded-md w-[52px] h-[52px] shrink-0 transition-colors mt-0.5"
                          >
                            {/* Removed hover:text-white and hover:text-red-100 */}
                            <span className="text-[9px] font-bold text-gray-500 uppercase">
                              {boxMonth}
                            </span>
                            <span
                              className={`${
                                boxText.includes("-") ? "text-xs" : "text-base"
                              } font-extrabold text-gray-700 leading-none mt-0.5`}
                            >
                              {boxText}
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0 justify-center">
                            {/* Only the title turns red to show it's clickable, with no sliding animation */}
                            <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 group-hover:text-[#9B1C1C] transition-colors">
                              {item.title}
                            </h4>
                            {rangeText && (
                              <span className="text-[10px] font-bold text-[#9B1C1C] mb-0.5">
                                {rangeText}
                              </span>
                            )}
                            <p className="text-xs text-gray-500 truncate">
                              {item.target_audience}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* View Full Calendar Button */}
                {/* View Full Calendar Button */}
                <button
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="w-full p-3.5 bg-gray-50 border-t border-gray-100 text-center hover:bg-gray-100 transition-colors flex items-center justify-center shrink-0"
                >
                  <span className="text-xs font-semibold text-[#9B1C1C] uppercase tracking-wider flex items-center">
                    Full Calendar <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </button>
              </div>
            </div>

            {/* 4. Campus Services */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider px-1 flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-[#9B1C1C]" /> Campus
                Services
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col divide-y divide-gray-100">
                <a
                  href="#"
                  className="p-4 hover:bg-gray-50 flex gap-3.5 items-center group transition-colors"
                >
                  {/* Removed group-hover:bg-[#9B1C1C] and group-hover:text-white */}
                  <div className="p-2 bg-red-50 text-[#9B1C1C] rounded shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#9B1C1C] transition-colors mb-0.5">
                      Online Enrollment
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      Register for classes & schedules.
                    </p>
                  </div>
                </a>

                <a
                  href="#"
                  className="p-4 hover:bg-gray-50 flex gap-3.5 items-center group transition-colors"
                >
                  {/* Removed group-hover:bg-[#9B1C1C] and group-hover:text-white */}
                  <div className="p-2 bg-red-50 text-[#9B1C1C] rounded shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#9B1C1C] transition-colors mb-0.5">
                      Document Requests
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      Transcripts & certifications.
                    </p>
                  </div>
                </a>

                <a
                  href="#"
                  className="p-4 hover:bg-gray-50 flex gap-3.5 items-center group transition-colors"
                >
                  {/* Removed group-hover:bg-[#9B1C1C] and group-hover:text-white */}
                  <div className="p-2 bg-red-50 text-[#9B1C1C] rounded shrink-0">
                    <Library className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#9B1C1C] transition-colors mb-0.5">
                      University Library
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      Browse catalogs & journals.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- UNIVERSITY ADMINISTRATION SECTION (NEW) --- */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 border-b-4 border-[#9B1C1C] inline-block pb-2">
              University Administration
            </h2>
            <p className="mt-4 text-sm md:text-base text-gray-500 font-medium">
              The leadership driving academic excellence at WMSU Ipil Campus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {administrators.map((admin, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-32 h-32 mb-5 rounded-full overflow-hidden border-4 border-[#9B1C1C] bg-white shadow-inner shrink-0">
                  <img
                    src={
                      admin.image_url.startsWith("/uploads")
                        ? `${import.meta.env.VITE_API_URL}${admin.image_url}`
                        : admin.image_url
                    }
                    alt={admin.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center leading-tight">
                  {admin.name}
                </h3>
                <p className="text-sm font-bold text-[#9B1C1C] text-center mt-1.5">
                  {admin.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-xs font-medium text-gray-500">
            &copy; {new Date().getFullYear()} Western Mindanao State University
            - Ipil Campus.
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-400 justify-center md:justify-end">
            <a href="#" className="hover:text-gray-700 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Directory
            </a>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODALS SECTION                           */}
      {/* ============================================================== */}

      {/* 1. FULL ARTICLE READING MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 bg-gray-900/70 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-3xl w-full rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center text-[10px] font-bold text-[#9B1C1C] uppercase tracking-widest">
                <Newspaper className="w-4 h-4 mr-2 text-gray-400" />
                News & Announcements
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 md:p-8">
              {selectedNews.image_url && (
                <div className="mb-6 w-full h-64 sm:h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${
                      selectedNews.image_url
                    }`}
                    alt="Article Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <span className="text-xs font-bold text-[#9B1C1C] uppercase tracking-widest mb-2 block">
                  {selectedNews.category} •{" "}
                  {new Date(selectedNews.created_at).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {selectedNews.title}
                </h2>
              </div>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-normal">
                {selectedNews.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SINGLE EVENT DETAILS MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 bg-gray-900/70 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-md w-full rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center text-[10px] font-bold text-[#9B1C1C] uppercase tracking-widest">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                Event Details
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 md:p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-red-50 text-[#9B1C1C] rounded-full flex items-center justify-center mb-5 border border-red-100 shadow-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight mb-2">
                {selectedDate.title}
              </h2>
              <p className="text-sm font-bold text-[#9B1C1C] mb-6">
                {getFullRangeText(
                  selectedDate.event_date,
                  selectedDate.end_date
                ) ||
                  new Date(selectedDate.event_date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
              </p>
              <div className="bg-gray-50 px-4 py-3 rounded-md border border-gray-200 w-full text-left">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center">
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{" "}
                  Target Audience
                </p>
                <p className="text-sm text-gray-800 font-medium pl-5">
                  {selectedDate.target_audience}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL ACADEMIC CALENDAR MODAL */}
      {/* --- VIEW FULL CALENDAR MODAL (TIMELINE UI) --- */}
{isCalendarModalOpen && (
  <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm transition-opacity">
    <div className="bg-neutral-50 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      
      {/* Modal Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <h3 className="font-semibold text-gray-900 text-base flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-[#9B1C1C]" /> Academic Calendar
        </h3>
        <button onClick={() => setIsCalendarModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-200 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Modal Body: Timeline UI */}
      <div className="overflow-y-auto p-6 md:p-12 flex-1">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-[#9B1C1C] uppercase tracking-widest mb-2">A.Y. 2025 - 2026</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Schedule of Activities</h3>
          </div>

          {/* Timeline Container */}
          <div className="relative border-l-2 border-gray-200 ml-4 md:ml-0 space-y-12 pb-10">
            
            {/* DYNAMIC DATABASE MAPPING */}
            {/* Replace 'sidebarDates' with your full events array state if it's named differently (e.g., 'allEvents') */}
            {sidebarDates.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 italic">
                No events found in the database.
              </div>
            ) : (
              sidebarDates.map((event) => {
                // 1. Format the date text (reusing your existing helper function)
                const rangeText = getFullRangeText(event.event_date, event.end_date);
                
                // 2. Dynamically determine if the event is today or in the future
                // (Sets the dot to Red if upcoming, Gray if passed)
                const isUpcoming = new Date(event.event_date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0);

                return (
                  <div key={event.id} className="relative pl-8 md:pl-0">
                    <div className="md:flex items-start justify-between">
                      
                      {/* Left Column (Desktop Date) */}
                      <div className="hidden md:block md:w-1/4 text-right pr-8 pt-1">
                        <span className={`text-sm font-bold block ${isUpcoming ? 'text-[#9B1C1C]' : 'text-gray-600'}`}>
                          {rangeText || new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {event.category || 'Event'}
                        </span>
                      </div>
                      
                      {/* The Timeline Dot */}
                      <div className={`absolute left-[-9px] md:left-[25%] md:-ml-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-neutral-50 z-10 ${isUpcoming ? 'bg-[#9B1C1C]' : 'bg-gray-300'}`}></div>
                      
                      {/* Right Column (Content) */}
                      <div className="md:w-3/4 md:pl-10">
                        {/* Mobile Date (Hidden on Desktop) */}
                        <span className={`md:hidden text-sm font-bold block mb-1 ${isUpcoming ? 'text-[#9B1C1C]' : 'text-gray-600'}`}>
                          {rangeText || new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        
                        {/* Database Title & Audience */}
                        <h4 className="text-lg md:text-xl font-bold text-gray-800">{event.title}</h4>
                        <p className="text-gray-700 font-medium text-sm mb-3">{event.target_audience}</p>
                        
                        {/* Database Description/Remarks */}
                        {event.description && (
                          <p className="text-gray-500 text-sm leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
