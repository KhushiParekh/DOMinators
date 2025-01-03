import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const RECListings = ({ contract, walletAddress }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupedListings, setGroupedListings] = useState({});

  useEffect(() => {
    fetchListings();
  }, [contract]);

  const fetchListings = async () => {
    try {
      const activeListings = await contract.getActiveListings();
      setListings(activeListings);
      const grouped = activeListings.reduce((acc, listing) => {
        if (!acc[listing.energyType]) {
          acc[listing.energyType] = [];
        }
        acc[listing.energyType].push(listing);
        return acc;
      }, {});
      setGroupedListings(grouped);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch listings');
      setLoading(false);
    }
  };

  const buyTokens = async (energyType, totalAmount) => {
    try {
      setBuyLoading(true);
      const tx = await contract.buyTokensByEnergyType(energyType, totalAmount);
      await tx.wait();
      await fetchListings();
      setBuyLoading(false);
    } catch (err) {
      setError('Failed to buy tokens');
      setBuyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {Object.entries(groupedListings).map(([energyType, typeListings]) => {
        const totalAvailable = typeListings.reduce((sum, listing) => 
          sum + Number(ethers.utils.formatEther(listing.amount)), 0
        );
        
        return (
          <div key={energyType} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{energyType}</h3>
                <span className="text-sm text-gray-600">
                  Total Available: {totalAvailable.toFixed(2)*1000000000000000000} RECs
                </span>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-600">
                  <div>Seller</div>
                  <div>Amount</div>
                  <div>Price</div>
                  <div></div>
                </div>
                
                {typeListings.map((listing) => (
                  <div key={listing.id.toString()} 
                       className="grid grid-cols-4 gap-4 items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="text-sm truncate">
                      {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </div>
                    <div>
                      {ethers.utils.formatEther(listing.amount)*1000000000000000000} RECs
                    </div>
                    <div>
                      {ethers.utils.formatEther(listing.price)*1000000000000000000} ETH
                    </div>
                    <button
                      onClick={() => buyTokens(energyType, listing.amount)}
                      disabled={buyLoading || listing.seller === walletAddress}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white
                        ${buyLoading || listing.seller === walletAddress 
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                        }`}
                    >
                      {buyLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </div>
                      ) : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RECListings;