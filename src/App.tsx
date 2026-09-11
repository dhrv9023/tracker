// ==========================================================================
// FINANCE OS — APPLICATION SHELL
// ==========================================================================

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CashFlowView } from './components/cashflow/CashFlowView';
import { MissionsView } from './components/missions/MissionsView';
import { AssetsView } from './components/assets/AssetsView';
import { AdvisorView } from './components/advisor/AdvisorView';
import { InsightsView } from './components/insights/InsightsView';
import { SettingsView } from './components/settings/SettingsView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AppTutorialModal, isTutorialCompleted } from './components/tutorial/AppTutorialModal';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  TrendingUp,
  Activity,
  ShieldCheck,
  Settings as SettingsIcon,
  BookOpen,
} from 'lucide-react';
import { WalkthroughView } from './components/walkthrough/WalkthroughView';
import { AuthLockGate } from './components/auth/AuthLockGate';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, showOnboardingModal, setShowOnboardingModal, profile, isDemoMode } = useFinance();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const [showTutorial, setShowTutorial] = React.useState<boolean>(() => {
    // Show tutorial on initial load if user has completed onboarding or is in demo mode and hasn't finished tutorial
    return !isTutorialCompleted() && (profile.hasCompletedOnboarding || isDemoMode);
  });

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onEditBaseline={() => setShowOnboardingModal(true)} />;
      case 'cashflow':
        return <CashFlowView />;
      case 'missions':
        return <MissionsView />;
      case 'assets':
        return <AssetsView />;
      case 'insights':
        return <InsightsView />;
      case 'advisor':
        return <AdvisorView />;
      case 'settings':
        return <SettingsView />;
      case 'walkthrough':
        return (
          <WalkthroughView
            onNavigate={(tabId) => setActiveTab(tabId)}
            onOpenTutorial={() => setShowTutorial(true)}
          />
        );
      default:
        return <DashboardView onEditBaseline={() => setShowOnboardingModal(true)} />;
    }
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Command', icon: LayoutDashboard },
    { id: 'cashflow', label: 'Cash Flow', icon: ArrowLeftRight },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'assets', label: 'Assets', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Activity },
    { id: 'advisor', label: 'Advisor', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'walkthrough', label: 'Manual', icon: BookOpen },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', position: 'relative', zIndex: 1, width: '100%' }}>
      {/* Animated Tactical Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
      />

      {/* Main Content Arena (Full Screen Width) */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <TopBar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onEditBaseline={() => setShowOnboardingModal(true)}
          onOpenTutorial={() => setShowTutorial(true)}
        />

        <main style={{ padding: '1.75rem 2.25rem 5rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <div key={activeTab} className="view-enter">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="mobile-bottom-nav">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--red-bright)' : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.62rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'color var(--duration-fast) var(--ease-out)',
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Onboarding & Baseline Setup Modal */}
      {showOnboardingModal && <OnboardingWizard />}

      {/* Guided Operations Tutorial */}
      <AppTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onJumpToTab={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <AuthLockGate>
        <MainAppContent />
      </AuthLockGate>
    </FinanceProvider>
  );
}

export default App;
