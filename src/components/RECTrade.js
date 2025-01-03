// import React from 'react'
// import { useState } from 'react';

// const RECTrade = () => {
//     const [tradeType, setTradeType] = useState('buy');
    
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm">
//         <h3 className="text-xl font-bold mb-4">Trade RECs</h3>
//         <div className="space-y-4">
//           <div className="flex gap-2 mb-4">
//             <button
//               onClick={() => setTradeType('buy')}
//               className={`flex-1 py-2 rounded-lg ${
//                 tradeType === 'buy' 
//                   ? 'bg-green-600 text-white' 
//                   : 'bg-gray-100'
//               }`}
//             >
//               Buy
//             </button>
//             <button
//               onClick={() => setTradeType('sell')}
//               className={`flex-1 py-2 rounded-lg ${
//                 tradeType === 'sell' 
//                   ? 'bg-green-600 text-white' 
//                   : 'bg-gray-100'
//               }`}
//             >
//               Sell
//             </button>
//           </div>
//           <select className="w-full p-2 border rounded-lg">
//             <option>Solar REC</option>
//             <option>Wind REC</option>
//             <option>Biomass REC</option>
//           </select>
//           <input
//             type="number"
//             placeholder="Amount"
//             className="w-full p-2 border rounded-lg"
//           />
//           <input
//             type="number"
//             placeholder="Price per REC"
//             className="w-full p-2 border rounded-lg"
//           />
//           <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//             Place Order
//           </button>
//         </div>
//       </div>
//     );
//   };

// export default RECTrade;
import React, { useState } from 'react';
import { ShoppingCart, Tag, MapPin, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RECTrade = () => {
  const [tradeType, setTradeType] = useState('buy');

  // Mock data for available RECs
  const availableRECs = [
    {
      id: 1,
      producer: "Green Energy Corp",
      type: "Solar",
      location: "California, USA",
      price: 45.50,
      amount: 1000,
      generationDate: "2024-03-01"
    },
    {
      id: 2,
      producer: "WindPower Ltd",
      type: "Wind",
      location: "Texas, USA",
      price: 38.75,
      amount: 750,
      generationDate: "2024-03-15"
    }
  ];

  // Mock data for owned RECs
  const [ownedRECs, setOwnedRECs] = useState([
    {
      id: 1,
      producer: "Solar Inc",
      type: "Solar",
      location: "Nevada, USA",
      price: 42.30,
      amount: 500,
      purchaseDate: "2024-02-15"
    },
    {
      id: 2,
      producer: "Wind Energy Co",
      type: "Wind",
      location: "Iowa, USA",
      price: 36.50,
      amount: 300,
      purchaseDate: "2024-02-28"
    }
  ]);

  const handleBuy = (rec) => {
    // Implement buy logic
    console.log("Buying REC:", rec);
  };

  const handleSell = (rec, amount) => {
    if (amount <= rec.amount) {
      const updatedOwnedRECs = ownedRECs.map(ownedRec => {
        if (ownedRec.id === rec.id) {
          const newAmount = ownedRec.amount - amount;
          return {
            ...ownedRec,
            amount: newAmount,
            faded: newAmount === 0
          };
        }
        return ownedRec;
      });
      setOwnedRECs(updatedOwnedRECs);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Trade RECs</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tradeType === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Buy RECs
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tradeType === 'sell'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Sell RECs
          </button>
        </div>
      </div>

      {tradeType === 'buy' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {availableRECs.map((rec) => (
              <div key={rec.id} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{rec.producer}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-1" />
                      <span>{rec.type} REC</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(rec)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </div>
                    <div>{rec.location}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Available
                    </div>
                    <div>{rec.amount.toLocaleString()} RECs</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Price
                    </div>
                    <div>${rec.price.toFixed(2)}/REC</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Generated
                    </div>
                    <div>{new Date(rec.generationDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {ownedRECs.map((rec) => (
              <div 
                key={rec.id} 
                className={`bg-gray-50 p-6 rounded-xl transition-opacity ${
                  rec.faded ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{rec.producer}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-1" />
                      <span>{rec.type} REC</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSell(rec, 100)} // Example: sell 100 RECs
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={rec.faded}
                  >
                    Sell RECs
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </div>
                    <div>{rec.location}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Owned
                    </div>
                    <div>{rec.amount.toLocaleString()} RECs</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Purchase Price
                    </div>
                    <div>${rec.price.toFixed(2)}/REC</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Purchased
                    </div>
                    <div>{new Date(rec.purchaseDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RECTrade;