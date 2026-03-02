/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Contacts } from './components/Contacts';
import { OrgChart } from './components/OrgChart';
import { Deals } from './components/Deals';
import { Pipeline } from './components/Pipeline';
import { ActionPlan } from './components/ActionPlan';
import { MeetingMinutes } from './components/MeetingMinutes';
import { CalendarView } from './components/CalendarView';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <Contacts />;
      case 'organization':
        return <OrgChart />;
      case 'deals':
        return <Deals />;
      case 'pipeline':
        return <Pipeline />;
      case 'action-plan':
        return <ActionPlan />;
      case 'meeting-minutes':
        return <MeetingMinutes />;
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
