import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import { AlertProvider } from './context/AlertContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { LiveMapPage } from './pages/LiveMapPage';
import { AiDetectionPage } from './pages/AiDetectionPage';
import { HazardManagementPage } from './pages/HazardManagementPage';
import { V2VCommunicationPage } from './pages/V2VCommunicationPage';
import { VehicleHealthPage } from './pages/VehicleHealthPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SimulationPage } from './pages/SimulationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GetStartedPage } from './pages/GetStartedPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehicleProvider>
          <AlertProvider>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Get Started Onboarding Page */}
              <Route path="/get-started" element={<GetStartedPage />} />

              {/* Dashboard Layout & Nested Sub-routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="map" element={<LiveMapPage />} />
                <Route path="ai-detection" element={<AiDetectionPage />} />
                <Route path="detection" element={<AiDetectionPage />} />
                <Route path="hazards" element={<HazardManagementPage />} />
                <Route path="v2v-alerts" element={<V2VCommunicationPage />} />
                <Route path="vehicle-health" element={<VehicleHealthPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="simulation" element={<SimulationPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AlertProvider>
        </VehicleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
