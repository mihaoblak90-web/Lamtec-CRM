import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Clock,
  Euro,
  Download,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { initialDealsData } from '../lib/mockData';

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
  return `€${value}`;
};

// Calculate metrics dynamically
const totalProjectValue = initialDealsData.reduce((sum, deal) => sum + deal.totalProjectValue, 0);
const totalPeakYearSales = initialDealsData.reduce((sum, deal) => sum + deal.peakYearSales, 0);
const totalHidriaInvestment = initialDealsData.reduce((sum, deal) => sum + deal.hidriaInvestment, 0);
const activeDealsCount = initialDealsData.filter(d => d.stage !== 'won').length;

const metrics = [
  { 
    title: 'Total Pipeline Value', 
    value: formatCurrency(totalProjectValue), 
    change: '+12.5%', 
    trend: 'up',
    icon: TrendingUp,
    color: 'text-[#0097b2]',
    bg: 'bg-[#0097b2]/10'
  },
  { 
    title: 'Peak Year Sales', 
    value: formatCurrency(totalPeakYearSales), 
    change: '+8.2%', 
    trend: 'up',
    icon: Euro,
    color: 'text-[#005b7f]',
    bg: 'bg-[#005b7f]/10'
  },
  { 
    title: 'Hidria Investment', 
    value: formatCurrency(totalHidriaInvestment), 
    change: '-2.4%', 
    trend: 'down',
    icon: Briefcase,
    color: 'text-[#4db8cc]',
    bg: 'bg-[#4db8cc]/10'
  },
  { 
    title: 'Active Deals', 
    value: activeDealsCount.toString(), 
    change: '+3', 
    trend: 'up',
    icon: Users,
    color: 'text-[#a6a6a6]',
    bg: 'bg-[#a6a6a6]/10'
  },
];

// Prepare Chart Data
const segmentDataMap = initialDealsData.reduce((acc, deal) => {
  if (!acc[deal.segment]) {
    acc[deal.segment] = { 
      name: deal.segment, 
      'Total Value': 0, 
      'Peak Sales': 0,
      'Open RFQs': 0,
      'Meetings': Math.floor(Math.random() * 15) + 5 // Mock meeting data
    };
  }
  acc[deal.segment]['Total Value'] += deal.totalProjectValue;
  acc[deal.segment]['Peak Sales'] += deal.peakYearSales;
  if (deal.rfqNumber) {
    acc[deal.segment]['Open RFQs'] += 1;
  }
  return acc;
}, {} as Record<string, any>);
const ytdSegmentData = Object.values(segmentDataMap);

const ytdAllData = [{
  name: 'All Segments',
  'Total Value': ytdSegmentData.reduce((sum, d) => sum + d['Total Value'], 0),
  'Peak Sales': ytdSegmentData.reduce((sum, d) => sum + d['Peak Sales'], 0),
  'Open RFQs': ytdSegmentData.reduce((sum, d) => sum + d['Open RFQs'], 0),
  'Meetings': ytdSegmentData.reduce((sum, d) => sum + d['Meetings'], 0),
}];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthlyData = months.map((month, i) => {
  const data: any = { name: month };
  let totalValueAll = 0;
  let peakSalesAll = 0;
  let rfqsAll = 0;
  let meetingsAll = 0;

  ytdSegmentData.forEach(segData => {
    const seg = segData.name;
    const weight = (Math.sin(i / 11 * Math.PI) + 0.5) / 8; 
    
    const val = segData['Total Value'] * weight * (0.8 + Math.random() * 0.4);
    const peak = segData['Peak Sales'] * weight * (0.8 + Math.random() * 0.4);
    const rfqs = Math.round(segData['Open RFQs'] * weight * 2);
    const meetings = Math.round(segData['Meetings'] * weight * 2);

    data[`${seg} Total Value`] = val;
    data[`${seg} Peak Sales`] = peak;
    data[`${seg} Open RFQs`] = rfqs;
    data[`${seg} Meetings`] = meetings;

    totalValueAll += val;
    peakSalesAll += peak;
    rfqsAll += rfqs;
    meetingsAll += meetings;
  });

  data['Total Value'] = totalValueAll;
  data['Peak Sales'] = peakSalesAll;
  data['Open RFQs'] = rfqsAll;
  data['Meetings'] = meetingsAll;

  return data;
});

const stageDataMap = initialDealsData.reduce((acc, deal) => {
  const stageName = deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1);
  if (!acc[stageName]) {
    acc[stageName] = { name: stageName, value: 0 };
  }
  acc[stageName].value += 1;
  return acc;
}, {} as Record<string, any>);
const stageData = Object.values(stageDataMap);
const PIE_COLORS = ['#005b7f', '#0097b2', '#4db8cc', '#99d6e5', '#a6a6a6', '#cccccc'];

const recentActivities = [
  { id: 1, user: 'Sarah Jenkins', action: 'updated RFQ for', target: 'Bosch Prototype', time: '2 hours ago', amount: '€45k' },
  { id: 2, user: 'Mike Ross', action: 'added investment data to', target: 'EV Motor Laminations', time: '4 hours ago' },
  { id: 3, user: 'Jane Doe', action: 'created new deal', target: 'Stator Core Q3 Supply', time: '5 hours ago' },
  { id: 4, user: 'John Smith', action: 'scheduled offer review for', target: 'New HVAC Motor Cores', time: '1 day ago' },
  { id: 5, user: 'Sarah Jenkins', action: 'moved deal to Negotiation', target: 'Stator Core Q3 Supply', time: '2 days ago' },
  { id: 6, user: 'Mike Ross', action: 'closed deal', target: 'Annual Contract Renewal', time: '3 days ago', amount: '€85k' },
];

