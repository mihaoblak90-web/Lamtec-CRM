import React, { useState } from 'react';
import { Mail, Phone, Building2, ChevronRight, ArrowLeft, Plus, X, Folder, FileText, Calendar, Users, FolderPlus } from 'lucide-react';
import { companiesData, type Person, type CompanyOrg } from '../lib/mockData';
import { cn } from '../lib/utils';
import { useAppStore } from '../lib/store';

const OrgNode: React.FC<{ person: Person, isLast?: boolean }> = ({ person, isLast }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className={`flex flex-col xl:flex-row items-center gap-4 p-4 rounded-xl border-2 ${person.highlighted ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-100'} shadow-sm w-full max-w-md relative`}>
        <div className="flex-1 text-center xl:text-left">
          <h3 className="font-semibold text-slate-900">{person.role}</h3>
          <p className="text-sm text-slate-600">{person.name}</p>
        </div>
        <div className={`flex flex-col gap-1.5 text-xs ${person.highlighted ? 'bg-emerald-100/50 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'} border p-2.5 rounded-lg w-full xl:w-auto`}>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <a href={`mailto:${person.email}`} className="hover:underline truncate">{person.email}</a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <a href={`tel:${person.phone}`} className="hover:underline">{person.phone}</a>
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="w-px h-10 bg-slate-400 my-1"></div>
      )}
    </div>
  );
};

