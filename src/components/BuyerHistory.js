import React, { useEffect, useState } from "react";

const BuyHistory = ({ contract, account }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (contract && account) {
            fetchBuyHistory();
        }
    }, [contract, account]);

    const fetchBuyHistory = async () => {
        try {
            const buyHistory = await contract.getBuyingHistory(account);
            setHistory(buyHistory);
        } catch (error) {
            console.error("Error fetching buy history:", error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Purchase History</h2>
            </div>
            <div className="space-y-4">
                {history.map((transaction, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-lg">
                        <p>Seller: {transaction.counterparty}</p>
                        <p>Amount: {transaction.amount.toString()}</p>
                        <p>Price: {transaction.price.toString()} ETH</p>
                        <p>Energy Type: {transaction.energyType}</p>
                        <p>Date: {new Date(transaction.timestamp * 1000).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default BuyHistory;