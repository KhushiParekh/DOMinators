// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';

// const ActiveListings = ({ contract }) => {
//   const [listings, setListings] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (contract) {
//       fetchListings();
//     }
//   }, [contract]);

//   const fetchListings = async () => {
//     try {
//       setLoading(true);
//       const activeListings = await contract.getActiveListings();
      
//       const groupedListings = activeListings.reduce((acc, listing) => {
//         if (!acc[listing.energyType]) {
//           acc[listing.energyType] = [];
//         }
        
//         const formattedListing = {
//           id: listing.id.toString(),
//           seller: listing.seller,
//           amount: ethers.utils.formatUnits(listing.amount, 18),
//           price: ethers.utils.formatUnits(listing.price, 18),
//           energyType: listing.energyType,
//           active: listing.active
//         };
        
//         if (formattedListing.active) {
//           acc[listing.energyType].push(formattedListing);
//         }
        
//         return acc;
//       }, {});

//       setListings(groupedListings);
//     } catch (err) {
//       console.error('Error fetching listings:', err);
//       setError('Failed to fetch listings. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!contract) {
//     return (
//       <div className="text-center p-4 text-gray-600">
//         Please connect your wallet
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-32">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//         {error}
//       </div>
//     );
//   }

//   if (Object.keys(listings).length === 0) {
//     return (
//       <div className="text-center p-4 text-gray-600">
//         No active listings found
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {Object.entries(listings).map(([energyType, typeListings]) => (
//         <div key={energyType} className="bg-white rounded-lg shadow">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900">{energyType} Listings</h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Seller</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount (RECs)</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price (ETH)</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {typeListings.map((listing) => (
//                   <tr key={listing.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-sm text-gray-900">{listing.id}</td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {`${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">{listing.amount}</td>
//                     <td className="px-6 py-4 text-sm text-gray-900">{listing.price}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ActiveListings;

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const RECListings = ({ contract, account }) => {
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBurnDialog, setShowBurnDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [burnFormData, setBurnFormData] = useState({
    amount: '',
    energyType: ''
  });
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
        setShowBurnDialog(false);
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
      const formattedListings = activeListings.reduce((acc, listing) => {
        if (listing.active) {
          const entry = {
            id: listing.id.toString(),
            seller: listing.seller,
            amount: ethers.utils.formatUnits(listing.amount, 18),
            price: ethers.utils.formatUnits(listing.price, 18),
            energyType: listing.energyType
          };
          
          if (!acc[listing.energyType]) {
            acc[listing.energyType] = [];
          }
          acc[listing.energyType].push(entry);
        }
        return acc;
      }, {});
      
      setListings(formattedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings');
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
    } catch (error) {
      console.error("Burn error:", error);
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
    <div className="w-full px-4 py-6 bg-white rounded-lg shadow-md" > 
      <div className="flex justify-between space-x-4 mb-6 ">

        <h1 className='text-2xl font-bold ml-2 pt-2'>Listings</h1>
        <div className="flex justify-end space-x-4">
        {/* <button
          onClick={() => setShowBurnDialog(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Burn Token
        </button> */}
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
              type="number"
              className="w-full p-2 border rounded"
              value={burnFormData.amount}
              onChange={(e) => setBurnFormData({...burnFormData, amount: e.target.value})}
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Energy Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={burnFormData.energyType}
              onChange={(e) => setBurnFormData({...burnFormData, energyType: e.target.value})}
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
      ) : Object.keys(listings).length === 0 ? (
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
      )}
    </div>
  );
};

export default RECListings;

// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';

// const RECListings = ({ contract, walletAddress }) => {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [buyLoading, setBuyLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [groupedListings, setGroupedListings] = useState({});

//   useEffect(() => {
//     fetchListings();
//   }, [contract]);

//   const fetchListings = async () => {
//     try {
//       const activeListings = await contract.getActiveListings();
//       setListings(activeListings);
//       const grouped = activeListings.reduce((acc, listing) => {
//         if (!acc[listing.energyType]) {
//           acc[listing.energyType] = [];
//         }
//         acc[listing.energyType].push(listing);
//         return acc;
//       }, {});
//       setGroupedListings(grouped);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch listings');
//       setLoading(false);
//     }
//   };

//   const buyTokens = async (energyType, totalAmount) => {
//     try {
//       setBuyLoading(true);
//       const tx = await contract.buyTokensByEnergyType(energyType, totalAmount);
//       await tx.wait();
//       await fetchListings();
//       setBuyLoading(false);
//     } catch (err) {
//       setError('Failed to buy tokens');
//       setBuyLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}
      
//       {Object.entries(groupedListings).map(([energyType, typeListings]) => {
//         const totalAvailable = typeListings.reduce((sum, listing) => 
//           sum + Number(ethers.utils.formatEther(listing.amount)), 0
//         );
        
//         return (
//           <div key={energyType} className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold text-gray-900">{energyType}</h3>
//                 <span className="text-sm text-gray-600">
//                   Total Available: {totalAvailable.toFixed(2)*1000000000000000000} RECs
//                 </span>
//               </div>
//             </div>
            
//             <div className="px-6 py-4">
//               <div className="space-y-4">
//                 <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-600">
//                   <div>Seller</div>
//                   <div>Amount</div>
//                   <div>Price</div>
//                   <div></div>
//                 </div>
                
//                 {typeListings.map((listing) => (
//                   <div key={listing.id.toString()} 
//                        className="grid grid-cols-4 gap-4 items-center py-2 border-b border-gray-100 last:border-0">
//                     <div className="text-sm truncate">
//                       {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
//                     </div>
//                     <div>
//                       {ethers.utils.formatEther(listing.amount)*1000000000000000000} RECs
//                     </div>
//                     <div>
//                       {ethers.utils.formatEther(listing.price)*1000000000000000000} ETH
//                     </div>
//                     <button
//                       onClick={() => buyTokens(energyType, listing.amount)}
//                       disabled={buyLoading || listing.seller === walletAddress}
//                       className={`px-4 py-2 rounded-md text-sm font-medium text-white
//                         ${buyLoading || listing.seller === walletAddress 
//                           ? 'bg-gray-400 cursor-not-allowed'
//                           : 'bg-blue-600 hover:bg-blue-700 transition-colors'
//                         }`}
//                     >
//                       {buyLoading ? (
//                         <div className="flex items-center justify-center">
//                           <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                         </div>
//                       ) : 'Buy'}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default RECListings;
// import React, { useState, useEffect, useRef } from 'react';
// import { ethers } from 'ethers';
// import BurnTokens from './BurnToken';  // Make sure this path is correct
// import ListTokens from './ListTokens';  // Make sure this path is correct

// const RECListings = ({ contract, walletAddress }) => {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [buyLoading, setBuyLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [groupedListings, setGroupedListings] = useState({});
//   const [showBurnDialog, setShowBurnDialog] = useState(false);
//   const [showListDialog, setShowListDialog] = useState(false);
//   const dialogRef = useRef();

//   useEffect(() => {
//     fetchListings();
//   }, [contract]);

//   const fetchListings = async () => {
//     try {
//       const activeListings = await contract.getActiveListings();
//       setListings(activeListings);
//       const grouped = activeListings.reduce((acc, listing) => {
//         if (!acc[listing.energyType]) {
//           acc[listing.energyType] = [];
//         }
//         acc[listing.energyType].push(listing);
//         return acc;
//       }, {});
//       setGroupedListings(grouped);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch listings');
//       setLoading(false);
//     }
//   };

//   const buyTokens = async (energyType, totalAmount) => {
//     try {
//       setBuyLoading(true);
//       const tx = await contract.buyTokensByEnergyType(energyType, totalAmount);
//       await tx.wait();
//       await fetchListings();
//       setBuyLoading(false);
//     } catch (err) {
//       setError('Failed to buy tokens');
//       setBuyLoading(false);
//     }
//   };

//   // Close dialog when clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dialogRef.current && !dialogRef.current.contains(event.target)) {
//         setShowBurnDialog(false);
//         setShowListDialog(false);
//       }
//     };
    
//     document.addEventListener('click', handleClickOutside);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       <div className="flex justify-end space-x-4">
//         <button
//           onClick={() => setShowBurnDialog(true)}
//           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//         >
//           Burn Tokens
//         </button>
//         <button
//           onClick={() => setShowListDialog(true)}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           List Tokens
//         </button>
//       </div>

//       {showBurnDialog && (
//         <div ref={dialogRef} className="absolute top-20 right-10 bg-white rounded-lg shadow-md p-6">
//           <BurnTokens contract={contract} />
//         </div>
//       )}
//       {showListDialog && (
//         <div ref={dialogRef} className="absolute top-20 right-10 bg-white rounded-lg shadow-md p-6">
//           <ListTokens contractAddress={contract.address} walletAddress={walletAddress} />
//         </div>
//       )}

//       {Object.entries(groupedListings).map(([energyType, typeListings]) => {
//         const totalAvailable = typeListings.reduce((sum, listing) => 
//           sum + Number(ethers.utils.formatEther(listing.amount)), 0
//         );

//         return (
//           <div key={energyType} className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold text-gray-900">{energyType}</h3>
//                 <span className="text-sm text-gray-600">
//                   Total Available: {totalAvailable.toFixed(2)} RECs
//                 </span>
//               </div>
//             </div>

//             <div className="px-6 py-4">
//               <div className="space-y-4">
//                 <div className="grid grid-cols-5 gap-4 font-medium text-sm text-gray-600">
//                   <div>Seller</div>
//                   <div>Amount</div>
//                   <div>Price</div>
//                   <div>Energy Type</div>
//                   <div></div>
//                 </div>

//                 {typeListings.map((listing) => (
//                   <div key={listing.id.toString()} className="grid grid-cols-5 gap-4 items-center py-2 border-b border-gray-100 last:border-0">
//                     <div className="text-sm truncate">
//                       {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
//                     </div>
//                     <div>
//                       {ethers.utils.formatEther(listing.amount)} RECs
//                     </div>
//                     <div>
//                       {ethers.utils.formatEther(listing.price)} ETH
//                     </div>
//                     <div>{listing.energyType}</div>
//                     <button
//                       onClick={() => buyTokens(energyType, listing.amount)}
//                       disabled={buyLoading || listing.seller === walletAddress}
//                       className={`px-4 py-2 rounded-md text-sm font-medium text-white
//                         ${buyLoading || listing.seller === walletAddress 
//                           ? 'bg-gray-400 cursor-not-allowed'
//                           : 'bg-blue-600 hover:bg-blue-700 transition-colors'
//                         }`}
//                     >
//                       {buyLoading ? (
//                         <div className="flex items-center justify-center">
//                           <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                         </div>
//                       ) : 'Buy'}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default RECListings;
