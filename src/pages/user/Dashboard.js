 import React, { useState } from "react";
import {
  Gift,
  Star,
  Camera,
  Users,
  Award,
  TreeDeciduous,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { AccountCircleOutlined as ProfileIcon } from "@mui/icons-material";
import { IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import BillAnalysis from '../../components/BillAnalysis'


const UserDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState({
    name: "Jane Cooper",
    email: "jane@example.com",
    greenPoints: 1500,
    achievements: [
      {
        id: 1,
        title: "Early Adopter",
        description: "Joined the green energy movement",
      },
      {
        id: 2,
        title: "Power Saver",
        description: "Reduced energy consumption by 20%",
      },
    ],
    events: [
      { id: 1, title: "Community Solar Workshop", date: "2024-01-15" },
      { id: 2, title: "Energy Saving Webinar", date: "2024-02-01" },
    ],
  });

  const rewards = [
    {
      title: "10% Off Solar Installation",
      points: 2000,
      category: "Premium",
      expiresIn: "30 days",
    },
    {
      title: "Digital Green Certificate",
      points: 1000,
      category: "Standard",
      expiresIn: "15 days",
    },
    {
      title: "Tree Planting Badge",
      points: 500,
      category: "Achievement",
      expiresIn: "45 days",
    },
    {
      title: "Local Business Discount",
      points: 750,
      category: "Partner",
      expiresIn: "20 days",
    },
  ];

  async function handleProfile() {
    try {
      navigate("/consumerprofile");
    } catch (error) {
      console.log("Error");
    }
  }

  async function handleLogout() {
    try {
      await auth.signOut();
      navigate("/login");
      toast.success("Logged out successfully", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Error logging out: " + error.message, {
        position: "bottom-center",
      });
    }
  }

  // const handleBillUpload = () => {
  //   // In real implementation, this would handle file upload and OCR processing
  //   alert("Bill upload functionality would be implemented here");
  // };

  const handleGridReturnUpload = () => {
    // In real implementation, this would handle grid return bill processing
    alert("Grid return bill upload functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <div className="flex items-center gap-4 mr-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
          <ProfileIcon onClick={handleProfile} className="text-green-700 cursor-pointer" />
           {/* Multilingual Icon */}
           <IconButton
              color="inherit"
             
              aria-controls="language-menu"
              aria-haspopup="true"
              className="hover:text-green-600 "
            >
              <LanguageIcon />
            </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile and Points */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-green-600" />
            <span className="text-xl font-bold">
              {user.greenPoints} Green Points
            </span>
          </div>

          <div className="space-y-4">
            <button
              // onClick={handleBillUpload}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {/* <Camera className="w-5 h-5" />
              <span>Upload Energy Bill</span> */}
              <BillAnalysis/>
            </button>
            <button
              onClick={handleGridReturnUpload}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Grid Return Bill</span>
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Award className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold">Achievements</h2>
          </div>
          <div className="space-y-4">
            {user.achievements.map((achievement) => (
              <div key={achievement.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{achievement.title}</h3>
                <p className="text-gray-600 text-sm">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Gift className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">Available Rewards</h2>
            </div>
          </div>
          <div className="space-y-4">
            {rewards.map((reward, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{reward.title}</h3>
                  <span className="text-green-600 font-medium">
                    {reward.points} pts
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{reward.category}</span>
                  <span>Expires in {reward.expiresIn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TreeDeciduous className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Upcoming Events</h2>
          </div>
          <div className="space-y-4">
            {user.events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-gray-600 text-sm">Date: {event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
