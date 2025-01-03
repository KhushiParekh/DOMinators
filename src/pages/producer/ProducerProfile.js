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
  Building,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc,collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import greencerti from "../../assets/greencerti.webp";
import comapny from "../../assets/comapny.jpg";
import profilebg from "../../assets/profilebg.png";
import '../../App.css'


  
const ProducerProfile = () => {
  const navigate = useNavigate();
  const [energyProducers, setEnergyProducers] = useState([]);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [userDetails, setUserDetails] = useState(null);
  const [userType, setUserType] = useState(null);
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);


  const tabs = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "challenges", label: "Challenges" },
    { id: "achievements", label: "Achievements" }, 
  ];

 
  useEffect(() => {
    // Inject Naker.io script dynamically
    const script = document.createElement("script");
    script.setAttribute("data-who", "💎 Made with naker.io 💎");
    script.src =
      "https://d23jutsnau9x47.cloudfront.net/back/v1.0.9/viewer.js";
    script.setAttribute(
      "data-option",
      JSON.stringify({
        environment: {
          gradient: "radial",
          sensitivity: 0.8,
          colorStart: [59,130,246,1],
          colorEnd: [68,188,112,1],
        },
        particle: {
          life: 5,
          power: 0.045,
          texture:
            "https://res.cloudinary.com/naker-io/image/upload/v1566560053/circle_05.png",
          number: 101,
          colorStart: [116, 129, 92, 0.13],
          colorEnd: [198,188,107,0.94],
          sizeStart: 1.57,
          sizeEnd: 3.14,
          direction1: { x: 100, y: 100, z: 100 },
          direction2: { x: -100, y: -100, z: -100 },
        },
      })
    );
    document.body.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      document.body.removeChild(script);
    };
  }, []);



  useEffect(() => {
    const fetchEnergyProducers = async () => {
      const querySnapshot = await getDocs(collection(db, "EnergyProducers"));
      const fetchedEnergyProducers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEnergyProducers(fetchedEnergyProducers);
    };
    fetchEnergyProducers();
  }, []);

  useEffect(() => {
    fetchuserData();
  }, []);
  



  const mockChallenges = [
    {
      title: "Zero Carbon Month",
      progress: 75,
      deadline: "2024-04-30",
      reward: "500 Green Points",
    },
    {
      title: "Community Impact",
      progress: 40,
      deadline: "2024-05-15",
      reward: "Premium Badge",
    },
  ];

  const fetchuserData = async () => {
    console.log("hi");
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userTypeDoc = await getDoc(doc(db, "UserTypes", user.uid));
          if (userTypeDoc.exists()) {
            const type = userTypeDoc.data().type;
            setUserType(type);
            
            const collectionName =
              type === "company"
                ? "Companies"
                 : type === "energyProducer"
                ? "EnergyProducers"
                : "Consumers";

            const userDoc = await getDoc(doc(db, collectionName, user.uid));
            if (userDoc.exists()) {
              setUserDetails(userDoc.data());
              setBio(userDoc.data().about || "");
            } else {
              toast.error("User data not found");
            }
          }
        } catch (error) {
          toast.error("Error loading user data");
        }
      } else {
        navigate("/login");
      }
    });
  };



  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((achievement) => (
        <div
          key={achievement}
          className="bg-white p-6 rounded-xl shadow-md text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-green-600" />
          </div>
          <h5 className="font-semibold mb-2">Achievement {achievement}</h5>
          <p className="text-gray-600 text-sm">Completed on March 15, 2024</p>
        </div>
      ))}
    </div>
  );


  const renderChallenges = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 b ">
      {mockChallenges.map((challenge, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold">{challenge.title}</h5>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Progress</span>
                <span>{challenge.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 rounded-full h-2"
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Deadline</span>
              <span>{challenge.deadline}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reward</span>
              <span className="text-green-600">{challenge.reward}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );


// Leaderboard Section
const renderLeaderboard = (currentUserEmail) => {
  // Sort companies by creditScore in descending order
  const sortedProducer = [...energyProducers].sort((a, b) => b.creditScore - a.creditScore);

  return (
    <div className="bg-white  rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h4 className="text-lg font-semibold">Top Performers</h4>
      </div>
      {/* Add header for Rank, Company Name, and Score */}
      <div className="p-4 flex items-center justify-between border-b font-semibold text-gray-600">
          <div className=" flex items-center space-x-16">
        <span>Rank</span>
        <span>Company Name</span>
        </div>
        <span>Score</span>
      </div>
      <div className="divide-y">
        {sortedProducer.map((energyProducer, index) => (
          <div
            key={energyProducer.id}
            className={`p-4  text-gray-800 flex items-center justify-between hover:bg-gray-100 ${
              energyProducer.isUser ? "bg-green-50" : ""
            }`}
          >
            <div className="flex items-center space-x-20">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < 3 ? "bg-yellow-100" : "bg-gray-100"
                }`}
              >
                {index < 3 ? (
                  <Trophy
                    className={`w-4 h-4 ${
                      index === 0
                        ? "text-yellow-600"
                        : index === 1
                        ? "text-gray-600"
                        : "text-orange-600"
                    }`}
                  />
                ) : (
                  <span className="text-gray-600">{index + 1}</span>
                )}
              </div>
              <span
                className={`font-medium ${
                  energyProducer.email === currentUserEmail ? "text-green-600" : ""
                }`}
              >
                {energyProducer.name}
              </span>
            </div>
            <span className="font-semibold">{energyProducer.creditScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
};



 
const renderHeader = () => (
    <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-white/40 via-white/60 to-white/40 rounded-2xl shadow-lg border border-white/20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-green-100/30 to-purple-100/30 opacity-50" />
      
      <div className="relative p-8 flex flex-col md:flex-row gap-8">
        {/* Left Column - Profile Image & Contact Info */}
        <div className="w-full md:w-3/12 space-y-6 bg-white rounded-xl ">
          <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/50 shadow-sm">
              {userDetails?.profileImage || (
                <img
                  src={comapny}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
          </div>

          <div className="space-y-4 bg-white/80 rounded-xl p-6 ">
            <div className="space-y-3 mt-5 ml-11">
              {[
                { icon: Mail, value: userDetails?.email },
                { icon: Phone, value: userDetails?.phone || "9876543210" },
                { icon: Building, value: `GST: ${userDetails?.gst}` },
                { icon: MapPin, value: userDetails?.address }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors">
                  <item.icon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex">
              {userDetails?.name?.toUpperCase()}
            </h1>
            
            <div className="relative group text-start">
            {isEditingBio ? (
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2 border rounded-lg text-md text-gray-700 min-h-[100px]"
                    placeholder="Write something about your company..."
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
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
                  <span className="text-sm text-blue-600 opacity-50 group-hover:opacity-100">
                    Edit bio
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[
    { 
      title: "Carbon Credits", 
      value: userDetails?.recBalances?.length || 10, 
      bgColor: "from-green-800 to-emerald-600", 
      textColor: "text-green-600" 
    },
    { 
      title: "Achievements", 
      value: userDetails?.achievements?.length || 6, 
      bgColor: "from-blue-500 to-indigo-600", 
      textColor: "text-blue-800" 
    },
    { 
      title: "Credit Score", 
      value: userDetails?.creditScore || 80, 
      bgColor: "from-purple-500 to-pink-600", 
      textColor: "text-purple-600" 
    }
  ].map((stat, index) => (
    <div key={index} className="relative group">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} rounded-xl opacity-50 group-hover:opacity-20 transition-opacity`} />
      {/* Content */}
      <div className="relative flex p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 hover:transform hover:scale-105 transition-all">
        <div className="text-lg font-medium text-gray-600">{stat.title}:</div>
        <div className={`text-xl ml-3 font-bold ${stat.textColor}`}>{stat.value}</div>
      </div>
    </div>
  ))}
</div>


            {userDetails?.certificate || (
              <div className="p-6 rounded-xl bg-gray-50/50 backdrop-blur-sm border border-white/50">
                <h3 className="text-lg font-semibold text-gray-800 flex mb-4">Producer Certificates</h3>
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700">{userDetails.certificate}</span>
                  <a href={greencerti} className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" target="_blank" rel="noopener noreferrer">
                    View Certificate
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                 <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`px-4 py-2 rounded-lg transition-colors ${
                   activeTab === tab.id
                     ? "bg-green-600 text-white"
                     : "bg-white text-gray-600 hover:bg-gray-50"
                 }`}
               >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="space-y-6">
                {activeTab === "achievements" && renderAchievements()}
                {activeTab === "challenges" && renderChallenges()}
                {activeTab === "leaderboard" && renderLeaderboard()}
              </div>
            </div>
          </div>
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
    <div className="profile-container">
       <div className="content">
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.href = "/producerDB"}
            className="p-2 rounded-xl  backdrop-blur-sm hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Producer Profile</h2>
        </div>

        {renderHeader()}
      </div>
    </div>
    </div>
    </div>
  );
};

export default ProducerProfile;

// import React, { useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   Trophy,
//   Target,
//   Users,
//   Award,
//   TrendingUp,
//   Star,
//   Mail,
//   Phone,
//   Building,
//   MapPin,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "../firebase";
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";
// import { toast } from "react-toastify";
// import greencerti from "../../assets/greencerti.webp";
// import profileimg from "../../assets/comapny.jpg"; // Replace with relevant image
// import profilebg from "../../assets/profilebg.png"; // Replace with relevant image

// const ProducerProfile = () => {
  // const navigate = useNavigate();
  // const [energyProducers, setEnergyProducers] = useState([]);
  // const [activeTab, setActiveTab] = useState("leaderboard");
  // const [userDetails, setUserDetails] = useState(null);
  // const [userType, setUserType] = useState(null);
  // const [bio, setBio] = useState("");
  // const [isEditingBio, setIsEditingBio] = useState(false);

//   const tabs = [
//     { id: "leaderboard", label: "Leaderboard" },
//     { id: "challenges", label: "Challenges" },
//     { id: "achievements", label: "Achievements" },
//   ];

  // useEffect(() => {
  //   const fetchEnergyProducers = async () => {
  //     const querySnapshot = await getDocs(collection(db, "EnergyProducers"));
  //     const fetchedEnergyProducers = querySnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setEnergyProducers(fetchedEnergyProducers);
  //   };
  //   fetchEnergyProducers();
  // }, []);

  // useEffect(() => {
  //   fetchuserData();
  // }, []);

//   const mockChallenges = [
//     {
//       title: "Zero Carbon Month",
//       progress: 75,
//       deadline: "2024-04-30",
//       reward: "500 Green Points",
//     },
//     {
//       title: "Community Impact",
//       progress: 40,
//       deadline: "2024-05-15",
//       reward: "Premium Badge",
//     },
//   ];

  // const fetchuserData = async () => {
  //   console.log("hi");
  //   auth.onAuthStateChanged(async (user) => {
  //     if (user) {
  //       try {
  //         const userTypeDoc = await getDoc(doc(db, "UserTypes", user.uid));
  //         if (userTypeDoc.exists()) {
  //           const type = userTypeDoc.data().type;
  //           setUserType(type);
            
  //           const collectionName =
  //             type === "company"
  //               ? "Companies"
  //                : type === "energyProducer"
  //               ? "EnergyProducers"
  //               : "Consumers";

  //           const userDoc = await getDoc(doc(db, collectionName, user.uid));
  //           if (userDoc.exists()) {
  //             setUserDetails(userDoc.data());
  //             setBio(userDoc.data().about || "");
  //           } else {
  //             toast.error("User data not found");
  //           }
  //         }
  //       } catch (error) {
  //         toast.error("Error loading user data");
  //       }
  //     } else {
  //       navigate("/login");
  //     }
  //   });
  // };

//   const renderHeader = () => (
//     <div className="bg-white backdrop-blur-lg rounded-xl shadow-sm p-6 mb-2">
//       <div className="flex">
//         {/* Left Column - Profile Image & Contact Info */}
//         <div className="w-3/12 py-4 pr-6 mt-4">
//           <div className="mb-6">
//             <div className="w-full aspect-square border-gray border-2 rounded-lg overflow-hidden bg-gray-100">
//               {userDetails?.profileImage || (
//                 <img
//                   src={profileimg} // Replace with relevant image
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               )}
//             </div>
//           </div>

