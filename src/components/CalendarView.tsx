import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  Map as MapIcon,
  X,
  FileText,
  Upload,
  Download,
  ExternalLink,
  Eye,
} from 'lucide-react';

import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useAppStore, type MeetingMinute } from '../lib/store';

// ── Leaflet marker icon fix ────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Types ───────────────────────────────────────────────────────────────────
type Visit = {
  id: number;
  title: string;
  company: string;
  location: string;
  date: string;           // YYYY-MM-DD
  time: string;           // "09:00 - 16:00"
  attendees: string[];
  type: 'Audit' | 'Workshop' | 'Review' | 'Meeting' | 'Tour';
  coordinates: [number, number];
};

// ── Constants & sample data ────────────────────────────────────────────────
const STORAGE_KEY = 'lamtec-visits-calendar-v1';
const currentYear = new Date().getFullYear();

const initialVisits: Visit[] = [
  { id: 1, title: 'Annual Supplier Audit',     company: 'Volvo Cars',       location: 'Torslanda, Sweden', date: `${currentYear}-11-15`, time: '09:00 - 16:00', attendees: ['Michael Bader', 'Jane Doe'],     type: 'Audit',    coordinates: [57.721,  11.778]  },
  { id: 2, title: 'Technical Workshop',        company: 'Bosch',            location: 'Stuttgart, Germany', date: `${currentYear}-11-20`, time: '10:00 - 14:00', attendees: ['Maria Garcia', 'Mike Ross'],     type: 'Workshop', coordinates: [48.7758, 9.1829]  },
  { id: 3, title: 'Q4 Business Review',        company: 'Siemens AG',       location: 'Munich, Germany',    date: `${currentYear - 1}-12-05`, time: '13:00 - 15:00', attendees: ['Klaus Müller', 'Jane Doe'],      type: 'Review',   coordinates: [48.1351, 11.582]  },
  { id: 4, title: 'Prototype Handover',        company: 'Valeo',            location: 'Paris, France',      date: `${currentYear - 1}-10-02`, time: '11:00 - 12:30', attendees: ['Sophie Martin', 'Jane Doe'],    type: 'Meeting',  coordinates: [48.8566, 2.3522]  },
  { id: 5, title: 'Initial Plant Tour',        company: 'Denso',            location: 'Hidria HQ, Slovenia', date: `${currentYear - 1}-09-28`, time: '09:00 - 15:00', attendees: ['Taro Tanaka', 'Mike Ross'],     type: 'Tour',     coordinates: [46.0289, 14.0222] },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const parseVisitDateTime = (visit: Visit) => {
  const [startRaw, endRaw] = visit.time.split('-').map((s) => s.trim());
  const startStr = `${visit.date}T${(startRaw || '09:00').padEnd(5, '0')}:00`;
  const endStr   = `${visit.date}T${(endRaw   || '17:00').padEnd(5, '0')}:00`;

  const start = new Date(startStr);
  let end = new Date(endStr);

  if (Number.isNaN(start.getTime())) {
    const fallback = new Date(`${visit.date}T09:00:00`);
    return { start: fallback, end: new Date(fallback.getTime() + 8 * 60 * 60 * 1000) };
  }

  if (Number.isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
  }

  return { start, end };
};

const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const buildIcsFile = (visits: Visit[]) => {
  const events = visits.map((v) => {
    const { start, end } = parseVisitDateTime(v);
    return [
      'BEGIN:VEVENT',
      `UID:${v.id}@lamtec-crm`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${v.title} (${v.company})`,
      `LOCATION:${v.location}`,
      `DESCRIPTION:Type: ${v.type}\\nAttendees: ${v.attendees.join(', ')}`,
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lamtec CRM//Visits Calendar//EN', events, 'END:VCALENDAR'].join('\r\n');
};

const downloadIcs = (filename: string, visits: Visit[]) => {
  if (!visits.length) return;
  const ics = buildIcsFile(visits);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const isPastVisit = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateStr}T00:00:00`) < today;
};

const buildOutlookLink = (visit: Visit) => {
  const { start, end } = parseVisitDateTime(visit);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `${visit.title} (${visit.company})`,
    location: visit.location,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: `Visit type: ${visit.type}\nAttendees: ${visit.attendees.join(', ')}`,
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params}`;
};

// ── Main Component ──────────────────────────────────────────────────────────
export function CalendarView() {
  const [view, setView] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [displayMode, setDisplayMode] = useState<'list' | 'map'>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const [allVisits, setAllVisits] = useState<Visit[]>(initialVisits);
  const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
    Audit: true,
    Workshop: true,
    Review: true,
    Meeting: true,
    Tour: true,
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    title: '', company: '', location: '', date: '', time: '', type: 'Meeting' as const, attendees: '',
  });

  // Meeting minutes modal
  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [selectedLinkedMinute, setSelectedLinkedMinute] = useState<MeetingMinute | null>(null);
  const [minutesType, setMinutesType] = useState<'text' | 'file'>('text');
  const [minutesContent, setMinutesContent] = useState('');
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addMeetingMinute, meetingMinutes } = useAppStore();

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Visit[];
        if (Array.isArray(parsed) && parsed.length > 0) setAllVisits(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisits));
  }, [allVisits]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const upcomingVisits = useMemo(
    () => allVisits.filter((v) => !isPastVisit(v.date)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [allVisits]
  );

  const pastVisits = useMemo(
    () => allVisits.filter((v) => isPastVisit(v.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allVisits]
  );

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const year  = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = (first.getDay() + 6) % 7; // Monday = 0

    return Array.from({ length: 42 }, (_, i) => {
      const day = i - startWeekday + 1;
      if (day < 1 || day > daysInMonth) return null;
      const d = new Date(year, month, day);
      return {
        dayNumber: day,
        dateKey: d.toISOString().split('T')[0],
      };
    });
  }, [currentMonth]);

  const visitDatesInMonth = useMemo(() => {
    const prefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    return new Set(allVisits.filter((v) => v.date.startsWith(prefix)).map((v) => v.date));
  }, [allVisits, currentMonth]);

  const displayedVisits = useMemo(() => {
    const source = view === 'Upcoming' ? upcomingVisits : pastVisits;
    return source.filter((v) => {
      const dateMatch = !selectedDate || v.date === selectedDate;
      const typeMatch = activeTypes[v.type] ?? true;
      return dateMatch && typeMatch;
    });
  }, [view, upcomingVisits, pastVisits, selectedDate, activeTypes]);

  const linkedMinutesCount = useMemo(
    () => displayedVisits.reduce((sum, v) => sum + meetingMinutes.filter((m) => m.visitId === v.id).length, 0),
    [displayedVisits, meetingMinutes]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    let coords: [number, number] = [48.1351, 11.582]; // Munich fallback

    const loc = newVisit.location.toLowerCase();
    if (loc.includes('paris'))    coords = [48.8566,  2.3522];
    else if (loc.includes('london'))  coords = [51.5074, -0.1278];
    else if (loc.includes('berlin'))  coords = [52.5200, 13.4050];
    else if (loc.includes('ljubljana') || loc.includes('slovenia')) coords = [46.0569, 14.5058];

    const visit: Visit = {
      id: Date.now(),
      title: newVisit.title.trim(),
      company: newVisit.company.trim(),
      location: newVisit.location.trim(),
      date: newVisit.date,
      time: newVisit.time.trim(),
      type: newVisit.type,
      attendees: newVisit.attendees.split(',').map((s) => s.trim()).filter(Boolean),
      coordinates: coords,
    };

    setAllVisits((prev) => [...prev, visit]);
    setIsScheduleModalOpen(false);
    setNewVisit({ title: '', company: '', location: '', date: '', time: '', type: 'Meeting', attendees: '' });
  };

  const handleAddMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    addMeetingMinute({
      id: Date.now(),
      title: selectedVisit.title,
      company: selectedVisit.company,
      date: selectedVisit.date,
      attendees: selectedVisit.attendees,
      summary: minutesType === 'text' ? minutesContent : 'File uploaded',
      status: 'Finalized',
      type: minutesType,
      content: minutesType === 'text' ? minutesContent : undefined,
      fileName: minutesType === 'file' && minutesFile ? minutesFile.name : undefined,
      fileSize: minutesType === 'file' && minutesFile ? `${(minutesFile.size / 1024 / 1024).toFixed(2)} MB` : undefined,
      visitId: selectedVisit.id,
      visitTitle: selectedVisit.title,
    });

    setIsMinutesModalOpen(false);
    setSelectedVisit(null);
    setMinutesContent('');
    setMinutesFile(null);
    setMinutesType('text');
  };

  const getLinkedMinutes = (visitId: number) => meetingMinutes.filter((m) => m.visitId === visitId);

  const handleDetailsClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsMinutesModalOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* Hero banner */}
      <div className="rounded-3xl border border-slate-700/30 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100">
              Field Operations
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">Visits Calendar</h1>
            <p className="mt-3 max-w-2xl text-blue-100/85">
              Plan customer visits, connect meeting minutes, and export to calendar apps.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadIcs('lamtec-upcoming-visits.ics', upcomingVisits)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/15 transition-colors"
            >
              <Download className="h-4 w-4" /> Export Upcoming
            </button>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-4 w-4" /> Schedule Visit
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar – Calendar + Filters */}
        <div className="w-full lg:w-80 xl:w-96 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800 uppercase tracking-wide">{monthLabel}</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-6">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <div key={d} className="font-medium text-slate-500 py-2">{d}</div>
              ))}

              {calendarDays.map((day, i) =>
                day ? (
                  <button
                    key={day.dateKey}
                    onClick={() => setSelectedDate((prev) => (prev === day.dateKey ? null : day.dateKey))}
                    className={cn(
                      'relative py-2 rounded-full transition-colors text-sm',
                      selectedDate === day.dateKey
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {day.dayNumber}
                    {visitDatesInMonth.has(day.dateKey) && (
                      <span
                        className={cn(
                          'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                          selectedDate === day.dateKey ? 'bg-white' : 'bg-emerald-500'
                        )}
                      />
                    )}
                  </button>
                ) : (
                  <div key={`empty-${i}`} className="py-2" />
                )
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">Type Filters</h3>
              <div className="space-y-2">
                {Object.keys(activeTypes).map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={activeTypes[type]}
                      onChange={(e) => setActiveTypes((prev) => ({ ...prev, [type]: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main area – List / Map */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[700px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setView('Upcoming')}
                className={cn(
                  'pb-4 border-b-2 text-sm font-medium transition-colors',
                  view === 'Upcoming' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                Upcoming
              </button>
              <button
                onClick={() => setView('Past')}
                className={cn(
                  'pb-4 border-b-2 text-sm font-medium transition-colors',
                  view === 'Past' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                Past
              </button>
            </div>

            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  displayMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
                )}
                title="List view"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDisplayMode('map')}
                className={cn(
                  'p-2 rounded transition-colors',
                  displayMode === 'map' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
                )}
                title="Map view"
              >
                <MapIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {displayMode === 'list' ? (
            <div className="p-6 space-y-4 flex-1 overflow-auto">
              {displayedVisits.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <CalendarIcon className="h-12 w-12 mb-4 opacity-40" />
                  <p>No visits match the current filter</p>
                </div>
              ) : (
                displayedVisits.map((visit) => {
                  const linked = getLinkedMinutes(visit.id);
                  const hasMinutes = linked.length > 0;

                  return (
                    <div
                      key={visit.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleDetailsClick(visit)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDetailsClick(visit); } }}
                      className="group flex flex-col md:flex-row gap-5 p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-20 text-center">
                        <div className="text-xs font-semibold uppercase text-slate-500">
                          {new Date(visit.date).toLocaleString('default', { month: 'short' })}
                        </div>
                        <div className="text-3xl font-bold text-slate-800">
                          {new Date(visit.date).getDate()}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {visit.title}
                          </h3>
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-slate-100 text-slate-700">
                            {visit.type}
                          </span>
                        </div>

                        <div className="text-sm font-medium text-slate-700 mb-3">{visit.company}</div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {visit.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {visit.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {visit.attendees.length} attendee{visit.attendees.length !== 1 ? 's' : ''}
                          </div>
                          <div className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs',
                            hasMinutes ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                          )}>
                            <FileText className="h-3.5 w-3.5" />
                            {hasMinutes ? `${linked.length} minute${linked.length > 1 ? 's' : ''}` : 'No minutes'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end self-start md:self-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDetailsClick(visit); }}
                          className={cn(
                            'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                            hasMinutes
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          )}
                        >
                          {hasMinutes ? 'View / Add Minutes' : 'Add Minutes'}
                        </button>

                        <a
                          href={buildOutlookLink(visit)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" /> Outlook
                        </a>

                        <button
                          onClick={(e) => { e.stopPropagation(); downloadIcs(`visit-${visit.id}.ics`, [visit]); }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Download className="h-4 w-4" /> ICS
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex-1 relative min-h-[500px]">
              <MapContainer center={[49.0, 10.0]} zoom={4} className="h-full w-full">
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {displayedVisits.map((visit) => (
                  <Marker key={visit.id} position={visit.coordinates}>
                    <Popup className="w-72">
                      <div className="text-sm">
                        <h3 className="font-semibold mb-1">{visit.title}</h3>
                        <p className="font-medium text-slate-700 mb-2">{visit.company}</p>
                        <div className="space-y-1 text-slate-600">
                          <p className="flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5" /> {visit.date}</p>
                          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {visit.location}</p>
                        </div>
                        <button
                          onClick={() => handleDetailsClick(visit)}
                          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Open Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}

      {/* Schedule Visit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Schedule New Visit</h2>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleScheduleVisit} className="p-6 space-y-5">
              {/* inputs here – same as before but cleaned up */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  required
                  value={newVisit.title}
                  onChange={(e) => setNewVisit({ ...newVisit, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Q2 Technical Review"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company *</label>
                  <input required value={newVisit.company} onChange={(e) => setNewVisit({ ...newVisit, company: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location *</label>
                  <input required value={newVisit.location} onChange={(e) => setNewVisit({ ...newVisit, location: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                  <input required type="date" value={newVisit.date} onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Time *</label>
                  <input required value={newVisit.time} onChange={(e) => setNewVisit({ ...newVisit, time: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" placeholder="09:00 - 16:00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select value={newVisit.type} onChange={(e) => setNewVisit({ ...newVisit, type: e.target.value as any })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
                  <option>Meeting</option>
                  <option>Audit</option>
                  <option>Workshop</option>
                  <option>Review</option>
                  <option>Tour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Attendees (comma separated)</label>
                <input value={newVisit.attendees} onChange={(e) => setNewVisit({ ...newVisit, attendees: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" placeholder="Name One, Name Two" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / View Minutes Modal */}
      {isMinutesModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Meeting Minutes</h2>
                  <p className="text-sm text-slate-500">for {selectedVisit.title}</p>
                </div>
              </div>
              <button onClick={() => { setIsMinutesModalOpen(false); setSelectedVisit(null); setSelectedLinkedMinute(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Visit summary card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold mb-3">{selectedVisit.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> {selectedVisit.company}</div>
                  <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-slate-400" /> {selectedVisit.date}</div>
                  <div className="col-span-2 flex items-start gap-2"><Users className="h-4 w-4 text-slate-400 mt-0.5" /> {selectedVisit.attendees.join(', ')}</div>
                </div>
              </div>

              {/* Existing minutes */}
              {getLinkedMinutes(selectedVisit.id).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Existing Minutes</h4>
                  {getLinkedMinutes(selectedVisit.id).map((m) => (
                    <div key={m.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{m.title}</div>
                          <div className="text-xs text-slate-500">{m.date} • {m.status}</div>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                          {m.type === 'file' ? 'File' : 'Text'}
                        </span>
                      </div>

                      {m.type === 'file' ? (
                        <div className="text-sm text-slate-600">{m.fileName} {m.fileSize && `(${m.fileSize})`}</div>
                      ) : (
                        <div className="text-sm text-slate-700 whitespace-pre-line">{m.content || m.summary}</div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setSelectedLinkedMinute(m)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" /> View full
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New minutes form */}
              <div className="space-y-6">
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMinutesType('text')}
                    className={cn('px-5 py-3 text-sm font-medium border-b-2 transition-colors', minutesType === 'text' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700')}
                  >
                    Write Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinutesType('file')}
                    className={cn('px-5 py-3 text-sm font-medium border-b-2 transition-colors', minutesType === 'file' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700')}
                  >
                    Upload File
                  </button>
                </div>

                {minutesType === 'text' ? (
                  <textarea
                    value={minutesContent}
                    onChange={(e) => setMinutesContent(e.target.value)}
                    placeholder="Enter summary, decisions, action items..."
                    className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                  />
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && setMinutesFile(e.target.files[0])}
                    />
                    {minutesFile ? (
                      <div className="space-y-2">
                        <p className="font-medium">{minutesFile.name}</p>
                        <p className="text-sm text-slate-500">{(minutesFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:underline">Change file</button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                        <p className="font-medium mb-1">Click or drag file here</p>
                        <p className="text-sm text-slate-500">PDF, DOCX, TXT • max 10 MB</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
                          Select File
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={() => { setIsMinutesModalOpen(false); setSelectedVisit(null); }} className="px-6 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button
                  type="button"
                  onClick={handleAddMinutes}
                  disabled={minutesType === 'text' ? !minutesContent.trim() : !minutesFile}
                  className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Minutes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View single minute detail */}
      {selectedLinkedMinute && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b">
              <div>
                <h2 className="text-xl font-semibold">{selectedLinkedMinute.title}</h2>
                <p className="text-sm text-slate-500">{selectedLinkedMinute.company} • {selectedLinkedMinute.date}</p>
              </div>
              <button onClick={() => setSelectedLinkedMinute(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', selectedLinkedMinute.status === 'Finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                  {selectedLinkedMinute.status}
                </span>
                {selectedLinkedMinute.visitTitle && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Linked to visit
                  </span>
                )}
              </div>

              {selectedLinkedMinute.type === 'file' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <p className="font-medium mb-1">{selectedLinkedMinute.fileName}</p>
                  {selectedLinkedMinute.fileSize && <p className="text-sm text-slate-500">{selectedLinkedMinute.fileSize}</p>}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 whitespace-pre-line text-slate-800 leading-relaxed">
                  {selectedLinkedMinute.content || selectedLinkedMinute.summary || 'No content available'}
                </div>
              )}

              <div className="text-sm text-slate-600">
                <span className="font-medium">Attendees:</span> {selectedLinkedMinute.attendees.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