export function OrgChart() {
  const [companies, setCompanies] = useState(companiesData);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'org' | 'documents'>('org');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', industry: '' });
  
  // Folders state per company
  const [companyFolders, setCompanyFolders] = useState<Record<string, { id: string, name: string, type: 'contracts' | 'pricelists' | 'minutes' | 'custom' }[]>>({
    'volvo': [
      { id: 'f1', name: 'Contracts', type: 'contracts' },
      { id: 'f2', name: 'Pricelists', type: 'pricelists' },
      { id: 'f3', name: 'Meeting Minutes', type: 'minutes' }
    ],
    'siemens': [
      { id: 'f4', name: 'Contracts', type: 'contracts' },
      { id: 'f5', name: 'Pricelists', type: 'pricelists' },
      { id: 'f6', name: 'Meeting Minutes', type: 'minutes' }
    ]
  });
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: '' });

  // Folder contents state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderContents, setFolderContents] = useState<Record<string, { id: string, name: string, type: 'file' | 'text', content?: string, date: string, size?: string }[]>>({
    'f1': [
      { id: 'doc1', name: 'NDA_2025.pdf', type: 'file', date: '2025-01-15', size: '2.4 MB' }
    ]
  });
  
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState<'file' | 'text'>('file');
  const [newDocument, setNewDocument] = useState({ name: '', content: '' });
  
  const [viewingDocument, setViewingDocument] = useState<{ id: string, name: string, type: 'file' | 'text', content?: string, date: string, size?: string } | null>(null);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newCustomer.name.toLowerCase().replace(/\s+/g, '-');
    
    setCompanies(prev => ({
      ...prev,
      [id]: {
        id,
        name: newCustomer.name,
        industry: newCustomer.industry,
        purchasing: [],
        development: []
      }
    }));
    
    setCompanyFolders(prev => ({
      ...prev,
      [id]: [
        { id: `f-${Date.now()}-1`, name: 'Contracts', type: 'contracts' },
        { id: `f-${Date.now()}-2`, name: 'Pricelists', type: 'pricelists' },
        { id: `f-${Date.now()}-3`, name: 'Meeting Minutes', type: 'minutes' }
      ]
    }));
    
    setIsAddCustomerModalOpen(false);
    setNewCustomer({ name: '', industry: '' });
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    
    const folderToAdd = {
      id: `f-${Date.now()}`,
      name: newFolder.name,
      type: 'custom' as const
    };
    
    setCompanyFolders(prev => ({
      ...prev,
      [selectedCompanyId]: [...(prev[selectedCompanyId] || []), folderToAdd]
    }));
    
    setIsAddFolderModalOpen(false);
    setNewFolder({ name: '' });
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId) return;

    const docToAdd = {
      id: `doc-${Date.now()}`,
      name: newDocument.name,
      type: documentType,
      content: newDocument.content,
      date: new Date().toISOString().split('T')[0],
      size: documentType === 'file' ? '1.2 MB' : undefined
    };

    setFolderContents(prev => ({
      ...prev,
      [selectedFolderId]: [...(prev[selectedFolderId] || []), docToAdd]
    }));

    setIsAddDocumentModalOpen(false);
    setNewDocument({ name: '', content: '' });
  };

  const meetingMinutes = useAppStore(state => state.meetingMinutes);

  if (selectedCompanyId && companies[selectedCompanyId]) {
    const company = companies[selectedCompanyId];
    const folders = companyFolders[selectedCompanyId] || [
      { id: `f-${Date.now()}-1`, name: 'Contracts', type: 'contracts' },
      { id: `f-${Date.now()}-2`, name: 'Pricelists', type: 'pricelists' },
      { id: `f-${Date.now()}-3`, name: 'Meeting Minutes', type: 'minutes' }
    ];
    
    // Get meeting minutes for this company
    const companyMinutes = meetingMinutes.filter(m => m.company === company.name);
    
    // Merge folder contents with meeting minutes if the minutes folder is selected
    const getFolderContents = (folderId: string) => {
      const folder = folders.find(f => f.id === folderId);
      if (folder?.type === 'minutes') {
        return [
          ...(folderContents[folderId] || []),
          ...companyMinutes.map(m => ({
            id: `min-${m.id}`,
            name: m.title,
            type: m.type || 'text',
            content: m.content || m.summary,
            date: m.date,
            size: m.fileSize
          }))
        ];
      }
      return folderContents[folderId] || [];
    };

    const currentFolderContents = selectedFolderId ? getFolderContents(selectedFolderId) : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCompanyId(null)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Organization Details</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('org')}
              className={cn(
                "flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                activeTab === 'org' ? "border-[#0097b2] text-[#0097b2]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <Users className="w-4 h-4" />
              Organizational Chart
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={cn(
                "flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                activeTab === 'documents' ? "border-[#0097b2] text-[#0097b2]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <Folder className="w-4 h-4" />
              Documents & Files
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'org' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Purchasing Organization */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 text-blue-900 px-6 py-3 rounded-lg font-semibold text-lg mb-8 border border-blue-200 shadow-sm w-full max-w-md text-center">
                    Purchasing Organization
                  </div>
                  <div className="w-full flex flex-col items-center">
                    {company.purchasing.map((person, index) => (
                      <OrgNode 
                        key={person.name} 
                        person={person} 
                        isLast={index === company.purchasing.length - 1} 
                      />
                    ))}
                    {company.purchasing.length === 0 && (
                      <p className="text-slate-500 text-sm">No contacts available.</p>
                    )}
                  </div>
                </div>

                {/* Development Organization */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 text-blue-900 px-6 py-3 rounded-lg font-semibold text-lg mb-8 border border-blue-200 shadow-sm w-full max-w-md text-center">
                    Development
                  </div>
                  <div className="w-full flex flex-col items-center">
                    {company.development.map((person, index) => (
                      <OrgNode 
                        key={person.name} 
                        person={person} 
                        isLast={index === company.development.length - 1} 
                      />
                    ))}
                    {company.development.length === 0 && (
                      <p className="text-slate-500 text-sm">No contacts available.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedFolderId ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedFolderId(null)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {folders.find(f => f.id === selectedFolderId)?.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setDocumentType('file');
                        setIsAddDocumentModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Upload File
                    </button>
                    <button 
                      onClick={() => {
                        setDocumentType('text');
                        setIsAddDocumentModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0097b2] text-white rounded-lg text-sm font-medium hover:bg-[#005b7f] transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Text Doc
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {currentFolderContents.map(doc => (
                    <div 
                      key={doc.id} 
                      onClick={() => setViewingDocument(doc)}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#0097b2]/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 group-hover:text-[#0097b2] transition-colors">{doc.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {doc.type === 'file' ? `File • ${doc.size} • ` : 'Text Document • '}
                            Added {doc.date}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('View document coming soon!');
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-[#0097b2] hover:bg-[#0097b2]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View
                      </button>
                    </div>
                  ))}
                  {currentFolderContents.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-900">This folder is empty</p>
                      <p className="text-xs text-slate-500 mt-1">Upload a file or create a text document to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Saved Documents</h2>
                  <button 
                    onClick={() => setIsAddFolderModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <FolderPlus className="w-4 h-4" />
                    New Folder
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0097b2]/50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-[#0097b2]/10 group-hover:text-[#0097b2] transition-colors">
                        {folder.type === 'contracts' ? <FileText className="w-6 h-6" /> :
                         folder.type === 'pricelists' ? <FileText className="w-6 h-6" /> :
                         folder.type === 'minutes' ? <Calendar className="w-6 h-6" /> :
                         <Folder className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 group-hover:text-[#0097b2] transition-colors">{folder.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {folder.type === 'minutes' ? `${getFolderContents(folder.id).length} files` : `${(folderContents[folder.id] || []).length} files`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Folder Modal */}
        {isAddFolderModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Add New Folder</h2>
                <button 
                  onClick={() => setIsAddFolderModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddFolder} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Folder Name</label>
                  <input 
                    required
                    type="text" 
                    value={newFolder.name}
                    onChange={e => setNewFolder({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2]"
                    placeholder="e.g. Technical Drawings"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddFolderModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Document Modal */}
        {isAddDocumentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {documentType === 'file' ? 'Upload Document' : 'Create Text Document'}
                </h2>
                <button 
                  onClick={() => setIsAddDocumentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddDocument} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label>
                  <input 
                    required
                    type="text" 
                    value={newDocument.name}
                    onChange={e => setNewDocument({...newDocument, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2]"
                    placeholder={documentType === 'file' ? 'e.g. Contract_v2.pdf' : 'e.g. Meeting Notes'}
                  />
                </div>

                {documentType === 'file' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-[#0097b2]/50 transition-colors cursor-pointer bg-slate-50">
                      <div className="space-y-1 text-center">
                        <FileText className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-[#0097b2] hover:text-[#005b7f] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0097b2]">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">
                          PDF, Word, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                    <textarea 
                      required
                      rows={8}
                      value={newDocument.content}
                      onChange={e => setNewDocument({...newDocument, content: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] resize-none font-mono"
                      placeholder="Type your document content here..."
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddDocumentModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]"
                  >
                    {documentType === 'file' ? 'Upload' : 'Save Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Document Modal */}
        {viewingDocument && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{viewingDocument.name}</h2>
                  <p className="text-sm text-slate-500">
                    {viewingDocument.type === 'file' ? `File • ${viewingDocument.size} • ` : 'Text Document • '}
                    Added {viewingDocument.date}
                  </p>
                </div>
                <button 
                  onClick={() => setViewingDocument(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                {viewingDocument.type === 'text' ? (
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[300px] whitespace-pre-wrap font-mono text-sm text-slate-700">
                    {viewingDocument.content || 'No content available.'}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-lg border border-slate-200 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">File Preview Not Available</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">
                      This is a mock file upload. In a real application, this would display a preview of the uploaded {viewingDocument.name} file.
                    </p>
                    <button 
                      onClick={() => alert('File downloaded successfully!')}
                      className="px-4 py-2 bg-[#0097b2] text-white rounded-lg text-sm font-medium hover:bg-[#005b7f] transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">Select a company to view its organizational chart.</p>
        </div>
        <button 
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0097b2] text-white rounded-lg text-sm font-medium hover:bg-[#005b7f] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(companies) as [string, CompanyOrg][]).map(([id, company]) => (
          <button
            key={id}
            onClick={() => setSelectedCompanyId(id)}
            className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0097b2]/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#0097b2]/10 group-hover:text-[#0097b2] transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#0097b2] transition-colors">{company.name}</h3>
                <p className="text-sm text-slate-500">{company.industry}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0097b2] transition-colors" />
          </button>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Customer</h2>
              <button 
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input 
                  required
                  type="text" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2]"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <input 
                  required
                  type="text" 
                  value={newCustomer.industry}
                  onChange={e => setNewCustomer({...newCustomer, industry: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2]"
                  placeholder="e.g. Manufacturing"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0097b2] rounded-lg hover:bg-[#005b7f]"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
