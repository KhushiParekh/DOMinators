import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ActiveListings = ({ contract }) => {
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBurnDialog, setShowBurnDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [burnFormData, setBurnFormData] = useState({ amount: '', energyType: '' });
  const [listFormData, setListFormData] = useState({ amount: '', price: '', energyType: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchListings();
    }
  }, [contract]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const activeListings = await contract.getActiveListings();
      const groupedListings = activeListings.reduce((acc, listing) => {
        if (listing.active) {
          const formattedListing = {
            id: listing.id.toString(),
            seller: listing.seller,
            amount: ethers.utils.formatUnits(listing.amount, 18),
            price: ethers.utils.formatUnits(listing.price, 18),
            energyType: listing.energyType,
          };

          if (!acc[listing.energyType]) {
            acc[listing.energyType] = [];
          }
          acc[listing.energyType].push(formattedListing);
        }
        return acc;
      }, {});
      setListings(groupedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const tx = await contract.burnTokens(
        ethers.utils.parseUnits(burnFormData.amount, 18),
        burnFormData.energyType
      );
      await tx.wait();
      await fetchListings();
      setShowBurnDialog(false);
      setBurnFormData({ amount: '', energyType: '' });
    } catch (err) {
      console.error('Burn error:', err);
    } finally {
      setIsProcessing(false);
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

      const tx = await contract.listTokens(amountInWei, priceInWei, listFormData.energyType);
      await tx.wait();
      await fetchListings();
      setShowListDialog(false);
      setListFormData({ amount: '', price: '', energyType: '' });
    } catch (err) {
      console.error('List error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const Dialog = ({ show, title, children }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          {children}
        </div>
      </div>
    );
  };

  const renderListingsTable = () => (
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
          {Object.entries(listings).flatMap(([energyType, typeListings]) =>
            typeListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{listing.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {`${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{listing.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{listing.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{energyType}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full px-4 py-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Listings</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowBurnDialog(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Burn Token
          </button>
          <button
            onClick={() => setShowListDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            List Token
          </button>
        </div>
      </div>

      <Dialog show={showBurnDialog} title="Burn Tokens">
        <form onSubmit={handleBurnTokens} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full p-2 border rounded"
              value={burnFormData.amount}
              onChange={(e) =>
                setBurnFormData((prev) => ({ ...prev, amount: e.target.value.replace(/[^0-9]/g, '') }))
              }
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Energy Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={burnFormData.energyType}
              onChange={(e) => setBurnFormData((prev) => ({ ...prev, energyType: e.target.value }))}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Burn Tokens'}
          </button>
        </form>
      </Dialog>

      <Dialog show={showListDialog} title="List Tokens">
        <form onSubmit={handleListTokens} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full p-2 border rounded"
              value={listFormData.amount}
              onChange={(e) =>
                setListFormData((prev) => ({ ...prev, amount: e.target.value.replace(/[^0-9]/g, '') }))
              }
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full p-2 border rounded"
              value={listFormData.price}
              onChange={(e) =>
                setListFormData((prev) => ({ ...prev, price: e.target.value.replace(/[^0-9]/g, '') }))
              }
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Energy Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={listFormData.energyType}
              onChange={(e) => setListFormData((prev) => ({ ...prev, energyType: e.target.value }))}
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      ) : Object.keys(listings).length === 0 ? (
        <div className="text-center p-4 text-gray-600">No active listings found</div>
      ) : (
        renderListingsTable()
      )}
    </div>
  );
};

export default ActiveListings;
