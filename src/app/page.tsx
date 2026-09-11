'use client';

import React, { useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { HeroCountdown } from '@/components/dashboard/HeroCountdown';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { SubjectGrid } from '@/components/dashboard/SubjectGrid';
import { TodayPlannerWidget } from '@/components/dashboard/TodayPlannerWidget';
import { RevisionQueueWidget } from '@/components/dashboard/RevisionQueueWidget';
import { WeaknessPriorityWidget } from '@/components/dashboard/WeaknessPriorityWidget';
import { StudyHeatmap } from '@/components/dashboard/StudyHeatmap';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { OnboardingModal } from '@/components/modals/OnboardingModal';

export default function DashboardPage() {
  const { hydrate, isHydrated } = useGateStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#090c10] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono tracking-wider">INITIALIZING COMMAND CENTER...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100 selection:bg-sky-500/30 selection:text-white">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Hero Countdown & Telemetry */}
          <HeroCountdown />

          {/* Quick Stat Cards */}
          <StatsOverview />

          {/* Action Center: Daily Planner & Spaced Revision side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayPlannerWidget />
            <RevisionQueueWidget />
          </div>

          {/* Activity Heatmap */}
          <StudyHeatmap />

          {/* Subject-Wise Progress Grid */}
          <SubjectGrid />

          {/* Deep Intelligence: Weakness Analyzer & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeaknessPriorityWidget />
            <RecentActivityFeed />
          </div>
        </main>
      </div>

      {/* Mobile Sticky Navigation */}
      <MobileNav />

      {/* First-time setup onboarding */}
      <OnboardingModal />
    </div>
  );
}