type ChartMetric = 'financials' | 'rfqs' | 'meetings';
type Timeframe = 'ytd' | 'monthly';
type ViewMode = 'all' | 'segmented';

export function Dashboard() {
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('financials');
  const [timeframe, setTimeframe] = useState<Timeframe>('ytd');
  const [viewMode, setViewMode] = useState<ViewMode>('segmented');
  const chartMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chartMenuRef.current && !chartMenuRef.current.contains(event.target as Node)) {
        setShowChartMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedActivities = showAllActivity ? recentActivities : recentActivities.slice(0, 4);

  const renderChart = () => {
    const data = timeframe === 'ytd' 
      ? (viewMode === 'all' ? ytdAllData : ytdSegmentData)
      : monthlyData;
      
    const isStacked = timeframe === 'monthly' && viewMode === 'segmented';

    if (selectedMetric === 'financials') {
      return (
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCurrency} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 500 }} formatter={(value: number) => [formatCurrency(value), undefined]} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          
          {isStacked ? (
            <>
              <Bar dataKey="Automotive Total Value" stackId="total" fill="#005b7f" name="Automotive Value" />
              <Bar dataKey="Industrial Total Value" stackId="total" fill="#0097b2" name="Industrial Value" />
              <Bar dataKey="E-Mobility Total Value" stackId="total" fill="#4db8cc" name="E-Mobility Value" />
              
              <Bar dataKey="Automotive Peak Sales" stackId="peak" fill="#005b7f" fillOpacity={0.6} name="Automotive Peak" />
              <Bar dataKey="Industrial Peak Sales" stackId="peak" fill="#0097b2" fillOpacity={0.6} name="Industrial Peak" />
              <Bar dataKey="E-Mobility Peak Sales" stackId="peak" fill="#4db8cc" fillOpacity={0.6} name="E-Mobility Peak" />
            </>
          ) : (
            <>
              <Bar dataKey="Total Value" fill="#005b7f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Peak Sales" fill="#0097b2" radius={[4, 4, 0, 0]} />
            </>
          )}
        </BarChart>
      );
    } else if (selectedMetric === 'rfqs') {
      return (
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 500 }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          
          {isStacked ? (
            <>
              <Bar dataKey="Automotive Open RFQs" stackId="rfq" fill="#005b7f" name="Automotive RFQs" />
              <Bar dataKey="Industrial Open RFQs" stackId="rfq" fill="#0097b2" name="Industrial RFQs" />
              <Bar dataKey="E-Mobility Open RFQs" stackId="rfq" fill="#4db8cc" name="E-Mobility RFQs" />
            </>
          ) : (
            <Bar dataKey="Open RFQs" fill="#0097b2" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      );
    } else {
      return (
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#0f172a', fontWeight: 500 }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          
          {isStacked ? (
            <>
              <Bar dataKey="Automotive Meetings" stackId="mtg" fill="#005b7f" name="Automotive Meetings" />
              <Bar dataKey="Industrial Meetings" stackId="mtg" fill="#0097b2" name="Industrial Meetings" />
              <Bar dataKey="E-Mobility Meetings" stackId="mtg" fill="#4db8cc" name="E-Mobility Meetings" />
            </>
          ) : (
            <Bar dataKey="Meetings" fill="#005b7f" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your pipeline and project financials.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('Report exported successfully!')}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.change}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-medium text-slate-500">{metric.title}</h3>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Segment Analysis */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Performance Overview</h2>
              <p className="text-sm text-slate-500">Analyze metrics across segments and time</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as ChartMetric)}
                className="text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8 bg-slate-50"
              >
                <option value="financials">Financials</option>
                <option value="rfqs">Open RFQs</option>
                <option value="meetings">Meetings</option>
              </select>
              
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8 bg-slate-50"
              >
                <option value="ytd">YTD</option>
                <option value="monthly">Monthly</option>
              </select>

              <select 
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8 bg-slate-50"
              >
                <option value="all">All Segments</option>
                <option value="segmented">By Segment</option>
              </select>

              <div className="relative" ref={chartMenuRef}>
                <button 
                  onClick={() => setShowChartMenu(!showChartMenu)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors border border-transparent"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {showChartMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="p-1">
                      <button 
                        onClick={() => {
                          alert('CSV downloaded successfully!');
                          setShowChartMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                        Download CSV
                      </button>
                      <button 
                        onClick={() => {
                          alert('Filter data modal opened');
                          setShowChartMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Filter className="w-4 h-4 text-slate-400" />
                        Filter Data
                      </button>
                      <button 
                        onClick={() => {
                          alert('Data refreshed!');
                          setShowChartMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                        Refresh Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Deals by Stage */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pipeline Stages</h2>
              <p className="text-sm text-slate-500">Distribution of active deals</p>
            </div>
          </div>
          <div className="flex-1 min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                />
                <Legend iconType="circle" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Deal Activity</h2>
            <button 
              onClick={() => alert('View All Activity coming soon!')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {displayedActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white z-10"></div>
                  </div>
                  <div className="ml-12 flex-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                    </p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-emerald-600 mt-0.5">{activity.amount}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {showAllActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
              <h2 className="text-lg font-semibold text-slate-900">All Recent Activity</h2>
              <button 
                onClick={() => setShowAllActivity(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-10 h-10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white z-10"></div>
                    </div>
                    <div className="ml-12 flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                      </p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-emerald-600 mt-0.5">{activity.amount}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