//           <div className="space-y-3 m-12">
//             <div className="flex items-center space-x-2 text-lg">
//               <Mail className="w-4 h-4 text-gray-400" />
//               <span className="text-gray-600">{userDetails?.email}</span>
//             </div>
//             <div className="flex items-center space-x-2 text-lg">
//               <Phone className="w-4 h-4 text-gray-400" />
//               <span className="text-gray-600">
//                 {userDetails?.phone || "9876543210"}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2 text-lg">
//               <Building className="w-4 h-4 text-gray-400" />
//               <span className="text-gray-600">GST: {userDetails?.gst}</span>
//             </div>
//             <div className="flex items-center space-x-2 text-lg">
//               <MapPin className="w-4 h-4 text-gray-400" />
//               <span className="text-gray-600">{userDetails?.address}</span>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Name, Bio, Stats */}
//         <div className="flex-1">
//           <div className="mb-1">
//             <h1 className="text-2xl font-bold mt-7 mb-2">
//               {userDetails?.name.toUpperCase()}
//             </h1>
//             <div className="relative">
//               {isEditingBio ? (
//                 <div className="relative">
//                   <textarea
//                     value={bio}
//                     onChange={(e) => setBio(e.target.value)}
//                     className="w-full p-2 border rounded-lg text-sm text-gray-700 min-h-[100px]"
//                     placeholder="Write something about your energy producer company..."
//                   />
//                   <div className="mt-2 flex justify-end space-x-2">
//                     <button
//                       onClick={() => setIsEditingBio(false)}
//                       className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={() => setIsEditingBio(false)}
//                       className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
//                     >
//                       Save
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div
//                   onClick={() => setIsEditingBio(true)}
//                   className="cursor-pointer group"
//                 >
//                   <p className="text-sm text-gray-600 mb-2">
//                     {bio || "Click to add a bio"}
//                   </p>
//                   <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">
//                     Edit bio
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div className="bg-green-50 p-4 rounded-lg text-center flex items-center justify-center">
//               <div className="text-lg text-gray-600">Carbon Credits: </div>
//               <div className="text-xl font-bold text-green-600 m-3">
//                 {userDetails?.recBalances?.length || 10}
//               </div>
//             </div>
//             <div className="bg-blue-50 p-4 rounded-lg text-center flex items-center justify-center">
//               <div className="text-lg text-gray-600">Achievements: </div>
//               <div className="text-xl font-bold text-blue-800 m-3">
//                 {userDetails?.achievements?.length || 6}
//               </div>
//             </div>
//             <div className="bg-purple-50 p-4 rounded-lg text-center flex items-center justify-center">
//               <div className="text-lg text-gray-600">Credit Score: </div>
//               <div className="text-xl font-bold text-purple-600 m-3">
//                 {userDetails?.creditScore || 80}
//               </div>
//             </div>
//           </div>

