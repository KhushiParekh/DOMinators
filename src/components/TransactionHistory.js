import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TransactionHistory = () => {
  const transactions = [
    {
      id: 'TX123',
      type: 'sell',
      recType: 'Solar',
      amount: 100,
      price: 45.50,
      date: '2024-03-15',
      buyer: 'Tech Corp'
    },
    {
      id: 'TX124',
      type: 'buy',
      recType: 'Wind',
      amount: 50,
      price: 38.75,
      date: '2024-03-14',
      seller: 'Green Energy Ltd'
    }
    // Add more transactions...
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold mb-6">Transaction History</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3">Type</th>
              <th className="pb-3">REC</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Party</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-4">
                  <div className={`flex items-center ${
                    tx.type === 'sell' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {tx.type === 'sell' ? 
                      <ArrowUpRight size={20} /> : 
                      <ArrowDownRight size={20} />
                    }
                    <span className="ml-2 capitalize">{tx.type}</span>
                  </div>
                </td>
                <td className="py-4">{tx.recType}</td>
                <td className="py-4">{tx.amount}</td>
                <td className="py-4">${tx.price}</td>
                <td className="py-4">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="py-4">{tx.buyer || tx.seller}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;