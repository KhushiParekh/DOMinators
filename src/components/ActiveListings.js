import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

<<<<<<< HEAD
const ActiveListings = ({ contract }) => {
=======
const TokenModal = ({ show, title, children, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const BurnTokenModal = ({ show, onClose, formData, setFormData, onSubmit, isProcessing }) => {
  return (
    <TokenModal show={show} title="Burn Tokens" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            disabled={isProcessing}
            placeholder="Enter amount to burn"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Energy Type
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.energyType}
            onChange={(e) => setFormData({ ...formData, energyType: e.target.value })}
            disabled={isProcessing}
            placeholder="Enter energy type"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Burn Tokens'}
        </button>
      </form>
    </TokenModal>
  );
};

const ListTokenModal = ({ show, onClose, formData, setFormData, onSubmit, isProcessing }) => {
  return (
    <TokenModal show={show} title="List Tokens" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            disabled={isProcessing}
            placeholder="Enter amount to list"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (ETH)
          </label>
          <input
            type="number"
            step="0.000000000000000001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            disabled={isProcessing}
            placeholder="Enter price in ETH"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Energy Type
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.energyType}
            onChange={(e) => setFormData({ ...formData, energyType: e.target.value })}
            disabled={isProcessing}
            placeholder="Enter energy type"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'List Tokens'}
        </button>
      </form>
    </TokenModal>
  );
};

const ActiveListings = ({ contract, account }) => {
>>>>>>> e584e0dd1502925876da1749f089f3803272567d
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

<<<<<<< HEAD
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
=======
  return (
    <div className="w-full px-4 py-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between space-x-4 mb-6">
        <h1 className="text-2xl font-bold ml-2 pt-2">Listings</h1>
        <div className="flex justify-end space-x-4">
>>>>>>> e584e0dd1502925876da1749f089f3803272567d
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

<<<<<<< HEAD
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
=======
      <BurnTokenModal 
        show={showBurnDialog}
        onClose={() => setShowBurnDialog(false)}
        formData={burnFormData}
        setFormData={setBurnFormData}
        onSubmit={handleBurnTokens}
        isProcessing={isProcessing}
      />

      <ListTokenModal
        show={showListDialog}
        onClose={() => setShowListDialog(false)}
        formData={listFormData}
        setFormData={setListFormData}
        onSubmit={handleListTokens}
        isProcessing={isProcessing}
      />
>>>>>>> e584e0dd1502925876da1749f089f3803272567d

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
