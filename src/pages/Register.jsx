import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Building2, User, Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const [gst, setGst] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        let collectionName = "";
        let userData = {
          email: user.email,
          name: name,
        };

        switch (userType) {
          case "energyProducer":
            collectionName = "EnergyProducers";
            userData = {
              ...userData,
              gst: gst,
              creditScore: null,
              address: address,
              recBalances: [],
            };
            break;
          case "company":
            collectionName = "Companies";
            userData = {
              ...userData,
              gst: gst,
              address: address,
              recBalances: [],
              creditScore: null,
              achievements: [],
            };
            break;
          case "consumer":
            collectionName = "Consumers";
            userData = {
              ...userData,
              greenPoint: 0,
              achievements: [],
              events: [],
              isProducer: false,
            };
            break;
          default:
            throw new Error("Invalid user type selected");
        }

        await setDoc(doc(db, "UserTypes", user.uid), {
          type: userType,
          email: user.email
        });

        await setDoc(doc(db, collectionName, user.uid), userData);
        
        toast.success("Registration successful!", {
          position: "top-center",
          autoClose: 2000,
        });

        // Wait for toast to be shown before navigating
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Create Account</h2>

        {/* User Type Toggle */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { type: 'energyProducer', icon: Building2, label: 'Producer' },
            { type: 'company', icon: User, label: 'Company' },
            { type: 'consumer', icon: Users, label: 'Consumer' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg"
              placeholder="Create password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Conditional rendering for additional fields */}
          {(userType === "energyProducer" || userType === "company") && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">GST Number</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter GST number"
                  onChange={(e) => setGst(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter address"
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-green-600 text-white rounded-lg transition-colors ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already registered?{' '}
            <a href="/login" className="text-green-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;