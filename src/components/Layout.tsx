import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  Search, 
  Bell, 
  Menu,
  X,
  ChevronDown,
  Network,
  ClipboardList,
  FileText,
  Calendar,
  FileBarChart,
  LogOut,
  User,
  KanbanSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { initialContacts, initialDealsData, initialCompanies } from '../lib/mockData';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Contacts', id: 'contacts', icon: Users },
  { name: 'Organization', id: 'organization', icon: Network },
  { name: 'Deals', id: 'deals', icon: Briefcase },
  { name: 'Pipeline', id: 'pipeline', icon: KanbanSquare },
  { name: 'Action Plan', id: 'action-plan', icon: ClipboardList },
  { name: 'Meeting Minutes', id: 'meeting-minutes', icon: FileText },
  { name: 'Visits Calendar', id: 'calendar', icon: Calendar },
  { name: 'Reports', id: 'reports', icon: FileBarChart },
  { name: 'Settings', id: 'settings', icon: Settings },
];

const mockNotifications = [
  { id: 1, title: 'New Deal Assigned', message: 'You have been assigned to Stator Core Q3 Supply.', time: '10m ago', unread: true },
  { id: 2, title: 'Action Item Overdue', message: 'Submit quality audit documentation is overdue.', time: '1h ago', unread: true },
  { id: 3, title: 'Meeting Reminder', title2: 'Quarterly Review with Siemens AG in 30 mins.', time: '2h ago', unread: false },
];

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global Search Logic
  const filteredResults = () => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    
    const contacts = initialContacts.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)).map(c => ({ ...c, type: 'Contact', icon: Users, tab: 'contacts' }));
    const deals = initialDealsData.filter(d => d.title.toLowerCase().includes(q) || d.company.toLowerCase().includes(q)).map(d => ({ ...d, name: d.title, type: 'Deal', icon: Briefcase, tab: 'deals' }));
    const companies = initialCompanies.filter(c => c.name.toLowerCase().includes(q)).map(c => ({ ...c, type: 'Company', icon: Network, tab: 'organization' }));
    const pages = navigation.filter(n => n.name.toLowerCase().includes(q)).map(n => ({ ...n, type: 'Page', tab: n.id }));

    return [...pages, ...contacts, ...deals, ...companies].slice(0, 8);
  };

  const handleSearchResultClick = (tab: string) => {
    setActiveTab(tab);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#002b3d] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 bg-[#001f2b] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0097b2] rounded flex items-center justify-center font-bold text-white">
              HL
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">Hidria Lamtec</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Menu
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#0097b2] text-white" 
                      : "text-slate-300 hover:bg-[#003b5c] hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 bg-[#001f2b] shrink-0 border-t border-[#003b5c]">
          <div className="flex items-center gap-3">
            <img 
              src="https://picsum.photos/seed/user/100/100" 
              alt="User avatar" 
              className="w-10 h-10 rounded-full border border-[#003b5c]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Jane Doe</p>
              <p className="text-xs text-slate-400 truncate">Sales Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="pl-9 pr-4 py-2 w-64 rounded-md border border-slate-300 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between"
              >
                <span>Search customers, deals...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <button 
                      onClick={() => alert('All notifications marked as read')}
                      className="text-xs text-blue-600 font-medium hover:text-blue-700"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map(notif => (
                      <div key={notif.id} className={cn("p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors", notif.unread ? "bg-blue-50/50" : "")}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm font-medium", notif.unread ? "text-slate-900" : "text-slate-700")}>{notif.title}</h4>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{notif.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{notif.message || notif.title2}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100">
                    <button 
                      onClick={() => alert('View all notifications coming soon!')}
                      className="text-sm text-slate-600 font-medium hover:text-slate-900"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="hidden sm:block">Jane Doe</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">Jane Doe</p>
                    <p className="text-xs text-slate-500 truncate">jane.doe@hidria.com</p>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </button>
                  </div>
                  <div className="p-1 border-t border-slate-100">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-slate-900/50 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-200">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, deals, pages..." 
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 text-lg placeholder:text-slate-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-2">
              {searchQuery ? (
                filteredResults().length > 0 ? (
                  <div className="space-y-1">
                    {filteredResults().map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchResultClick(result.tab)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <result.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{result.name}</p>
                          <p className="text-xs text-slate-500 truncate">{result.type}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )
              ) : (
                <div className="py-8 px-4 text-center text-sm text-slate-500">
                  <p>Start typing to search across the CRM.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">Customers</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">Deals</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">Pages</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Navigate with</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono shadow-sm">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono shadow-sm">↓</kbd>
              </div>
              <div className="flex items-center gap-2">
                <span>Select with</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono shadow-sm">Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
