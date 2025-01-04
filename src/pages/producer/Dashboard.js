// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import PriceChart from '../../components/PriceChart';
// import RECBalance from '../../components/RECBalance';
// import AddEnergy from '../../components/AddEnergy';
// import TransferToken from '../../components/TransferTokens';
// import BurnToken from '../../components/BurnToken';
// import { useNavigate } from 'react-router-dom';
// import { auth } from '../firebase';
// import { toast } from 'react-toastify';
// import { AccountCircleOutlined as ProfileIcon } from '@mui/icons-material';
// import abi from '../../abi.json';
// import TokenListings from '../../components/Listings';
// import ProducerManagement from '../../components/AddProducer';
// import EnergyBalances from '../../components/EnergyBalances';
// import {  IconButton } from '@mui/material';
// import LanguageIcon from '@mui/icons-material/Language';

// const CONTRACT_ADDRESS = "0x037A372029C066599eAcbb18c7B9e74fe32D9565"; // Replace with your deployed contract address


// const ProducerDashboard = () => {
//     const navigate = useNavigate();
//     const [account, setAccount] = useState('');
//     const [provider, setProvider] = useState(null);
//     const [contract, setContract] = useState(null);
//     const [anchorEl, setAnchorEl] = useState(null);

//     // Open menu handler
//     const handleMenuOpen = (event) => {
//       setAnchorEl(event.currentTarget);
//     };
  
//     // Close menu handler
//     const handleMenuClose = () => {
//       setAnchorEl(null);
//     };

//     useEffect(() => {
//         initializeWallet();
//         window.ethereum?.on('accountsChanged', handleAccountsChanged);
//         window.ethereum?.on('chainChanged', () => window.location.reload());
        
//         return () => {
//             window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
//             window.ethereum?.removeListener('chainChanged', () => {});
//         };
//     }, []);

//     const initializeWallet = async () => {
//         if (!window.ethereum) {
//             toast.error("MetaMask is not installed!");
//             return;
//         }

//         const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
//         setProvider(web3Provider);

//         const accounts = await web3Provider.listAccounts();
//         if (accounts.length > 0) {
//             setAccount(accounts[0]);
//             const contractInstance = new ethers.Contract(
//                 CONTRACT_ADDRESS,
//                 abi,
//                 web3Provider.getSigner()
//             );
//             setContract(contractInstance);
//         }
//     };

//     const handleAccountsChanged = async (accounts) => {
//         if (accounts.length === 0) {
//             setAccount('');
//             setContract(null);
//         } else {
//             setAccount(accounts[0]);
//             const contractInstance = new ethers.Contract(
//                 CONTRACT_ADDRESS,
//                 abi,
//                 provider.getSigner()
//             );
//             setContract(contractInstance);
//         }
//     };

//     const connectWallet = async () => {
//         try {
//             const accounts = await window.ethereum.request({ 
//                 method: 'eth_requestAccounts' 
//             });
//             setAccount(accounts[0]);
//             const contractInstance = new ethers.Contract(
//                 CONTRACT_ADDRESS,
//                 abi,
//                 provider.getSigner()
//             );
//             setContract(contractInstance);
//             toast.success("Wallet connected successfully!");
//         } catch (error) {
//             toast.error("Failed to connect wallet");
//         }
//     };


//     const handleProfile = () => {
//         navigate('/producerprofile');
//     };

//     const handleLogout = async () => {
//         try {
//             await auth.signOut();
//             navigate("/login");
//             toast.success("Logged out successfully.");
//         } catch (error) {
//             toast.error("Error logging out: " + error.message);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold">Producer Dashboard</h1>
//                 <div className="flex items-center gap-4 mr-6">
//                     {!account ? (
//                         <button
//                             onClick={connectWallet}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                             Connect Wallet
//                         </button>
//                     ) : (
//                         <span className="text-sm text-gray-600">
//                             {account.slice(0, 6)}...{account.slice(-4)}
//                         </span>
//                     )}
//                     <button
//                         onClick={handleLogout}
//                         className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                     >
//                         Logout
//                     </button>
//                     <ProfileIcon onClick={handleProfile} className="text-green-700 cursor-pointer" />
//                     {/* Multilingual Icon */}
//             <IconButton
//               color="inherit"
//               onClick={handleMenuOpen}
//               aria-controls="language-menu"
//               aria-haspopup="true"
//               className="hover:text-green-600"
//             >
//               <LanguageIcon />
//             </IconButton>
//                 </div>
//             </div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <RECBalance contract={contract} account={account} />
//                 <PriceChart />
//                 {account && (
//                     <>
//                         <AddEnergy contract={contract} account={account} />
//                         <TransferToken contract={contract}  />
//                         <BurnToken contract={contract} account={account} />
//                     </>
//                 )}
//                 <TokenListings contract={contract} account={account} />
//                 <ProducerManagement contract={contract} account={account} />
//                 <EnergyBalances contract={contract} account={account} />
//             </div>
//         </div>
//     );
// };

