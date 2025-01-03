import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import MarketOverview from '../../components/MarketOverview';
import CompanyProfile from '../../components/CompanyProfile';
import RECTrade from '../../components/RECTrade';
import TransactionHistory from '../../components/TransactionHistory';
import BuyerProfile from '../../components/BuyerProfile';
import BuyHistory from '../../components/BuyerHistory';
import SellHistory from '../../components/SellHistory';
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { AccountCircleOutlined as ProfileIcon } from "@mui/icons-material";
import BuyTokens from '../../components/BuyToken';
import RECListings from '../../components/Listings';
import EnergyBalances from '../../components/EnergyBalances';
import abi from '../../abi.json'

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);

    useEffect(() => {
        connectWallet();
    }, []);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                
                // Replace with your deployed contract address
                const contractAddress = "0x037A372029C066599eAcbb18c7B9e74fe32D9565";
                const contractABI = abi; // Insert your contract ABI here
                
                const contract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );
                
                setAccount(accounts[0]);
                setContract(contract);
                toast.success("Wallet connected successfully");
            } else {
                toast.error("Please install MetaMask");
            }
        } catch (error) {
            toast.error("Error connecting wallet: " + error.message);
        }
    };

    const handleProfile = () => {
        try {
            navigate('/companyprofile');
        } catch (error) {
            console.log("Error");
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
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BuyerProfile contract={contract} account={account} />
                <MarketOverview contract={contract} account={account} />
                <RECTrade contract={contract} account={account} />
                <TransactionHistory contract={contract} account={account} />
                <BuyHistory contract={contract} account={account} />
                <SellHistory contract={contract} account={account} />
                {/* <BuyTokens contract={contract} account={account} /> */}
                <RECListings contract={contract} account={account}/>
                <EnergyBalances contract={contract} account={account} />
            </div>
        </div>
    );
};

export default CompanyDashboard;