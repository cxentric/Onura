import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
// Add your imports here
import LoginRegister from "pages/login-register";
import MessagingChat from "pages/messaging-chat";
import DashboardFeed from "pages/dashboard-feed";
import ProfileManagement from "pages/profile-management";
import ComposePublishingTools from "pages/compose-publishing-tools";
import ThemeCustomizationSettings from "pages/theme-customization-settings";
import CloudFilePicker from "pages/cloud-file-picker";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Define your routes here */}
      <Route path="/" element={<DashboardFeed />} />
      <Route path="/login-register" element={<LoginRegister />} />
      <Route path="/messaging-chat" element={<MessagingChat />} />
      <Route path="/dashboard-feed" element={<DashboardFeed />} />
      <Route path="/profile-management" element={<ProfileManagement />} />
      <Route path="/compose-publishing-tools" element={<ComposePublishingTools />} />
      <Route path="/theme-customization-settings" element={<ThemeCustomizationSettings />} />
      <Route path="/cloud-file-picker" element={<CloudFilePicker />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;