// export default ProducerDashboard;
// // import React, { useState, useEffect } from 'react';
// // import { ethers } from 'ethers';
// // import AddEnergy from '../../components/AddEnergy';
// // import TransferToken from '../../components/TransferTokens';
// // import BurnToken from '../../components/BurnToken';
// // import { useNavigate } from 'react-router-dom';
// // import { auth } from '../firebase';
// // import { toast } from 'react-toastify';
// // import { AccountCircleOutlined as ProfileIcon } from '@mui/icons-material';
// // import abi from '../../abi.json';

// // const CONTRACT_ADDRESS = "0xcBCC21F602A17a67b4c205a5FFD8b5f803E99Ca0";

// // const ProducerDashboard = () => {
// //     const navigate = useNavigate();
// //     const [account, setAccount] = useState('');
// //     const [provider, setProvider] = useState(null);
// //     const [contract, setContract] = useState(null);

// //     useEffect(() => {
// //         initializeWallet();
// //         window.ethereum?.on('accountsChanged', handleAccountsChanged);
// //         window.ethereum?.on('chainChanged', () => window.location.reload());
        
// //         return () => {
// //             window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
// //             window.ethereum?.removeListener('chainChanged', () => {});
// //         };
// //     }, []);

// //     const initializeWallet = async () => {
// //         if (!window.ethereum) {
// //             toast.error("MetaMask is not installed!");
// //             return;
// //         }

// //         const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
// //         setProvider(web3Provider);

// //         const accounts = await web3Provider.listAccounts();
// //         if (accounts.length > 0) {
// //             setAccount(accounts[0]);
// //             const contractInstance = new ethers.Contract(
// //                 CONTRACT_ADDRESS,
// //                 abi,
// //                 web3Provider.getSigner()
// //             );
// //             setContract(contractInstance);
// //         }
// //     };

// //     const handleAccountsChanged = async (accounts) => {
// //         if (accounts.length === 0) {
// //             setAccount('');
// //             setContract(null);
// //         } else {
// //             setAccount(accounts[0]);
// //             const contractInstance = new ethers.Contract(
// //                 CONTRACT_ADDRESS,
// //                 abi,
// //                 provider.getSigner()
// //             );
// //             setContract(contractInstance);
// //         }
// //     };

// //     const connectWallet = async () => {
// //         try {
// //             const accounts = await window.ethereum.request({ 
// //                 method: 'eth_requestAccounts' 
// //             });
// //             setAccount(accounts[0]);
// //             const contractInstance = new ethers.Contract(
// //                 CONTRACT_ADDRESS,
// //                 abi,
// //                 provider.getSigner()
// //             );
// //             setContract(contractInstance);
// //             toast.success("Wallet connected successfully!");
// //         } catch (error) {
// //             toast.error("Failed to connect wallet");
// //         }
// //     };

