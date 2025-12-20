import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { QueryProvider } from '@/contexts/QueryClientProvider';
import { LogOverlay } from '@/utils/debug/LogOverlay';
import { Toaster } from 'sonner';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import { useState, useEffect } from 'react';
import { UPGRADE_EVENT } from '@/api/client/axios.client';
import { TopLoader } from '@/components/shadui/TopLoader';

export default function App() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const handleUpgradeTrigger = () => setShowUpgradeModal(true);
    window.addEventListener(UPGRADE_EVENT, handleUpgradeTrigger);
    return () => window.removeEventListener(UPGRADE_EVENT, handleUpgradeTrigger);
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Outlet />
            <LogOverlay />
            <Toaster />
            <TopLoader />
            <UpgradeModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              featureName="This pro feature"
            />
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
