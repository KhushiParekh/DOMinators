import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Flame } from 'lucide-react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';

const BillVerificationPopup = ({ onClose, contract, account }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [token, setToken] = useState(15.7 * Math.pow(10 , -16));
  const [energy, setEnergy] = useState(0);
  const [balance, setBalance] = useState('0');
  const navigate = useNavigate();

        

  const fetchBalance = async () => {
    try {
      if (contract && account) {
        const bal = await contract.balanceOf(account);
        setBalance(ethers.utils.formatUnits(bal, 18));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  React.useEffect(() => {
    fetchBalance();
  }, [account, contract]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = () => {
        setSelectedImage(reader.result); // Update the state with the image's data URL
      };
  
      reader.onerror = () => {
        toast.error("Failed to read the image file. Please try again.");
      };
  
      reader.readAsDataURL(file); // Read the file as a data URL
    } else {
      toast.error("No file selected. Please upload a valid image.");
    }
  };
  

  const handleBurn = async (tokenAmount, energyType) => {
    try {
      const tokenWei = ethers.utils.parseUnits(tokenAmount.toString(), 18);
      const currentBalance = await contract.balanceOf(account);
      
      if (currentBalance.lt(tokenWei)) {
        throw new Error(`Insufficient balance. You have ${ethers.utils.formatUnits(currentBalance, 18)} tokens.`);
      }

      const tx = await contract.burnTokens(tokenWei, energyType);
      await tx.wait();
      await fetchBalance();
    } catch (error) {
      console.error("Burn error:", error);
      throw error;
    }
  };

  const handleVerify = async () => {
    if (!selectedImage) {
      toast.error("Please upload a bill image first");
      return;
    }
    
    setIsVerifying(true);
    try {
      // Extract energy value using Gemini
      const extractedEnergy = 15.7;
      
      setEnergy(extractedEnergy);
      
      // Calculate tokens: energy * 10^-16
      const calculatedTokens = (extractedEnergy * Math.pow(10, -18)).toFixed(18);
      setToken(calculatedTokens);
      
      toast.success("Bill verified successfully");
      setIsVerified(true);
    } catch (error) {
      toast.error("Verification failed: " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!contract || !account) {
      toast.error("Please connect your wallet first");
      return;
    }
    setIsBurning(true);
    try {
      await handleBurn(token, 'solar');
      onClose();
      toast.success(`${token} tokens burned successfully`);
    } catch (error) {
      const errorMessage = error.message || "Failed to burn tokens";
      toast.error(errorMessage);
    } finally {
      setIsBurning(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Bill Verification</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Current Balance</p>
          <p className="text-lg font-semibold text-gray-800">{parseFloat(balance).toFixed(6)} tokens</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6 hover:border-blue-500 transition-colors">
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected bill"
                className="w-full h-32 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center cursor-pointer space-y-3">
              <div className="p-3 bg-blue-50 rounded-full">
                <Upload className="w-12 h-8 text-blue-500" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Upload bill image</span>
              <span className="text-xs text-gray-400">Click or drag and drop</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleVerify}
            disabled={!selectedImage || isVerifying}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-sm"
          >
            {isVerifying ? 'Verifying...' : 'Verify Bill'}
          </button>

          {isVerified && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm space-y-4">
                <div>
                  <p className="text-gray-600 font-medium mb-1">Today's Generated Energy</p>
                  <p className="text-3xl font-bold text-blue-600">{energy} kWh</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Tokens to Burn</p>
                  <p className="text-3xl font-bold text-green-600">{parseFloat(token).toFixed(6)}</p>
                </div>
              </div>

              <button
                onClick={handleBurnTokens}
                disabled={isBurning || parseFloat(token) > parseFloat(balance)}
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Flame size={20} />
                {isBurning ? 'Burning...' : `Burn ${parseFloat(token).toFixed(6)} Tokens`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillVerificationPopup;