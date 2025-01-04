import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import MarketOverview from '../../components/MarketOverview';
import CompanyProfile from '../../components/CompanyProfile';
import RECTrade from '../../components/RECTrade';
import TransactionHistory from '../../components/TransactionHistory';
import BuyHistory from '../../components/BuyerHistory';
import SellHistory from '../../components/SellHistory';
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { AccountCircleOutlined as ProfileIcon } from "@mui/icons-material";
import ActiveListings from '../../components/ActiveListings';
import EnergyBalances from '../../components/EnergyBalances';
import BuyTokensByType from '../../components/BuyTokensByType';
import ListTokens from '../../components/ListTokens';
import abi from "../../abi.json";
import SpecializedYieldAnalyzer from '../../components/SpecializedAnalyser';

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

                // Listen for account changes
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Company Dashboard</h1>
                <div className="flex items-center gap-4">
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
                </div>
            </div>

            {account && !buyerStatus.registered && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Register as Buyer</h2>
                    <p className="mb-4 text-gray-600">
                        You need to register as a buyer to participate in REC trading.
                    </p>
                    <button
                        onClick={registerAsBuyer}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Registering...' : 'Register as Buyer'}
                    </button>
                </div>
            )}

            {account && buyerStatus.registered && !buyerStatus.approved && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">
                        Your buyer registration is pending approval. Please wait for admin approval to start trading.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MarketOverview contract={contract} account={account} />
                <RECTrade contract={contract} account={account} />
                <TransactionHistory contract={contract} account={account} />
                <BuyHistory contract={contract} account={account} />
                <SellHistory contract={contract} account={account} />
                <ActiveListings contract={contract} account={account} />
                <EnergyBalances contract={contract} account={account} />
            <BuyTokensByType contractAddress="0xDd0E158E75320cDcf6A87abc60303E96b8a3fFEF" />
                <ActiveListings contract = {contract} account = {account}/>
                <ListTokens contract = {contract} account = {account}/>
                <SpecializedYieldAnalyzer contractAddress = {contract} contractABI= {abi} walletAddress={account} userType ="buyer" />
            </div>
        </div>
    );
};

export default CompanyDashboard;