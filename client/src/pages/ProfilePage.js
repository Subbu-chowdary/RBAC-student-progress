// college-portal/client/src/pages/ProfilePage.js
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ProfileCard from "../components/allusers/ProfileCard";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          My Profile
        </h1>
        <ProfileCard />
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
