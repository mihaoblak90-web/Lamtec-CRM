import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  CheckSquare,
  FileText,
  Calendar,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { initialContacts } from '../lib/mockData';

export function Contacts() {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<typeof initialContacts[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'org' | 'actions' | 'documents' | 'minutes'>('org');

  // Sub-modal state
  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
  const [newAction, setNewAction] = useState({ task: '', dueDate: '' });

  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({ name: '', type: 'Contract' });

  // BUG FIX: was declared twice — removed duplicate state + duplicate modal render
  const [isAddMinuteModalOpen, setIsAddMinuteModalOpen] = useState(false);
  const [newMinute, setNewMinute] = useState({ title: '', date: '', summary: '' });

  const [contactActions, setContactActions] = useState<Record<number, { id: number; task: string; status: string; dueDate: string }[]>>({
    1: [
      { id: 1, task: 'Send updated pricing catalog to Klaus Müller', status: 'Open', dueDate: '2026-03-01' },
      { id: 2, task: 'Schedule Q2 review meeting', status: 'Completed', dueDate: '2026-01-15' },
    ],
    2: [
      { id: 3, task: 'Follow up on RFQ #4492', status: 'Open', dueDate: '2026-02-28' },
    ],
  });

  const [contactDocuments, setContactDocuments] = useState<Record<number, { id: number; name: string; type: string; date: string; size: string }[]>>({
    1: [
      { id: 1, name: 'NDA_Siemens_2025.pdf', type: 'Contract', date: '2025-11-10', size: '2.4 MB' },
      { id: 2, name: 'Pricing_Catalog_Q1_2026.xlsx', type: 'Price List', date: '2026-01-05', size: '1.1 MB' },
    ],
  });

  const [contactMinutes, setContactMinutes] = useState<Record<number, { id: number; title: string; date: string; summary: string }[]>>({
    1: [
      { id: 1, title: 'Q1 Strategy Alignment', date: '2026-02-10', summary: 'Discussed volume projections for Q3 and Q4. Agreed to review pricing in May.' },
      { id: 2, title: 'Annual Review 2025', date: '2025-12-15', summary: 'Reviewed performance metrics. Quality targets met. Discussed new product lines.' },
    ],
  });

  const [newContact, setNewContact] = useState({
    name: '', company: '', role: '', email: '', phone: '', status: 'Lead',
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const contactToAdd = { ...newContact, id: contacts.length + 1, lastContact: 'Just now' };
    setContacts([contactToAdd, ...contacts]);
    setIsModalOpen(false);
    setNewContact({ name: '', company: '', role: '', email: '', phone: '', status: 'Lead' });
  };

  const getMockOrgChart = (_company: string, contactName: string) => [
    { role: 'CEO / Managing Director', name: 'Alex Johnson' },
    { role: 'VP of Procurement', name: 'Sarah Williams' },
    { role: 'Director of Supply Chain', name: 'Michael Brown' },
    { role: 'Your Contact', name: contactName, highlight: true },
    { role: 'Junior Buyer', name: 'Emily Davis' },
  ];

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    const actionToAdd = {
      id: Date.now(),
      task: newAction.task,
      status: 'Open',
      dueDate: newAction.dueDate || new Date().toISOString().split('T')[0],
    };
    setContactActions(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), actionToAdd],
    }));
    setIsAddActionModalOpen(false);
    setNewAction({ task: '', dueDate: '' });
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    const documentToAdd = {
      id: Date.now(),
      name: newDocument.name,
      type: newDocument.type,
      date: new Date().toISOString().split('T')[0],
      size: '1.0 MB',
    };
    setContactDocuments(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), documentToAdd],
    }));
    setIsAddDocumentModalOpen(false);
    setNewDocument({ name: '', type: 'Contract' });
  };

  const handleAddMinute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    const minuteToAdd = {
      id: Date.now(),
      title: newMinute.title,
      date: newMinute.date || new Date().toISOString().split('T')[0],
      summary: newMinute.summary,
    };
    setContactMinutes(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), minuteToAdd],
    }));
    setIsAddMinuteModalOpen(false);
    setNewMinute({ title: '', date: '', summary: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contacts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your customers and leads.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0097b2] text-white rounded-lg text-sm font-medium hover:bg-[#005b7f] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <Filter className="w-4 h-4" />
              Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company & Role</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-900">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {contact.company}
                      </span>
                      <span className="text-slate-500 text-xs mt-0.5">{contact.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {contact.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {contact.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      contact.status === 'Active' && 'bg-emerald-100 text-emerald-800',
                      contact.status === 'Lead' && 'bg-blue-100 text-blue-800',
                      contact.status === 'Inactive' && 'bg-slate-100 text-slate-800',
                    )}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{contact.lastContact}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); alert('More options coming soon!'); }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <div>
            Showing <span className="font-medium">{filteredContacts.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-medium">{filteredContacts.length}</span> of{' '}
            <span className="font-medium">{contacts.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Add Contact Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Contact</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input required type="text" value={newContact.company} onChange={e => setNewContact({ ...newContact, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Volvo Cars" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input required type="text" value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Buyer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="jane@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={newContact.status} onChange={e => setNewContact({ ...newContact, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Contact Details Modal ─── */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0097b2]/10 flex items-center justify-center text-[#0097b2] font-bold text-lg">
                  {selectedContact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedContact.name}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {selectedContact.company} • {selectedContact.role}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto">
              {(['org', 'actions', 'documents', 'minutes'] as const).map((tab) => {
                const icons = { org: Users, actions: CheckSquare, documents: FileText, minutes: Calendar };
                const labels = { org: 'Org Chart', actions: 'Actions', documents: 'Documents', minutes: 'Meeting Minutes' };
                const Icon = icons[tab];
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 whitespace-nowrap',
                      activeTab === tab ? 'border-[#0097b2] text-[#0097b2]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
                    )}>
                    <Icon className="w-4 h-4" />{labels[tab]}
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {activeTab === 'org' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                    {selectedContact.company} Structure
                  </h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {getMockOrgChart(selectedContact.company, selectedContact.name).map((node, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[29px] top-3 w-6 h-0.5 bg-slate-200"></div>
                        <div className={cn('p-4 rounded-lg border shadow-sm', node.highlight ? 'bg-[#0097b2]/5 border-[#0097b2]/20' : 'bg-white border-slate-200')}>
                          <p className={cn('text-sm font-bold', node.highlight ? 'text-[#005b7f]' : 'text-slate-900')}>{node.name}</p>
                          <p className={cn('text-xs mt-1', node.highlight ? 'text-[#0097b2]' : 'text-slate-500')}>{node.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Action Items</h3>
                    <button onClick={() => setIsAddActionModalOpen(true)} className="text-sm text-[#0097b2] font-medium hover:text-[#005b7f]">+ Add Action</button>
                  </div>
                  <div className="space-y-3">
                    {(contactActions[selectedContact.id] || []).map(action => (
                      <div key={action.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{action.task}</p>
                          <p className="text-xs text-slate-500 mt-1">Due: {action.dueDate}</p>
                        </div>
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          action.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                          {action.status}
                        </span>
                      </div>
                    ))}
                    {(!contactActions[selectedContact.id] || contactActions[selectedContact.id].length === 0) && (
                      <div className="text-center py-8 text-slate-500 text-sm">No actions connected to this contact.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Documents</h3>
                    <button onClick={() => setIsAddDocumentModalOpen(true)} className="text-sm text-[#0097b2] font-medium hover:text-[#005b7f]">+ Add Document</button>
                  </div>
                  <div className="space-y-3">
                    {(contactDocuments[selectedContact.id] || []).map(doc => (
                      <div key={doc.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-4 group cursor-pointer hover:border-[#0097b2]/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-[#0097b2] transition-colors">{doc.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{doc.type} • {doc.size} • Added {doc.date}</p>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); alert('Document downloaded!'); }}
                          className="p-2 text-slate-400 hover:text-[#0097b2] hover:bg-[#0097b2]/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!contactDocuments[selectedContact.id] || contactDocuments[selectedContact.id].length === 0) && (
                      <div className="text-center py-8 text-slate-500 text-sm">No documents connected to this contact.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'minutes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Meeting Minutes</h3>
                    <button onClick={() => setIsAddMinuteModalOpen(true)} className="text-sm text-[#0097b2] font-medium hover:text-[#005b7f]">+ Add Minutes</button>
                  </div>
                  <div className="space-y-3">
                    {(contactMinutes[selectedContact.id] || []).map(minute => (
                      <div key={minute.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-[#0097b2]/50 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-[#0097b2] transition-colors">{minute.title}</h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{minute.date}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{minute.summary}</p>
                      </div>
                    ))}
                    {(!contactMinutes[selectedContact.id] || contactMinutes[selectedContact.id].length === 0) && (
                      <div className="text-center py-8 text-slate-500 text-sm">No meeting minutes connected to this contact.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Action Modal ─── */}
      {isAddActionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Action</h2>
              <button onClick={() => setIsAddActionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddAction} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Description</label>
                <input required type="text" value={newAction.task} onChange={e => setNewAction({ ...newAction, task: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Follow up on proposal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" value={newAction.dueDate} onChange={e => setNewAction({ ...newAction, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddActionModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]">Save Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Document Modal — rendered ONCE ─── */}
      {isAddDocumentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Document</h2>
              <button onClick={() => setIsAddDocumentModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddDocument} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label>
                <input required type="text" value={newDocument.name} onChange={e => setNewDocument({ ...newDocument, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. NDA_2026.pdf" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                <select value={newDocument.type} onChange={e => setNewDocument({ ...newDocument, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="Contract">Contract</option>
                  <option value="Price List">Price List</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddDocumentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Minute Modal — rendered ONCE ─── */}
      {isAddMinuteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Meeting Minutes</h2>
              <button onClick={() => setIsAddMinuteModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMinute} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title</label>
                <input required type="text" value={newMinute.title} onChange={e => setNewMinute({ ...newMinute, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Q1 Strategy Alignment" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={newMinute.date} onChange={e => setNewMinute({ ...newMinute, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
                <textarea required rows={4} value={newMinute.summary} onChange={e => setNewMinute({ ...newMinute, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Brief summary of the meeting..." />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddMinuteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]">Save Minutes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
