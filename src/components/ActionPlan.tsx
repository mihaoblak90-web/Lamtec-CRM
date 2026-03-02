import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  ChevronDown,
  ChevronRight,
  Send,
  ClipboardList,
  X,
  Mail
} from 'lucide-react';
import { cn } from '../lib/utils';
import { companiesData, projectsData as initialProjectsData, ActionItem, Project } from '../lib/mockData';

export function ActionPlan() {
  const [projects, setProjects] = useState<Project[]>(initialProjectsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('p-1');
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set(['a-1']));
  const [newUpdateText, setNewUpdateText] = useState<Record<string, string>>({});
  
  // Modal & Notification State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  
  const [newAction, setNewAction] = useState({
    task: '',
    owner: '',
    ownerEmail: '',
    dueDate: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low'
  });

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const toggleAction = (actionId: string) => {
    const next = new Set(expandedActions);
    if (next.has(actionId)) {
      next.delete(actionId);
    } else {
      next.add(actionId);
    }
    setExpandedActions(next);
  };

  const handleAddUpdate = (actionId: string) => {
    if (!newUpdateText[actionId]?.trim()) return;
    
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id !== selectedProjectId) return p;
      return {
        ...p,
        actions: p.actions.map(a => {
          if (a.id !== actionId) return a;
          return {
            ...a,
            updates: [
              ...a.updates,
              {
                id: `u-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                text: newUpdateText[actionId],
                author: 'Jane Doe' // Current user
              }
            ]
          };
        })
      };
    }));
    
    setNewUpdateText(prev => ({ ...prev, [actionId]: '' }));
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const actionToAdd: ActionItem = {
      id: `a-${Date.now()}`,
      task: newAction.task,
      owner: newAction.owner,
      dueDate: newAction.dueDate,
      status: 'Open',
      priority: newAction.priority,
      updates: []
    };

    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id !== selectedProjectId) return p;
      return {
        ...p,
        actions: [...p.actions, actionToAdd]
      };
    }));

    // Simulate sending email
    setNotification({
      message: `Action created. Email notification sent to ${newAction.ownerEmail || newAction.owner}`,
      type: 'success'
    });

    setIsAddModalOpen(false);
    setNewAction({ task: '', owner: '', ownerEmail: '', dueDate: '', priority: 'Medium' });
  };

  const simulateDueDateCheck = (action: ActionItem) => {
    if (action.status !== 'Completed') {
      setNotification({
        message: `Due date reminder email sent to ${action.owner}`,
        type: 'info'
      });
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedCompany = selectedProject ? companiesData[selectedProject.companyId] : null;

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border",
            notification.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-blue-50 border-blue-200 text-blue-800"
          )}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Action Plan</h1>
          <p className="text-sm text-slate-500 mt-1">Manage projects, tasks, and weekly updates by customer.</p>
        </div>
        <button 
          onClick={() => alert('New Project modal coming soon!')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Sidebar - Customers & Projects */}
        <div className="w-full lg:w-72 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {Object.values(companiesData).map(company => {
              const companyProjects = projects.filter(p => p.companyId === company.id);
              if (companyProjects.length === 0) return null;

              return (
                <div key={company.id} className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-slate-900">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {company.name}
                  </div>
                  <div className="space-y-0.5 pl-4 border-l-2 border-slate-100 ml-4">
                    {companyProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                          selectedProjectId === project.id 
                            ? "bg-blue-50 text-blue-700 font-medium" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate pr-2">{project.name}</span>
                        <ChevronRight className={cn(
                          "w-4 h-4 shrink-0 transition-transform",
                          selectedProjectId === project.id ? "text-blue-600" : "text-slate-300 opacity-0 group-hover:opacity-100"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content - Action Plan for Selected Project */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm min-h-0 overflow-hidden">
          {selectedProject && selectedCompany ? (
            <>
              <div className="p-6 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Building2 className="w-4 h-4" />
                    {selectedCompany.name}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedProject.name}</h2>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Action
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {selectedProject.actions.map(action => {
                    const isExpanded = expandedActions.has(action.id);
                    return (
                      <div key={action.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-blue-300">
                        <div className="p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <button 
                                onClick={() => alert('Toggle task completion coming soon!')}
                                className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                              >
                                {action.status === 'Completed' ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                )}
                              </button>
                              <div>
                                <h3 className={cn(
                                  "text-base font-semibold mb-2",
                                  action.status === 'Completed' ? "text-slate-500 line-through" : "text-slate-900"
                                )}>
                                  {action.task}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded font-medium uppercase tracking-wider",
                                    action.priority === 'High' ? "bg-red-100 text-red-700" :
                                    action.priority === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                  )}>
                                    {action.priority}
                                  </span>
                                  <span className={cn(
                                    "flex items-center gap-1",
                                    action.status === 'Overdue' ? "text-red-600 font-medium" : ""
                                  )}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {action.dueDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                      {action.owner.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {action.owner}
                                  </span>
                                  {action.status !== 'Completed' && (
                                    <button 
                                      onClick={() => simulateDueDateCheck(action)}
                                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline ml-2"
                                    >
                                      <Mail className="w-3 h-3" />
                                      Send Reminder
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => toggleAction(action.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
                            >
                              <MessageSquare className="w-4 h-4 text-slate-400" />
                              {action.updates.length} Updates
                              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5">
                            <div className="space-y-4 pl-2 sm:pl-4">
                              {action.updates.map((update, idx) => (
                                <div key={update.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-600 before:rounded-full after:absolute after:left-[3px] after:top-4 after:bottom-[-24px] after:w-px after:bg-slate-200 last:after:hidden">
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <span className="font-medium text-slate-700">{update.author}</span>
                                    <span>•</span>
                                    <span>{update.date}</span>
                                  </div>
                                  <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm inline-block">
                                    {update.text}
                                  </p>
                                </div>
                              ))}
                              
                              <div className="relative pl-6 pt-2">
                                <div className="absolute left-0 top-5 w-2 h-2 bg-slate-300 rounded-full" />
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    placeholder="Add a weekly update..."
                                    value={newUpdateText[action.id] || ''}
                                    onChange={(e) => setNewUpdateText(prev => ({ ...prev, [action.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddUpdate(action.id)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                  />
                                  <button 
                                    onClick={() => handleAddUpdate(action.id)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {selectedProject.actions.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                      No actions found for this project.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
              <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900">No Project Selected</p>
              <p className="text-sm mt-1">Select a project from the sidebar to view its action plan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Action Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add New Action</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAction} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Description</label>
                <input 
                  required
                  type="text" 
                  value={newAction.task}
                  onChange={e => setNewAction({...newAction, task: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Send updated pricing"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                  <input 
                    required
                    type="text" 
                    value={newAction.owner}
                    onChange={e => setNewAction({...newAction, owner: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Email</label>
                  <input 
                    required
                    type="email" 
                    value={newAction.ownerEmail}
                    onChange={e => setNewAction({...newAction, ownerEmail: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    required
                    type="date" 
                    value={newAction.dueDate}
                    onChange={e => setNewAction({...newAction, dueDate: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select 
                    value={newAction.priority}
                    onChange={e => setNewAction({...newAction, priority: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 mt-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  An email notification will be automatically sent to the owner when this action is created, and reminders will be sent if it becomes overdue.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
