import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Target,
  Users,
  Award,
  TrendingUp,
  Star,
  Mail,
  Phone,
  User,
  MapPin,
  Check,
} from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

const ConsumerProfile = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [userDetails, setUserDetails] = useState(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [consumers, setConsumers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "challenges", label: "Challenges" },
    { id: "achievements", label: "Achievements" },
  ];

  const achievements = [
    {
      title: "Green Pioneer",
      description: "Early adopter of renewable energy",
      points: 100,
      icon: "🌱",
      type: "badge"
    },
    {
      title: "Energy Champion",
      description: "Generated 1000+ kWh of clean energy",
      points: 250,
      icon: "⚡",
      type: "badge"
    },
    {
      title: "Sustainability Leader",
      description: "Influenced 10+ consumers to join",
      points: 500,
      icon: "👑",
      type: "badge"
    },
    {
      title: "Green Energy Expert",
      description: "Completed all basic challenges",
      points: 300,
      icon: "📜",
      type: "certificate"
    },
    {
      title: "Community Leader",
      description: "Helped 5+ new members",
      points: 200,
      icon: "🤝",
      type: "badge"
    }
  ];

  useEffect(() => {
    fetchUserData();
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Consumers"));
      const fetchedConsumers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConsumers(fetchedConsumers);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    }
  };

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "Consumers", user.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
            setBio(userDoc.data().about || "");
          } else {
            toast.error("User data not found");
          }
        } catch (error) {
          toast.error("Error loading user data");
        }
      } else {
        window.location.href = "/login";
      }
    });
  };

  const handleRedeemPoints = async (achievement) => {
    if (!userDetails || userDetails.greenPoints < achievement.points) {
      toast.error("Insufficient points!");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Consumers", user.uid);
        
        await updateDoc(userRef, {
          greenPoints: userDetails.greenPoints - achievement.points,
          achievements: arrayUnion({
            ...achievement,
            redeemedAt: new Date().toISOString()
          })
        });

        setUserDetails(prev => ({
          ...prev,
          greenPoints: prev.greenPoints - achievement.points,
          achievements: [...(prev.achievements || []), {
            ...achievement,
            redeemedAt: new Date().toISOString()
          }]
        }));

        toast.success("Achievement redeemed successfully!");
        setIsRedeemModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to redeem achievement");
    } finally {
      setIsLoading(false);
    }
  };

  const RedeemModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Redeem Points</h3>
          <button 
            onClick={() => setIsRedeemModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <div className="text-lg text-gray-600">Available Points:</div>
          <div className="text-3xl font-bold text-green-600">
            {userDetails?.greenPoints || 0}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.title} 
              className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <div className="text-green-600 font-medium">{achievement.points} points</div>
                </div>
              </div>
              <button
                onClick={() => handleRedeemPoints(achievement)}
                disabled={isLoading || userDetails?.greenPoints < achievement.points}
                className={`px-4 py-2 rounded-lg ${
                  userDetails?.greenPoints >= achievement.points
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Redeeming..." : "Redeem"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => {
    const sortedConsumers = [...consumers].sort((a, b) => b.greenPoints - a.greenPoints);
    
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h4 className="text-lg text-black/80 flex font-semibold">
            Top Green Point Earners
          </h4>
        </div>
        <div className="p-4 flex items-center justify-between border-b font-semibold text-gray-600">
          <div className="flex items-center space-x-16">
            <span>Rank</span>
            <span>Consumer Name</span>
          </div>
          <span>Green Points</span>
        </div>
        <div className="divide-y">
          {sortedConsumers.map((consumer, index) => (
            <div
              key={consumer.id}
              className={`p-4 text-gray-800 flex items-center justify-between hover:bg-gray-100 ${
                consumer.id === auth.currentUser?.uid ? "bg-green-50" : ""
              }`}
            >
              <div className="flex items-center space-x-20">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < 3 ? "bg-yellow-100" : "bg-gray-100"
                }`}>
                  {index < 3 ? (
                    <Trophy className={`w-4 h-4 ${
                      index === 0 ? "text-yellow-600" :
                      index === 1 ? "text-gray-600" :
                      "text-orange-600"
                    }`} />
                  ) : (
                    <span className="text-gray-600">{index + 1}</span>
                  )}
                </div>
                <span className={`font-medium ${
                  consumer.id === auth.currentUser?.uid ? "text-green-600" : ""
                }`}>
                  {consumer.name}
                </span>
              </div>
              <span className="font-semibold">{consumer.greenPoints}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {userDetails?.achievements?.map((achievement, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl shadow-md text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <div className="text-2xl">{achievement.icon}</div>
          </div>
          <h5 className="font-semibold mb-2">{achievement.title}</h5>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Earned on {new Date(achievement.redeemedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );

  const renderChallenges = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <Target className="w-8 h-8 text-green-600" />
          <h3 className="text-xl font-semibold">Active Challenges</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">30 Days of Green Energy</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-sm text-gray-600">22 days remaining</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Community Outreach</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-green-600 h-2 rounded-full w-1/2"></div>
            </div>
            <p className="text-sm text-gray-600">5/10 referrals completed</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <Star className="w-8 h-8 text-yellow-500" />
          <h3 className="text-xl font-semibold">Available Challenges</h3>
        </div>
        <div className="space-y-4">
          {[
            {
              title: "Energy Efficiency Master",
              description: "Reduce energy consumption by 20%",
              reward: "500 points"
            },
            {
              title: "Solar Champion",
              description: "Install solar panels",
              reward: "1000 points"
            }
          ].map((challenge, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-1">{challenge.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">
                  Reward: {challenge.reward}
                </span>
                <button className="px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Start Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Consumer Profile</h2>
        </div>

        <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-white/40 via-white/60 to-white/40 rounded-2xl shadow-lg border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-green-100/30 to-purple-100/30 opacity-50" />
          
          <div className="relative p-8 flex flex-col md:flex-row gap-8">
            {/* Left Column */}
            <div className="w-full md:w-3/12 space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/50 shadow-sm bg-white">
                <User className="w-full h-full p-8 text-gray-400" />
                </div>
              </div>

              <div className="space-y-4 bg-white/80 rounded-xl p-6">
                <div className="space-y-3">
                  {[
                    { icon: Mail, value: userDetails?.email },
                    { icon: Phone, value: userDetails?.phone || "Not provided" },
                    { icon: MapPin, value: userDetails?.address || "Not provided" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors">
                      <item.icon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-6">
                <button
                  onClick={() => setIsRedeemModalOpen(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Redeem Points
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                  {userDetails?.name}
                </h1>
                
                <div className="relative group">
                  {isEditingBio ? (
                    <div className="relative">
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full p-2 border rounded-lg text-md text-gray-700 min-h-[100px]"
                        placeholder="Write something about yourself..."
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => setIsEditingBio(false)}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const userRef = doc(db, "Consumers", auth.currentUser.uid);
                              await updateDoc(userRef, { about: bio });
                              setIsEditingBio(false);
                              toast.success("Bio updated successfully!");
                            } catch (error) {
                              toast.error("Failed to update bio");
                            }
                          }}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingBio(true)}
                      className="cursor-pointer group"
                    >
                      <p className="text-md text-gray-800 mb-2">
                        {bio || "Click to add a bio"}
                      </p>
                      <span className="text-sm text-blue-600 opacity-0 group-hover:opacity-100">
                        Edit bio
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      title: "Green Points",
                      value: userDetails?.greenPoints || 0,
                      icon: Star,
                      color: "text-yellow-600",
                      bgColor: "bg-yellow-100"
                    },
                    {
                      title: "Total Energy Saved",
                      value: `${userDetails?.energySaved || 0} kWh`,
                      icon: TrendingUp,
                      color: "text-green-600",
                      bgColor: "bg-green-100"
                    },
                    {
                      title: "Achievements",
                      value: userDetails?.achievements?.length || 0,
                      icon: Award,
                      color: "text-purple-600",
                      bgColor: "bg-purple-100"
                    }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/80 p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{stat.title}</p>
                          <p className="text-lg font-semibold">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 rounded-xl overflow-hidden">
                <div className="border-b">
                  <div className="flex">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "text-green-600 border-b-2 border-green-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "leaderboard" && renderLeaderboard()}
                  {activeTab === "achievements" && renderAchievements()}
                  {activeTab === "challenges" && renderChallenges()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isRedeemModalOpen && <RedeemModal />}
    </div>
  );
};

export default ConsumerProfile;