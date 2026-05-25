'use client';
import { useState } from 'react';
import TopNav from '../components/layout/TopNav';
import ProjectList from '../components/techops/ProjectList';
import OperationsTab from '../components/operations/OperationsTab';
import AssetTab from '../components/asset/AssetTab';
import ProductTab from '../components/product/ProductTab';
import SalesTab from '../components/sales/SalesTab';

type Tab = 'projects' | 'operations' | 'asset' | 'product' | 'sales';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav activeTab={activeTab} onTabChange={tab => setActiveTab(tab as Tab)} />
      <main className="flex-1 p-6">
        {activeTab === 'projects'   && <ProjectList />}
        {activeTab === 'operations' && <OperationsTab />}
        {activeTab === 'asset'      && <AssetTab />}
        {activeTab === 'product'    && <ProductTab />}
        {activeTab === 'sales'      && <SalesTab />}
      </main>
    </div>
  );
}