// //     return (
// //         <div className="min-h-screen bg-gray-50 p-6">
// //             <div className="flex justify-between items-center mb-6">
// //                 <h1 className="text-2xl font-bold">Producer Dashboard</h1>
// //                 <div className="flex items-center gap-4">
// //                     {!account ? (
// //                         <button
// //                             onClick={connectWallet}
// //                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //                         >
// //                             Connect Wallet
// //                         </button>
// //                     ) : (
// //                         <span className="text-gray-600">
// //                             {account.slice(0, 6)}...{account.slice(-4)}
// //                         </span>
// //                     )}
// //                     <ProfileIcon 
// //                         onClick={() => navigate('/producerprofile')} 
// //                         className="text-green-700 cursor-pointer"
// //                     />
// //                 </div>
// //             </div>
// //             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //                 {account && (
// //                     <>
// //                         <AddEnergy contract={contract} account={account} />
// //                         <TransferToken contract={contract} account={account} />
// //                         <BurnToken contract={contract} account={account} />
// //                     </>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import RECBalance from '../../components/RECBalance';
import AddEnergy from '../../components/AddEnergy';
import TransferToken from '../../components/TransferTokens';
import BurnToken from '../../components/BurnToken';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { AccountCircleOutlined as ProfileIcon } from '@mui/icons-material';
import abi from '../../abi.json';
import TokenListings from '../../components/BuyTokensByType';
import ProducerManagement from '../../components/AddProducer';
import EnergyBalances from '../../components/EnergyBalances';
import ActiveListings from '../../components/ActiveListings';
import ReclaimVerification from '../../components/Reclaimverification';
import ListTokensForm from '../../components/ListTokens';
import { List } from 'lucide-react';
import img from '../../assets/wind.png';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {  IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
const CONTRACT_ADDRESS = "0xDd0E158E75320cDcf6A87abc60303E96b8a3fFEF"; // Replace with your deployed contract address

const ProducerDashboard = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    // Open menu handler
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    // Close menu handler
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    useEffect(() => {
        initializeWallet();
        window.ethereum?.on('accountsChanged', handleAccountsChanged);
        window.ethereum?.on('chainChanged', () => window.location.reload());
        
        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', () => {});
        };
    }, []);

    const initializeWallet = async () => {
        if (!window.ethereum) {
            toast.error("MetaMask is not installed!");
            return;
        }

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            const contractInstance = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi,
                web3Provider.getSigner()
            );
            setContract(contractInstance);
        }
    };

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
            setAccount('');
            setContract(null);
        } else {
            setAccount(accounts[0]);
            const contractInstance = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi,
                provider.getSigner()
            );
            setContract(contractInstance);
        }
    };

    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            setAccount(accounts[0]);
            const contractInstance = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi,
                provider.getSigner()
            );
            setContract(contractInstance);
            toast.success("Wallet connected successfully!");
        } catch (error) {
            toast.error("Failed to connect wallet");
        }
    };


    const handleProfile = () => {
        navigate('/producerprofile');
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
            toast.success("Logged out successfully.");
        } catch (error) {
            toast.error("Error logging out: " + error.message);
        }
    };
 const [showPredictDialog,setShowPredictDialog]=useState(false);

 const [formData, setFormData] = useState({
   location: '',
   area: '',
   unit: '1'
 });
 const [prediction, setPrediction] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);
   setError(null);
   
   try {
     const response = await fetch('http://127.0.0.1:5000/predict', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(formData),
     });
     
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     
     const data = await response.json();
     setPrediction({
       solar: data['solar-energy'],
       wind: data['wind-energy']
     });
   } catch (error) {
     console.error('Error:', error);
     setError('Failed to get prediction. Please try again.');
   } finally {
     setLoading(false);
   }
 };

 const handleChange = (e) => {
   setFormData({
     ...formData,
     [e.target.name]: e.target.value,
   });
 };

 const resetForm = () => {
   setPrediction(null);
   setError(null);
   setFormData({
     location: '',
     area: '',
     unit: '1'
   });
 };
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500/10 to-blue-500/50 p-6">
            <div className="flex justify-between items-center mb-6 py-4 px-6 bg-gray-900 shadow-sm z-11 w-screen absolute top-0 right-0  ">
                <h1 className="text-2xl font-bold text-green-500">Producer Dashboard</h1>
                <div className="flex items-center gap-4 mr-6">
                    {!account ? (
                        <button
                            onClick={connectWallet}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <span className="text-sm text-gray-600">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    )}
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
              onClick={handleMenuOpen}
              aria-controls="language-menu"
              aria-haspopup="true"
              className="hover:text-green-600"
            >
              <LanguageIcon />
            </IconButton>
                </div>
            </div>
            
           
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-20">
    {/* RECBalance takes up its specific space */}
    <RECBalance contract={contract} account={account} />
    
    {/* WEATHER-PREDICT takes up the remaining space */}
    <div className="WEATHER-PREDICT col-span-full lg:col-span-2 flex flex-col items-center justify-center  p-2  w-full">
        {/* Image */}
        <img
            src={img}
            alt="Weather Prediction"
            className="w-full h-64 max-w-md mb-1"
        />
        
        {/* Engaging text */}
        <h2 className="text-2xl font-bold text-gray-800 ">
            Discover Your Energy Potential!
        </h2>
        <p className="text-gray-600 text-center mb-2">
            Test your energy production potential based on weather and land area. Optimize your renewable energy plans with ease.
        </p>
        
        {/* Predict Button */}
        <button
            onClick={() => setShowPredictDialog(true)} // Show dialog/modal
            className="bg-green-500 text-white px-6 py-3 mb-7 rounded-md hover:bg-green-600 transition duration-300"
        >
            Predict Your Production
        </button>

        {/* Dialog/Modal */}
        <AnimatePresence>
        {showPredictDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setShowPredictDialog(false);
                resetForm();
              }}
            />
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md relative z-50"
            >
              <button
                onClick={() => {
                    setShowPredictDialog(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6">
                {prediction ? 'Prediction Results' : 'Energy Production Prediction'}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {!prediction ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area
                      </label>
                      <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="1">Hectare</option>
                        <option value="2">Acres</option>
                        <option value="3">Meter-squared</option>
                      </select>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                          <span className="ml-2">Processing...</span>
                        </div>
                      ) : (
                        'Predict'
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-lg font-semibold text-green-800">
                          Solar Energy Production
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {prediction.solar.toLocaleString()} Wh
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-lg font-semibold text-blue-800">
                          Wind Energy Production
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {prediction.wind.toLocaleString()} Wh
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Make Another Prediction
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    
    <div className="col-span-full ">
          <ActiveListings contract={contract} account={account} />
        </div>
                {account && (
                    <>
                        {/* <AddEnergy contract={contract} account={account} /> */}
                        <TransferToken contract={contract}  />
                        {/* <BurnToken contract={contract} account={account} /> */}
                    </>
                )}
                {/* <TokenListings contract={contract} account={account} /> */}
                <ProducerManagement contract={contract} account={account} />
               
                <EnergyBalances contract={contract} account={account} />
                <ReclaimVerification />
                {/* <ListTokensForm contractAddress={contract} walletAddress={account} /> */}
            </div>
        </div>
        
    );
};

export default ProducerDashboard;