//           {/* {userDetails?.certificate || (
//             <div className="p-4 border rounded-lg">
//               <h3 className="text-lg font-semibold mb-2">
//                 Energy Producer Certificates
//               </h3>
//               <div className="flex items-center space-x-2">
//                 <Award className="w-6 h-6 text-green-600" />
//                 <span>{userDetails.certificate}</span>
//                 <a
//                   href={greencerti}
//                   className="text-blue-600 hover:underline"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   View Certificate
//                 </a>
//               </div>
//             </div>
//           )} */}
//           {/* New Section */}
//           <div className="mb-8 w-full mt-8">
//             <div className="flex space-x-2 mb-6">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`px-4 py-2 rounded-lg transition-colors ${
//                     activeTab === tab.id
//                       ? "bg-green-600 text-white"
//                       : "bg-white text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//             <div className="space-y-6">
//             {activeTab === "leaderboard" && renderLeaderboard()}
//               {activeTab === "challenges" && (
//                 <div className="space-y-4">
//                   {mockChallenges.map((challenge, idx) => (
//                     <div
//                       key={idx}
//                       className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-2"
//                     >
//                       <div className="flex justify-between items-center">
//                         <div className="font-semibold">{challenge.title}</div>
//                         <div className="text-xs text-gray-400">
//                           Deadline: {challenge.deadline}
//                         </div>
//                       </div>
//                       <div className="flex justify-between">
//                         <div className="text-xs text-gray-600">
//                           Progress: {challenge.progress}%
//                         </div>
//                         <div className="text-xs text-green-600">
//                           {challenge.reward}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {activeTab === "achievements" && (
//                 <div className="space-y-4">
//                   {userDetails?.achievements?.map((achievement, idx) => (
//                     <div
//                       key={idx}
//                       className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-2"
//                     >
//                       <div className="font-semibold">{achievement.title}</div>
//                       <div className="text-sm text-gray-600">
//                         {achievement.description}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
//   const renderLeaderboard = (currentUserEmail) => {
//     // Sort companies by creditScore in descending order
//     const sortedProducer = [...energyProducers].sort((a, b) => b.creditScore - a.creditScore);

