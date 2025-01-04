import React, { useState, useEffect } from "react";

const ProducerSales = ({ contract, account }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (contract && account) {
            fetchSellHistory();
        }
    }, [contract, account]);

    const fetchSellHistory = async () => {
        try {
            const sellHistory = await contract.getSellingHistory(account);
            setHistory(sellHistory);
        } catch (error) {
            console.error("Error fetching sell history:", error);
        }
    };

    return (
        <div className="w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Sales History</h2>
            
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens (decimal 18)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.map((transaction, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {transaction.counterparty}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {transaction.amount.toString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {transaction.price.toString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {transaction.energyType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(transaction.timestamp * 1000).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No sales history available
                </div>
            )}
        </div>
    );
};

export default ProducerSales;