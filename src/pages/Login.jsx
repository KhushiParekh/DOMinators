import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Building2, User, Users } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userType) {
      toast.error("Please select your user type", {
        position: "bottom-center",
      });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      let collectionName = "";
      let navigationPath = "";
      switch (userType) {
        case "energyProducer":
          collectionName = "EnergyProducers";
          navigationPath = "/producerDB";
          break;
        case "company":
          collectionName = "Companies";
          navigationPath = "/companiesDB";
          break;
        case "consumer":
          collectionName = "Consumers";
          navigationPath = "/consumersDB";
          break;
        default:
          throw new Error("Invalid user type");
      }

      const userDoc = await getDoc(doc(db, collectionName, userCredential.user.uid));
      const userTypeDoc = await getDoc(doc(db, "UserTypes", userCredential.user.uid));

      if (userDoc.exists() && userTypeDoc.exists() && userTypeDoc.data().type === userType) {
        toast.success("User logged in Successfully!!", {
          position: "top-center",
        });
        console.log("User logged in Successfully");
        navigate(navigationPath);
      } else {
        await auth.signOut();
        toast.error("Invalid user type or account not found. Please verify your user type.", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Welcome Back</h2>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { type: "energyProducer", icon: Building2, label: "Producer" },
            { type: "company", icon: User, label: "Company" },
            { type: "consumer", icon: Users, label: "Consumer" }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                userType === type 
                  ? 'bg-green-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email address</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-gray-600">
            New user?{" "}
            <a href="/register" className="text-green-600 hover:underline">
              Register Here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;