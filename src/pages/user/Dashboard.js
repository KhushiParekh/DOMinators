import React, { useState, useEffect } from "react";
import { Gift, Star, Users, Award, TreeDeciduous } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { AccountCircleOutlined as ProfileIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import BillAnalysis from "../../components/BillAnalysis";
import { doc, getDoc } from "firebase/firestore";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    greenPoints: 0,
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

  const [rewards] = useState([
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
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "Consumers", currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const data = userDocSnapshot.data();
            setUserData((prevState) => ({
              ...prevState,
              name: data.name || "Anonymous User",
              email: currentUser.email,
              greenPoints: data.greenPoints || 0,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error loading user data", {
          position: "bottom-center",
        });
      }
    };

    fetchUserData();
  }, []);

  const handleProfile = () => {
    try {
      navigate("/consumerprofile");
    } catch (error) {
      console.log("Error");
    }
  };

  const handleLogout = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/10 to-blue-500/50">
      {/* Navigation */}
      <nav className="bg-gray-900  shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 ">
            <h1 className="text-2xl font-semibold text-green-600 ml-5">
              User Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/community")}
              className="px-4 py-2 bg-green-600/60 text-white text-sm rounded-md font-semibold hover:bg-green-700 transform hover:scale-105 transition-all"
            >
              Join Community
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
            <IconButton
              onClick={handleProfile}
              sx={{ color: "white", "&:hover": { color: "#065f46" } }} 
            >
              <ProfileIcon />
            </IconButton>
            <IconButton sx={{ color: "white", "&:hover": { color: "#065f46" } }}>
              <LanguageIcon />
            </IconButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {userData.name}
                </h2>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
              <span className="text-lg font-semibold text-gray-800">
                {userData.greenPoints} Points
              </span>
            </div>
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {/* Bill Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-center">
          <div className="w-full md:w-1/2">
            <BillAnalysis />
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Achievements Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Achievements
              </h3>
            </div>
            <div className="space-y-3">
              {userData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-medium text-gray-800">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Rewards</h3>
            </div>
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800">
                      {reward.title}
                    </h4>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                      {reward.points} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">{reward.category}</span>
                    <span className="text-gray-500">{reward.expiresIn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <TreeDeciduous className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Events</h3>
            </div>
            <div className="space-y-3">
              {userData.events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                >
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <p className="text-sm text-blue-600 mt-2">{event.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
