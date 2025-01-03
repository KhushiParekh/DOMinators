import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PriceChart from '../../components/PriceChart';
import RECBalance from '../../components/RECBalance';
import AddEnergy from '../../components/AddEnergy';
import TransferToken from '../../components/TransferTokens';
import BurnToken from '../../components/BurnToken';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { AccountCircleOutlined as ProfileIcon } from '@mui/icons-material';
import abi from '../../abi.json';
import TokenListings from '../../components/Listings';
import ProducerManagement from '../../components/AddProducer';
import EnergyBalances from '../../components/EnergyBalances';
import {  IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';


const CONTRACT_ADDRESS = "0x037A372029C066599eAcbb18c7B9e74fe32D9565"; // Replace with your deployed contract address


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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Producer Dashboard</h1>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RECBalance contract={contract} account={account} />
                <PriceChart />
                {account && (
                    <>
                        <AddEnergy contract={contract} account={account} />
                        <TransferToken contract={contract}  />
                        <BurnToken contract={contract} account={account} />
                    </>
                )}
                <TokenListings contract={contract} account={account} />
                <ProducerManagement contract={contract} account={account} />
                <EnergyBalances contract={contract} account={account} />
            </div>
        </div>
    );
};

export default ProducerDashboard;
// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import AddEnergy from '../../components/AddEnergy';
// import TransferToken from '../../components/TransferTokens';
// import BurnToken from '../../components/BurnToken';
// import { useNavigate } from 'react-router-dom';
// import { auth } from '../firebase';
// import { toast } from 'react-toastify';
// import { AccountCircleOutlined as ProfileIcon } from '@mui/icons-material';
// import abi from '../../abi.json';

// const CONTRACT_ADDRESS = "0xcBCC21F602A17a67b4c205a5FFD8b5f803E99Ca0";

// const ProducerDashboard = () => {
//     const navigate = useNavigate();
//     const [account, setAccount] = useState('');
//     const [provider, setProvider] = useState(null);
//     const [contract, setContract] = useState(null);

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

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold">Producer Dashboard</h1>
//                 <div className="flex items-center gap-4">
//                     {!account ? (
//                         <button
//                             onClick={connectWallet}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                         >
//                             Connect Wallet
//                         </button>
//                     ) : (
//                         <span className="text-gray-600">
//                             {account.slice(0, 6)}...{account.slice(-4)}
//                         </span>
//                     )}
//                     <ProfileIcon 
//                         onClick={() => navigate('/producerprofile')} 
//                         className="text-green-700 cursor-pointer"
//                     />
//                 </div>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {account && (
//                     <>
//                         <AddEnergy contract={contract} account={account} />
//                         <TransferToken contract={contract} account={account} />
//                         <BurnToken contract={contract} account={account} />
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };
