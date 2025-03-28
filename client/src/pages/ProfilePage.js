// college-portal/client/src/pages/ProfilePage.js
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/allusers/ProfileCard";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar role={user.role} />
      <div className="flex-1 ml-6">
        <Navbar />
        <div className="p-6 pt-20 max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            My Profile
          </h1>
          <ProfileCard />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
