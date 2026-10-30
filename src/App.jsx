import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WidgetProvider } from './contexts/WidgetContext';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import OpenAIWidget from './components/OpenAIWidget/OpenAIWidget';
import { AnnouncementBanner, MaintenanceScreen } from './components/AppStatus';
import SignInModal from './components/SignInModal';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WidgetProvider>
          <MaintenanceScreen>
            <Router>
              <ScrollToTop />
              <AnnouncementBanner />
              <Routes />
              <OpenAIWidget />
              <SignInModal />
            </Router>
          </MaintenanceScreen>
        </WidgetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;