//     return (
//       <div className="bg-white  rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <h4 className="text-lg font-semibold">Top Performers</h4>
//         </div>
//         {/* Add header for Rank, Company Name, and Score */}
//         <div className="p-4 flex items-center justify-between border-b font-semibold text-gray-600">
//             <div className=" flex items-center space-x-16">
//           <span>Rank</span>
//           <span>Company Name</span>
//           </div>
//           <span>Score</span>
//         </div>
//         <div className="divide-y">
//           {sortedProducer.map((energyProducer, index) => (
//             <div
//               key={energyProducer.id}
//               className={`p-4 flex items-center justify-between hover:bg-gray-100 ${
//                 energyProducer.isUser ? "bg-green-50" : ""
//               }`}
//             >
//               <div className="flex items-center space-x-20">
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                     index < 3 ? "bg-yellow-100" : "bg-gray-100"
//                   }`}
//                 >
//                   {index < 3 ? (
//                     <Trophy
//                       className={`w-4 h-4 ${
//                         index === 0
//                           ? "text-yellow-600"
//                           : index === 1
//                           ? "text-gray-600"
//                           : "text-orange-600"
//                       }`}
//                     />
//                   ) : (
//                     <span className="text-gray-600">{index + 1}</span>
//                   )}
//                 </div>
//                 <span
//                   className={`font-medium ${
//                     energyProducer.email === currentUserEmail ? "text-green-600" : ""
//                   }`}
//                 >
//                   {energyProducer.name}
//                 </span>
//               </div>
//               <span className="font-semibold">{energyProducer.creditScore}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
// };


//   return (
//     <div className="profile-container">
//        <div className="content">
//     <div className="relative">
//       <div
//         className="absolute inset-0 bg-cover bg-center"
//         style={{
//           backgroundImage: `url(${profilebg})`, // Replace with relevant image
//           height: "200px",
//         }}
//       ></div>
//       {renderHeader()}
//     </div>
//     </div>
//     </div>
//   );
// };

// export default ProducerProfile;
