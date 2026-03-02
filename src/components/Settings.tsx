import React from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette,
  CreditCard
} from 'lucide-react';

const settingsNav = [
  { name: 'Profile', icon: User, current: true },
  { name: 'Notifications', icon: Bell, current: false },
  { name: 'Security', icon: Lock, current: false },
  { name: 'Preferences', icon: Palette, current: false },
  { name: 'Billing', icon: CreditCard, current: false },
  { name: 'Integrations', icon: Globe, current: false },
];

export function Settings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-4 shrink-0">
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.current ? 'text-blue-700' : 'text-slate-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-8">
          <div className="max-w-xl space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
              <p className="text-sm text-slate-500 mt-1">Update your account's profile information and email address.</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/user/100/100" 
                  alt="User avatar" 
                  className="w-20 h-20 rounded-full border border-slate-200 object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => alert('Change avatar coming soon!')}
                  className="absolute bottom-0 right-0 p-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => alert('Change avatar coming soon!')}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Change Avatar
                </button>
                <button 
                  onClick={() => alert('Avatar removed successfully!')}
                  className="text-sm font-medium text-red-600 hover:text-red-700 text-left px-4 py-2"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    defaultValue="Jane"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    defaultValue="Doe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  defaultValue="jane.doe@hidria.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">Job Title</label>
                <input 
                  type="text" 
                  id="role" 
                  defaultValue="Sales Director"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => alert('Changes cancelled')}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => alert('Settings saved successfully!')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
