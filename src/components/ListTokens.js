import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';

const ListTokens = ({ contractAddress, walletAddress }) => {
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [energyType, setEnergyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [decimals, setDecimals] = useState(18);

  const ABI = abi;
  contractAddress = '0xb513E1bfCD84DA7885d739ddd3eB16005AD85671';

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!contractAddress) {
          throw new Error('Contract address is required');
        }

        if (!window.ethereum) {
          throw new Error('MetaMask is not installed');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); 
        const signer = provider.getSigner();
        
        const contractInstance = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );
        
        setContract(contractInstance);

        try {
          const tokenDecimals = await contractInstance.decimals();
          setDecimals(tokenDecimals);
        } catch (err) {
          console.warn('Could not get token decimals, using default 18:', err);
        }

        const userAddress = await signer.getAddress();
        const rawBalance = await contractInstance.balanceOf(userAddress);
        const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);
        setBalance(formattedBalance);
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError(err.message);
      }
    };

    initializeContract();
  }, [contractAddress]);

  // Helper function to validate decimal places
  const validateDecimals = (value) => {
    if (!value) return true;
    const parts = value.split('.');
    return parts.length === 1 || parts[1].length <= decimals;
  };

  // Handler for amount input
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (validateDecimals(value)) {
      setAmount(value);
    }
  };

  // Handler for price input
  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (validateDecimals(value)) {
      setPrice(value);
    }
  };

  const handleListTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      if (!amount || !price || !energyType) {
        throw new Error('Please fill in all fields');
      }

      // Validate decimal places before submission
      if (!validateDecimals(amount) || !validateDecimals(price)) {
        throw new Error(`Maximum ${decimals} decimal places allowed`);
      }

      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const balanceInWei = ethers.utils.parseUnits(balance, decimals);
      
      if (amountInWei.gt(balanceInWei)) {
        throw new Error(`Insufficient balance. You have ${balance} tokens available.`);
      }

      const priceInWei = ethers.utils.parseUnits(price, decimals);

      console.log('Approving tokens...');
      const approveTx = await contract.approve(contractAddress, amountInWei);
      await approveTx.wait();

      const gasEstimate = await contract.estimateGas.listTokens(
        amountInWei,
        priceInWei,
        energyType
      );

      const gasLimit = gasEstimate.mul(120).div(100);

      const tx = await contract.listTokens(
        amountInWei, 
        priceInWei,
        energyType,
        { gasLimit }
      );
      
      await tx.wait();

      setSuccess('Tokens listed successfully!');
      setAmount('');
      setPrice('');
      setEnergyType('');

      const userAddress = await contract.signer.getAddress();
      const newBalance = await contract.balanceOf(userAddress);
      setBalance(ethers.utils.formatUnits(newBalance, decimals));
    } catch (err) {
      console.error('Transaction error:', err);
      const revertReason = err.data?.message || err.message;
      setError(`Transaction failed: ${revertReason}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">List Tokens</h2>
      
      <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        Available Balance: {parseFloat(balance).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimals
        })} tokens
      </div>

      <form onSubmit={handleListTokens} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter amount (up to ${decimals} decimals)`}
            disabled={loading}
            pattern={`^\\d*\\.?\\d{0,${decimals}}$`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="text"
            value={price}
            onChange={handlePriceChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter price (up to ${decimals} decimals)`}
            disabled={loading}
            pattern={`^\\d*\\.?\\d{0,${decimals}}$`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Energy Type
          </label>
          <input
            type="text"
            value={energyType}
            onChange={(e) => setEnergyType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter energy type"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !contract || parseFloat(amount) > parseFloat(balance)}
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            loading || !contract || parseFloat(amount) > parseFloat(balance)
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Listing...' : 'List Tokens'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
    </div>
  );
};

export default ListTokens;