// ─────────────────────────────────────────────────────────────
// mockData.ts
// BUG FIX: Removed duplicate MeetingMinute interface from this
// file. The canonical type lives in src/lib/store.ts.
// Import it from there wherever needed.
// ─────────────────────────────────────────────────────────────

export interface Person {
  role: string;
  name: string;
  email: string;
  phone: string;
  highlighted?: boolean;
}

export interface CompanyOrg {
  id: string;
  name: string;
  industry: string;
  purchasing: Person[];
  development: Person[];
}

export const initialContacts = [
  { id: 1, name: 'Klaus Müller', company: 'Siemens AG', role: 'Procurement Manager', email: 'klaus.m@siemens.com', phone: '+49 89 123456', status: 'Active', lastContact: '2 days ago' },
  { id: 2, name: 'Elena Rossi', company: 'Magneti Marelli', role: 'Lead Engineer', email: 'elena.rossi@magneti.it', phone: '+39 02 987654', status: 'Lead', lastContact: '1 week ago' },
  { id: 3, name: 'John Smith', company: 'BorgWarner', role: 'Supply Chain Dir.', email: 'jsmith@borgwarner.com', phone: '+1 248 555 0199', status: 'Active', lastContact: '3 days ago' },
  { id: 4, name: 'Sophie Martin', company: 'Valeo', role: 'Purchasing Agent', email: 'sophie.m@valeo.fr', phone: '+33 1 23 45 67 89', status: 'Inactive', lastContact: '2 months ago' },
  { id: 5, name: 'Taro Tanaka', company: 'Denso', role: 'Senior Buyer', email: 'taro.t@denso.co.jp', phone: '+81 3 1234 5678', status: 'Active', lastContact: '1 day ago' },
  { id: 6, name: 'Lars Jensen', company: 'Danfoss', role: 'Category Manager', email: 'lars.j@danfoss.com', phone: '+45 70 20 44 55', status: 'Lead', lastContact: '4 days ago' },
  { id: 7, name: 'Maria Garcia', company: 'Bosch', role: 'Sourcing Lead', email: 'maria.g@bosch.com', phone: '+49 711 811 0', status: 'Active', lastContact: '5 hours ago' },
];

export const initialCompanies = [
  { id: 'siemens', name: 'Siemens AG', industry: 'Industrial Manufacturing' },
  { id: 'magneti', name: 'Magneti Marelli', industry: 'Automotive' },
  { id: 'borgwarner', name: 'BorgWarner', industry: 'Automotive' },
  { id: 'valeo', name: 'Valeo', industry: 'Automotive Supplier' },
  { id: 'denso', name: 'Denso', industry: 'Automotive Supplier' },
  { id: 'danfoss', name: 'Danfoss', industry: 'Industrial' },
  { id: 'bosch', name: 'Bosch', industry: 'Automotive & Industrial' },
  { id: 'volvo', name: 'Volvo Cars', industry: 'Automotive' },
];

export const companiesData: Record<string, CompanyOrg> = {
  'volvo': {
    id: 'volvo',
    name: 'Volvo Cars',
    industry: 'Automotive',
    purchasing: [
      { role: 'Procurement Director', name: 'Michael Bader', email: 'michael.bader@volvocars.com', phone: '+46708210934' },
      { role: 'Procurement Manager', name: 'Anton Bergäng', email: 'anton.bergang@volvocars.com', phone: '+46728870581' },
      { role: 'Category Buyer', name: 'Afra Anjum', email: 'afra.anjum@volvocars.com', phone: '+46723866203', highlighted: true },
    ],
    development: [
      { role: 'Program & System Engineering', name: 'Mikael Larsson', email: 'mikael.larsson.5@volvocars.com', phone: '+46728888876' },
      { role: 'Engineering manager', name: 'Aline Souza', email: 'aline.souza@volvocars.com', phone: '+46732619101', highlighted: true },
      { role: 'Component owner', name: 'Ignacio Victoria Rodriguez', email: 'ignacio.victoria.rodriguez@volvocars.com', phone: '+460708415295', highlighted: true },
    ],
  },
  'siemens': {
    id: 'siemens',
    name: 'Siemens AG',
    industry: 'Industrial Manufacturing',
    purchasing: [
      { role: 'Head of Purchasing', name: 'Klaus Müller', email: 'klaus.m@siemens.com', phone: '+49 89 123456' },
      { role: 'Senior Buyer', name: 'Anna Schmidt', email: 'anna.schmidt@siemens.com', phone: '+49 89 123457' },
    ],
    development: [
      { role: 'Lead Engineer', name: 'Thomas Weber', email: 'thomas.weber@siemens.com', phone: '+49 89 123458' },
    ],
  },
  'bosch': {
    id: 'bosch',
    name: 'Bosch',
    industry: 'Automotive & Industrial',
    purchasing: [
      { role: 'Sourcing Lead', name: 'Maria Garcia', email: 'maria.g@bosch.com', phone: '+49 711 811 0' },
    ],
    development: [
      { role: 'R&D Director', name: 'Hans Becker', email: 'hans.becker@bosch.com', phone: '+49 711 811 1' },
    ],
  },
  'valeo': {
    id: 'valeo',
    name: 'Valeo',
    industry: 'Automotive Supplier',
    purchasing: [
      { role: 'Purchasing Agent', name: 'Sophie Martin', email: 'sophie.m@valeo.fr', phone: '+33 1 23 45 67 89' },
    ],
    development: [
      { role: 'Systems Engineer', name: 'Luc Dubois', email: 'luc.dubois@valeo.fr', phone: '+33 1 23 45 67 90' },
    ],
  },
};

