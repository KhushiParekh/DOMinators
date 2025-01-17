import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from "react-toastify";
import { UserCircle, LogOut, Wallet, Loader2 } from 'lucide-react';
import MarketOverview from '../../components/MarketOverview';
import CompanyProfile from '../../components/CompanyProfile';
import RECTrade from '../../components/RECTrade';
import TransactionHistory from '../../components/TransactionHistory';
import BuyHistory from '../../components/BuyerHistory';
import SellHistory from '../../components/SellHistory';
import { auth } from "../firebase";
import Listings from '../../components/Listings';
import EnergyBalances from '../../components/EnergyBalances';
import BuyTokensByType from '../../components/BuyTokensByType';
import ListTokens from '../../components/ListTokens';
import SpecializedYieldAnalyzer from '../../components/SpecializedAnalyser';
import abi from "../../abi.json";
import {  IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { AccountCircleOutlined as ProfileIcon } from '@mui/icons-material';
import RECListings from '../../components/Listings';
import OpenAIAgentButton from '../../components/AiChatBot';
import RECBuyerChatbot from '../../components/AiBuyerChatBot';
const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [buyerStatus, setBuyerStatus] = useState({ registered: false, approved: false });
    const [isLoading, setIsLoading] = useState(false);
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
        connectWallet();
    }, []);

    useEffect(() => {
        if (contract && account) {
            checkBuyerStatus();
        }
    }, [contract, account]);

    const checkBuyerStatus = async () => {
        try {
            const status = await contract.getBuyerInfo(account);
            setBuyerStatus({
                registered: status.registered,
                approved: status.approved
            });
        } catch (error) {
            console.error("Error checking buyer status:", error);
        }
    };

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                
                const contractAddress = "0xb513E1bfCD84DA7885d739ddd3eB16005AD85671";
                const contractABI = abi;
                
                const contract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );
                
                setAccount(accounts[0]);
                setContract(contract);
                toast.success("Wallet connected successfully");

                window.ethereum.on('accountsChanged', (accounts) => {
                    setAccount(accounts[0]);
                });
            } else {
                toast.error("Please install MetaMask");
            }
        } catch (error) {
            toast.error("Error connecting wallet: " + error.message);
        }
    };

    const registerAsBuyer = async () => {
        if (!contract || !account) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsLoading(true);
        try {
            const transaction = await contract.registerBuyer();
            await transaction.wait();
            
            await checkBuyerStatus();
            toast.success("Successfully registered as a buyer!");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.reason || "Error registering as buyer");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfile = () => {
        try {
            navigate('/companyprofile');
        } catch (error) {
            console.log("Error navigating to profile");
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Error logging out: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500/10 to-blue-500/50">
                       <div className="flex justify-between items-center mb-6 py-4 px-6 bg-gray-900 shadow-sm z-11 w-screen absolute top-0 right-0  ">
                <h1 className="text-2xl font-bold text-green-500">Company Dashboard</h1>
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
              className="text-green-500 hover:text-green-600"
            >
              <LanguageIcon />
            </IconButton>
                </div>
            </div>

            {/* Main Content */}
            <main className="pt-24 px-2 sm:px-6 lg:px-2 max-w-7xl flex flex-col mx-auto">
                {/* Registration Status */}
                {account && !buyerStatus.registered && (
                    <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                        <div className="border-b pb-4 mb-4">
                            <h2 className="text-lg font-semibold">Register as Buyer</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                You need to register as a buyer to participate in REC trading.
                            </p>
                            <button
                                onClick={registerAsBuyer}
                                disabled={isLoading}
                                className={`inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Registering...' : 'Register as Buyer'}
                            </button>
                        </div>
                    </div>
                )}

                {account && buyerStatus.registered && !buyerStatus.approved && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-700">
                            Your buyer registration is pending approval. Please wait for admin approval to start trading.
                        </p>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    
                    {/* <div className="bg-white rounded-lg shadow-sm p-6">
                        <EnergyBalances contract={contract} account={account} />
                    </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    <div className="bg-white w-full col-span-full rounded-lg shadow-sm ">
                        <Listings contract={contract} account={account} />
                    </div>
                    {/* <div className="bg-white rounded-lg shadow-sm p-6">
                        <BuyTokensByType contractAddress="0xDd0E158E75320cDcf6A87abc60303E96b8a3fFEF" />
                    </div> */}
                    <div className="bg-white rounded-lg shadow-sm p-6 col-span-full lg:col-span-2">
                        <TransactionHistory contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 pt-5">
                        <RECTrade contract={contract} account={account} />
                    </div>
                    {/* <div className="bg-white rounded-lg shadow-sm p-6">
                        <ListTokens contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <BuyHistory contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <SellHistory contract={contract} account={account} />
                    </div> */}
            
                      
                    
                </div>
                <div className="mt-6 w-[100%]  " >  
                <SpecializedYieldAnalyzer contractAddress={contract} contractABI={abi} walletAddress={account} userType="buyer" />
                </div>
                <RECBuyerChatbot/>
            </main>
        </div>
    );
};

export default CompanyDashboard;