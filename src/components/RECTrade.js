import React, { useState, useEffect } from 'react';
import { ShoppingCart, Tag, MapPin, Clock } from 'lucide-react';
import { ethers } from 'ethers';
const RECTrade = ({ contract, account }) => {
  const [tradeType, setTradeType] = useState('buy');
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState('0');
  const [decimals, setDecimals] = useState(18);
  const [energyType, setEnergyType] = useState('solar');  

  const energyTypes = [
    'solar',
    'wind',
    'hydro',
    'biomass',
    'geothermal'
  ];

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

  const handleBuyTokens = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = await contract.buyTokensByEnergyType(energyType, amount);
      await tx.wait();
      setSuccess('Purchase successful');
      setShowBuyDialog(false);
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleListTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const priceInWei = ethers.utils.parseUnits(price, decimals);

      const approveTx = await contract.approve(contract.address, amountInWei);
      await approveTx.wait();

      const tx = await contract.listTokens(amountInWei, priceInWei, energyType);
      await tx.wait();

      setSuccess('Tokens listed successfully!');
      setShowListDialog(false);
    } catch (err) {
      setError(`Transaction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // const Dialog = ({ isOpen, onClose, children }) => {
  //   if (!isOpen) return null;

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white rounded-lg p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
  //         {children}
  //       </div>
  //     </div>
  //   );
  // };
  const Dialog = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const handleDialogClick = (e) => {
      // Prevent click from reaching the backdrop
      e.stopPropagation();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          className="bg-white rounded-lg p-6 max-w-md w-full m-4 dialog-content" 
          onClick={handleDialogClick}
        >
          {children}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBuyDialog || showListDialog) {
        const dialogContent = document.querySelector('.dialog-content');
        if (dialogContent && !dialogContent.contains(event.target)) {
          setShowBuyDialog(false);
          setShowListDialog(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBuyDialog, showListDialog]);

  const BuyDialog = () => (
    <Dialog isOpen={showBuyDialog} onClose={() => setShowBuyDialog(false)}>
      <h2 className="text-2xl font-bold mb-4">Buy Tokens</h2>
      <div className="space-y-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Energy Type</label>
          <select
            value={energyType}
            onChange={(e) => setEnergyType(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {energyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBuyTokens();
          }}
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Confirm Purchase'}
        </button>
      </div>
    </Dialog>
  );

  const ListDialog = () => (
    <Dialog isOpen={showListDialog} onClose={() => setShowListDialog(false)}>
      <h2 className="text-2xl font-bold mb-4">List Tokens</h2>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleListTokens(e);
        }} 
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter price"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Energy Type</label>
          <select
            value={energyType}
            onChange={(e) => setEnergyType(e.target.value)}
            className="w-full p-2 border rounded bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {energyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? 'Processing...' : 'List Tokens'}
        </button>
      </form>
    </Dialog>
  );


  return (
    <>
       <div className="bg-white w-[100%] rounded-xl shadow-sm p-1 ">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRec(rec);
                        setEnergyType(rec.type);
                        setShowBuyDialog(true);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRec(rec);
                        setEnergyType(rec.type);
                        setShowListDialog(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      disabled={rec.faded}
                    >
                      Sell Now
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

        {(error || success) && (
          <div className={`mt-4 p-3 rounded ${
            error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
          }`}>
            {error || success}
          </div>
        )}
      </div>

      <BuyDialog />
      <ListDialog />
    </>
  );
};

export default RECTrade;