export interface ActionUpdate {
  id: string;
  date: string;
  text: string;
  author: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  updates: ActionUpdate[];
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  status: string;
  actions: ActionItem[];
}

export const projectsData: Project[] = [
  {
    id: 'p-1',
    companyId: 'volvo',
    name: 'Rotor Assembly Prototype',
    status: 'Active',
    actions: [
      {
        id: 'a-1',
        task: 'Technical review of Component Specs',
        owner: 'Mike Ross',
        dueDate: '2023-10-28',
        status: 'In Progress',
        priority: 'Medium',
        updates: [
          { id: 'u-1', date: '2023-10-20', text: 'Initial review completed, waiting for feedback from Aline Souza.', author: 'Mike Ross' },
          { id: 'u-2', date: '2023-10-24', text: 'Feedback received, updating specs.', author: 'Mike Ross' },
        ],
      },
      {
        id: 'a-2',
        task: 'Send updated pricing',
        owner: 'Jane Doe',
        dueDate: '2023-10-25',
        status: 'Open',
        priority: 'High',
        updates: [],
      },
    ],
  },
  {
    id: 'p-2',
    companyId: 'volvo',
    name: 'Q3 Supply Contract',
    status: 'Active',
    actions: [
      {
        id: 'a-3',
        task: 'Follow up with Afra Anjum regarding volume',
        owner: 'Jane Doe',
        dueDate: '2023-10-26',
        status: 'Open',
        priority: 'High',
        updates: [
          { id: 'u-3', date: '2023-10-19', text: 'Sent initial email, waiting for reply.', author: 'Jane Doe' },
        ],
      },
    ],
  },
  {
    id: 'p-3',
    companyId: 'siemens',
    name: 'Annual Contract 2024',
    status: 'Active',
    actions: [
      {
        id: 'a-4',
        task: 'Submit quality audit documentation',
        owner: 'Mike Ross',
        dueDate: '2023-10-15',
        status: 'Completed',
        priority: 'Medium',
        updates: [
          { id: 'u-4', date: '2023-10-14', text: 'Documents compiled and sent via portal.', author: 'Mike Ross' },
          { id: 'u-5', date: '2023-10-15', text: 'Siemens confirmed receipt and approval.', author: 'Mike Ross' },
        ],
      },
    ],
  },
];

export interface Deal {
  id: number;
  title: string;
  company: string;
  segment: string;
  stage: string;
  probability: number;
  rfqNumber: string;
  rfqDate: string;
  responsibleSales: string;
  responsibleRnD: string;
  peakYearQuantity: number;
  peakYearSales: number;
  hidriaInvestment: number;
  customerOrderEquip: number;
  totalProjectValue: number;
  offerDueDate: string;
  offerNumber: string;
  offerDate: string;
}

export const initialDealsData: Deal[] = [
  {
    id: 1,
    title: 'Stator Core Q3 Supply',
    company: 'Siemens AG',
    segment: 'Industrial',
    stage: 'proposal',
    probability: 60,
    rfqNumber: 'RFQ-2026-001',
    rfqDate: '2026-01-15',
    responsibleSales: 'Jane Doe',
    responsibleRnD: 'Mike Ross',
    peakYearQuantity: 50000,
    peakYearSales: 120000,
    hidriaInvestment: 15000,
    customerOrderEquip: 5000,
    totalProjectValue: 150000,
    offerDueDate: '2026-10-15',
    offerNumber: 'OFF-2026-001',
    offerDate: '2026-02-01',
  },
  {
    id: 2,
    title: 'Rotor Assembly Prototype',
    company: 'Bosch',
    segment: 'Automotive',
    stage: 'qualified',
    probability: 40,
    rfqNumber: 'RFQ-2026-042',
    rfqDate: '2026-02-10',
    responsibleSales: 'John Smith',
    responsibleRnD: 'Sarah Jenkins',
    peakYearQuantity: 10000,
    peakYearSales: 35000,
    hidriaInvestment: 50000,
    customerOrderEquip: 0,
    totalProjectValue: 45000,
    offerDueDate: '2026-11-01',
    offerNumber: '',
    offerDate: '',
  },
  {
    id: 3,
    title: 'EV Motor Laminations',
    company: 'Valeo',
    segment: 'E-Mobility',
    stage: 'negotiation',
    probability: 80,
    rfqNumber: 'RFQ-2025-899',
    rfqDate: '2025-11-20',
    responsibleSales: 'Jane Doe',
    responsibleRnD: 'Mike Ross',
    peakYearQuantity: 250000,
    peakYearSales: 800000,
    hidriaInvestment: 120000,
    customerOrderEquip: 80000,
    totalProjectValue: 3200000,
    offerDueDate: '2026-09-30',
    offerNumber: 'OFF-2025-142',
    offerDate: '2025-12-15',
  },
  {
    id: 4,
    title: 'New HVAC Motor Cores',
    company: 'Denso',
    segment: 'Automotive',
    stage: 'lead',
    probability: 20,
    rfqNumber: 'RFQ-2026-088',
    rfqDate: '2026-02-20',
    responsibleSales: 'John Smith',
    responsibleRnD: 'Sarah Jenkins',
    peakYearQuantity: 100000,
    peakYearSales: 250000,
    hidriaInvestment: 40000,
    customerOrderEquip: 10000,
    totalProjectValue: 1100000,
    offerDueDate: '2026-12-15',
    offerNumber: '',
    offerDate: '',
  },
];

// ─────────────────────────────────────────────────────────────
// REMOVED: MeetingMinute interface — use the one from store.ts
// REMOVED: sharedMinutes array — data now lives in store.ts
// This avoids the dual-type conflict that caused TS errors when
// store.ts and mockData.ts exported two incompatible versions.
// ─────────────────────────────────────────────────────────────
