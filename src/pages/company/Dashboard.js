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
import ActiveListings from '../../components/ActiveListings';
import EnergyBalances from '../../components/EnergyBalances';
import BuyTokensByType from '../../components/BuyTokensByType';
import ListTokens from '../../components/ListTokens';
import abi from "../../abi.json";

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [buyerStatus, setBuyerStatus] = useState({ registered: false, approved: false });
    const [isLoading, setIsLoading] = useState(false);

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
                
                const contractAddress = "0xDd0E158E75320cDcf6A87abc60303E96b8a3fFEF";
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
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-900">Company Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            {!account ? (
                                <button
                                    onClick={connectWallet}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Connect Wallet
                                </button>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                        {account.slice(0, 6)}...{account.slice(-4)}
                                    </span>
                                    <button
                                        onClick={handleProfile}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <UserCircle className="h-5 w-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
                    <div className="bg-white rounded-lg shadow-sm p-6 col-span-full lg:col-span-2">
                        <MarketOverview contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <EnergyBalances contract={contract} account={account} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <RECTrade contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <ActiveListings contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <BuyTokensByType contractAddress="0xDd0E158E75320cDcf6A87abc60303E96b8a3fFEF" />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 col-span-full lg:col-span-2">
                        <TransactionHistory contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <ListTokens contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <BuyHistory contract={contract} account={account} />
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <SellHistory contract={contract} account={account} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyDashboard;