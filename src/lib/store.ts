import { create } from 'zustand';

export interface MeetingMinute {
  id: string | number;
  title: string;
  company: string;
  date: string;
  attendees: string[];
  summary: string;
  status: 'Draft' | 'Finalized';
  type?: 'text' | 'file';
  content?: string;
  fileName?: string;
  fileSize?: string;
}

interface AppState {
  meetingMinutes: MeetingMinute[];
  addMeetingMinute: (minute: MeetingMinute) => void;
}

export const useAppStore = create<AppState>((set) => ({
  meetingMinutes: [
    { id: 1, title: 'Q3 Supply Alignment', company: 'Volvo Cars', date: '2023-10-18', attendees: ['Michael Bader', 'Jane Doe', 'Mike Ross'], summary: 'Discussed Q3 supply chain constraints and agreed on a revised delivery schedule for stator cores.', status: 'Finalized' },
    { id: 2, title: 'Technical Review - Rotor Assembly', company: 'Volvo Cars', date: '2023-10-15', attendees: ['Mikael Larsson', 'Aline Souza', 'Jane Doe'], summary: 'Reviewed prototype testing results. Minor adjustments needed on the lamination stack.', status: 'Draft' },
    { id: 3, title: 'Annual Contract Negotiation', company: 'Siemens AG', date: '2023-10-10', attendees: ['Klaus Müller', 'Jane Doe'], summary: 'Initial discussion on 2024 pricing. Siemens requested a 5% volume discount.', status: 'Finalized' },
    { id: 4, title: 'New Project Kickoff', company: 'Bosch', date: '2023-10-05', attendees: ['Maria Garcia', 'Sarah Jenkins', 'Mike Ross'], summary: 'Kickoff for the new HVAC motor cores project. Timelines and milestones set.', status: 'Finalized' },
  ],
  addMeetingMinute: (minute) => set((state) => ({ meetingMinutes: [minute, ...state.meetingMinutes] })),
}));
