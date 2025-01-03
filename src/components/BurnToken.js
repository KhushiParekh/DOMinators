import React, { useState } from 'react';
const BurnTokens = ({ contract }) => {
    const [formData, setFormData] = useState({
      amount: '',
      energyType: ''
    });
    const [isLoading, setIsLoading] = useState(false);
  
    const handleBurn = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const tx = await contract.burnTokens(
          formData.amount,
          formData.energyType
        );
        await tx.wait();
        setFormData({ amount: '', energyType: '' });
      } catch (error) {
        console.error("Burn error:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Burn REC Tokens</h3>
        <form onSubmit={handleBurn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="Enter amount"
              disabled={isLoading}
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-1">Energy Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.energyType}
              onChange={(e) => setFormData({...formData, energyType: e.target.value})}
              placeholder="solar, wind, hydro"
              disabled={isLoading}
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Burn Tokens'}
          </button>
        </form>
      </div>
    );
  };
export default BurnTokens;