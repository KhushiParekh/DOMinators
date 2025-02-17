import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const RECListings = ({ contract, account }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showListDialog, setShowListDialog] = useState(false);
  const [listFormData, setListFormData] = useState({
    amount: '',
    price: '',
    energyType: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchListings();
    }
  }, [contract]);

  // Close dialogs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dialog-content')) {
        setShowListDialog(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const activeListings = await contract.getActiveListings();
      
      // Format each listing from the contract
      const formattedListings = activeListings.map(listing => ({
        id: listing.id.toString(),
        seller: listing.seller,
        amount: ethers.utils.formatUnits(listing.amount, 18),
        price: ethers.utils.formatUnits(listing.price, 18),
        energyType: listing.energyType,
        active: listing.active
      })).filter(listing => listing.active); // Only show active listings
      
      setListings(formattedListings);
      setError('');
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleListTokens = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const amountInWei = ethers.utils.parseUnits(listFormData.amount, 18);
      const priceInWei = ethers.utils.parseUnits(listFormData.price, 18);

      const approveTx = await contract.approve(contract.address, amountInWei);
      await approveTx.wait();

      const tx = await contract.listTokens(
        amountInWei,
        priceInWei,
        listFormData.energyType
      );
      await tx.wait();
      await fetchListings();
      setShowListDialog(false);
      setListFormData({ amount: '', price: '', energyType: '' });
    } catch (error) {
      console.error("List error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const Dialog = ({ show, title, children }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="dialog-content bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-4 py-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between space-x-4 mb-6">
        <h1 className="text-2xl font-bold ml-2 pt-2">Listings</h1>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowListDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            List Token
          </button>
        </div>
      </div>

      <Dialog show={showListDialog} title="List Tokens">
        <form onSubmit={handleListTokens} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              className="w-full p-2 border rounded"
              value={listFormData.amount}
              onChange={(e) => setListFormData({...listFormData, amount: e.target.value})}
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              className="w-full p-2 border rounded"
              value={listFormData.price}
              onChange={(e) => setListFormData({...listFormData, price: e.target.value})}
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Energy Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={listFormData.energyType}
              onChange={(e) => setListFormData({...listFormData, energyType: e.target.value})}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'List Tokens'}
          </button>
        </form>
      </Dialog>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center p-4 text-gray-600">
          No active listings found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-50 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Seller</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount (RECs)</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price (ETH)</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Energy Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{listing.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {`${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{listing.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{listing.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{listing.energyType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RECListings;