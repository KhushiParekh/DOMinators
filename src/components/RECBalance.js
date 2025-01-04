import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import AddEnergy from './AddEnergy'; // Ensure correct path

const RECBalance = ({ contract, account }) => {
  const [balances, setBalances] = useState([
    { type: 'Solar', amount: 0, change: '0%', trend: 'up' },
    { type: 'Wind', amount: 0, change: '0%', trend: 'up' },
    { type: 'Biomass', amount: 0, change: '0%', trend: 'up' },
  ]);
  const [showMintDialog, setShowMintDialog] = useState(false); // State for dialog visibility
  const dialogRef = useRef(null); // Reference for the dialog

  // Fetch REC balances from the blockchain
  const fetchBalances = async () => {
    try {
      const updatedBalances = await Promise.all(
        balances.map(async (balance) => {
          const amount = await contract.getBalanceByEnergyType(account, balance.type);
          return {
            ...balance,
            amount: Number(amount),
          };
        })
      );
      setBalances(updatedBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [contract, account]);

  // Close the dialog when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setShowMintDialog(false);
      }
    };

    // Add event listener to detect clicks outside the dialog
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">REC Balance</h3>
        {/* Toggle dialog visibility on click */}
        <CreditCard
          className="text-green-600 cursor-pointer"
          size={24}
          onClick={() => setShowMintDialog(true)}
        />
      </div>
      <div className="space-y-4">
        {balances.map((balance, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">{balance.type} RECs</h4>
              <p className="text-2xl font-bold">{balance.amount.toLocaleString()}</p>
            </div>
            <div
              className={`flex items-center ${
                balance.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {balance.trend === 'up' ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
              <span className="ml-1">{balance.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      {showMintDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div
            ref={dialogRef}
            className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
          >
            <button
              onClick={() => setShowMintDialog(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              &times;
            </button>
            <AddEnergy contract={contract} account={account} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RECBalance;


// import React, { useState, useEffect } from 'react';
// import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

// const RECBalance = ({ contract, account }) => {
//   const [balances, setBalances] = useState([
//     { type: 'Solar', amount: 0, change: '0%', trend: 'up' },
//     { type: 'Wind', amount: 0, change: '0%', trend: 'up' },
//     { type: 'Biomass', amount: 0, change: '0%', trend: 'up' }
//   ]);

//   const fetchBalances = async () => {
//     try {
//       const updatedBalances = await Promise.all(
//         balances.map(async (balance) => {
//           const amount = await contract.getBalanceByEnergyType(account, balance.type);
          
//           return {
//             ...balance,
//             amount: Number(amount)
            
//           };
          
//         })
//       );
      
//       setBalances(updatedBalances);
//     } catch (error) {
//       console.error("Error fetching balances:", error);
//     }
//   };

//   useEffect(() => {
//     if (contract && account) {
//       fetchBalances();
//       const interval = setInterval(fetchBalances, 10000);
//       return () => clearInterval(interval);
//     }
//   }, [contract, account]);

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold">REC Balance</h3>
//         <CreditCard className="text-green-600" size={24} />
//       </div>
//       <div className="space-y-4">
//         {balances.map((balance, i) => (
//           <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <h4 className="font-semibold">{balance.type} RECs</h4>
//               <p className="text-2xl font-bold">{balance.amount.toLocaleString()}</p>
//             </div>
//             <div className={`flex items-center ${
//               balance.trend === 'up' ? 'text-green-600' : 'text-red-600'
//             }`}>
//               {balance.trend === 'up' ? 
//                 <TrendingUp size={20} /> : 
//                 <TrendingDown size={20} />
//               }
//               <span className="ml-1">{balance.change}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RECBalance;