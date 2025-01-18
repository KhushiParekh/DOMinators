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
import AdminManagement from '../../components/AddProducer';
import EnergyBalances from '../../components/EnergyBalances';
import ActiveListings from '../../components/ActiveListings';
import ReclaimVerification from '../../components/Reclaimverification';
import ListTokensForm from '../../components/ListTokens';
import { List } from 'lucide-react';
import ProducerSales from '../../components/ProducerSales';
import img from '../../assets/wind.png';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import RECChatbot from '../../components/AiChatBot';
import { MessageSquare } from 'lucide-react';
import CombinedEnergyVerifier from '../../components/CombinedEnergyVerifier';

const CONTRACT_ADDRESS = "0xb513E1bfCD84DA7885d739ddd3eB16005AD85671"; // Replace with your deployed contract address

const ProducerDashboard = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showPredictDialog, setShowPredictDialog] = useState(false);
    const [formData, setFormData] = useState({
        location: '',
        area: '',
        unit: '1'
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

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
            <div className="flex justify-between items-center mb-6 py-4 px-6 bg-gray-900 shadow-sm z-11 w-screen absolute top-0 right-0">
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
                        <span className="text-sm text-gray-400">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                    )}

                    <AdminManagement contract={contract} account={account} />
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                    <ProfileIcon onClick={handleProfile} sx={{ color: "white", "&:hover": { color: "#065f46" } }} />
                    <IconButton sx={{ color: "white", "&:hover": { color: "#065f46" } }}>
                        <LanguageIcon />
                    </IconButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-28">
                <RECBalance contract={contract} account={account} />

                <div className="WEATHER-PREDICT col-span-full lg:col-span-2 flex flex-col items-center justify-center p-2 w-full">
                    <img
                        src={img}
                        alt="Weather Prediction"
                        className="w-full h-64 max-w-md mb-1"
                    />
                    <h2 className="text-2xl font-bold text-gray-800">
                        Discover Your Energy Potential!
                    </h2>
                    <p className="text-gray-600 text-center mb-2">
                        Test your energy production potential based on weather and land area. Optimize your renewable energy plans with ease.
                    </p>
                    <button
                        onClick={() => setShowPredictDialog(true)}
                        className="bg-green-500 text-white px-6 py-3 mb-7 rounded-md hover:bg-green-600 transition duration-300"
                    >
                        Predict Your Production
                    </button>

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

                <div className="col-span-full">
                    <ActiveListings contract={contract} account={account} />
                </div>

                {account && (
                    <>
                        <TransferToken contract={contract} />
                        <AddEnergy contract={contract} account={account} />
                        <CombinedEnergyVerifier contract={contract} />
                    </>
                )}
            </div>

            <div className="mt-9 relative">
                <ProducerSales contract={contract} account={account} />

                <button
                    onClick={() => setShowChatbot((prev) => !prev)}
                    className="fixed bottom-4 left-4 bg-blue-500 text-white px-2 py-2 rounded-full hover:bg-blue-600 transition duration-300 z-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zm-4 8h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v7a4 4 0 004 4z"
                      />
                    </svg>
                </button>

                {showChatbot && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed bottom-16 left-4 p-1 w-96 h-[610px] bg-white shadow-lg rounded-lg overflow-hidden z-50"
                    >
                        <button
                            onClick={() => setShowChatbot(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <RECChatbot contractAddress={contract} geminiApiKey={'AIzaSyDypXKVdmg7_PTGyFbqCHMEwAMMRmUIAK4'} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProducerDashboard;
