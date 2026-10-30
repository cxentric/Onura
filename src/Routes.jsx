import React, { Suspense, lazy, useEffect } from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { accountsEnabled } from "services/auth";
import { openSignIn } from "components/SignInModal";

// Each page is loaded on demand so the first visit downloads only what it needs.
const LoginRegister = lazy(() => import("pages/login-register"));
const MessagingChat = lazy(() => import("pages/messaging-chat"));
const DashboardFeed = lazy(() => import("pages/dashboard-feed"));
const ProfileManagement = lazy(() => import("pages/profile-management"));
const ComposePublishingTools = lazy(() => import("pages/compose-publishing-tools"));
const ThemeCustomizationSettings = lazy(() => import("pages/theme-customization-settings"));
const CloudFilePicker = lazy(() => import("pages/cloud-file-picker"));
const NotFound = lazy(() => import("pages/NotFound"));

// With accounts on, the old sign-in page becomes the feed with the sign-in pop-up open.
const SignInRoute = () => {
  useEffect(() => {
    openSignIn();
  }, []);
  return <Navigate to="/" replace />;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Routes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
    <RouterRoutes>
      {/* Define your routes here */}
      <Route path="/" element={<DashboardFeed />} />
      <Route path="/login-register" element={accountsEnabled ? <SignInRoute /> : <LoginRegister />} />
      <Route path="/messaging-chat" element={<MessagingChat />} />
      <Route path="/dashboard-feed" element={<DashboardFeed />} />
      <Route path="/profile-management" element={<ProfileManagement />} />
      <Route path="/compose-publishing-tools" element={<ComposePublishingTools />} />
      <Route path="/theme-customization-settings" element={<ThemeCustomizationSettings />} />
      <Route path="/cloud-file-picker" element={<CloudFilePicker />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
    </Suspense>
  );
};

export default Routes;