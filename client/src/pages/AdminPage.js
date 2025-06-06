// college-portal/client/src/pages/AdminPage.js
import React from "react";
import { Routes, Route } from "react-router-dom"; // Import routing components
import AdminDashboard from "../components/AdminDashboard";
import Reports from "../components/admin/Reports"; // Import Reports component
import UploadDataModal from "../components/admin/UploadDataModal"; // Import UploadDataModal for consistency
import TrainingSchedule from "../components/admin/TrainingSchedule"; // Import TrainingSchedule component
const AdminPage = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />{" "}
        {/* Default route for /admin */}
        <Route path="reports" element={<Reports />} />{" "}
        {/* New route for /admin/reports */}
        <Route path="training-schedule" element={<TrainingSchedule />} />{" "}
        {/* New route for /admin/training-schedule */}
        <Route path="uploads" element={<UploadDataModal />} />{" "}
        {/* Existing route for /admin/uploads */}
        <Route path="*" element={<AdminDashboard />} />{" "}
        {/* Fallback to AdminDashboard */}
      </Routes>
    </div>
  );
};

export default AdminPage;
