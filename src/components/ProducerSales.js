import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { getAuth } from 'firebase/auth';
const ProducerSales = ({ contract, account }) => {
    const [history, setHistory] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [userEmail, setUserEmail] = useState('');
    
    useEffect(() => {
        if (contract && account) {
            fetchSellHistory();
            getUserEmail();
        }
    }, [contract, account]);

    const fetchSellHistory = async () => {
        try {
            const sellHistory = await contract.getSellingHistory(account);
            setHistory(sellHistory);
        } catch (error) {
            console.error("Error fetching sell history:", error);
            showNotification("Failed to fetch history", "error");
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const generateMonthlySummary = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyTransactions = history.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp * 1000);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });

        const summary = {
            totalSales: monthlyTransactions.length,
            totalTokens: monthlyTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
            totalValue: monthlyTransactions.reduce((sum, tx) => sum + Number(tx.price), 0),
            byEnergyType: monthlyTransactions.reduce((acc, tx) => {
                acc[tx.energyType] = (acc[tx.energyType] || 0) + Number(tx.amount);
                return acc;
            }, {})
        };

        return {
            transactions: monthlyTransactions,
            summary
        };
    };

    const getUserEmail = async () => {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (currentUser && currentUser.email) {
                setUserEmail(currentUser.email);
            } else {
                console.error("No user email found");
                showNotification("Could not fetch user email", "error");
            }
        } catch (error) {
            console.error("Error fetching user email:", error);
            showNotification("Failed to fetch user email", "error");
        }
    };

    // Modified sendMonthlyReport function to use Firebase email
    const sendMonthlyReport = async () => {
        if (!userEmail) {
            showNotification("No email address found. Please make sure you're logged in.", "error");
            return;
        }

        try {
            const { transactions, summary } = generateMonthlySummary();
            const currentDate = new Date();
            const monthName = currentDate.toLocaleString('default', { month: 'long' });

            const emailContent = {
                to_email: userEmail, // Using email from Firebase
                month: monthName,
                year: currentDate.getFullYear(),
                total_sales: summary.totalSales,
                total_tokens: summary.totalTokens.toFixed(2),
                total_value: summary.totalValue.toFixed(2),
                transactions_list: transactions.map(tx => `
                    Buyer: ${tx.counterparty}
                    Amount: ${tx.amount} tokens
                    Price: ${tx.price}
                    Energy Type: ${tx.energyType}
                    Date: ${new Date(tx.timestamp * 1000).toLocaleString()}
                `).join('\n\n')
            };

            // Replace these with your EmailJS credentials
            await emailjs.send(
                'service_i3t8r4m',
                'template_e254j4c',
                emailContent,
                'hfx--3KcbLgX-EWIv'
            );

            showNotification(`Monthly report for ${monthName} has been sent to ${userEmail}`, "success");

        } catch (error) {
            console.error("Error sending email:", error);
            showNotification("Failed to send monthly report. Please try again.", "error");
        }
    };

    return (
        <div className="w-full p-6 bg-white rounded-lg shadow-lg">
            {notification.show && (
                <div className={`mb-4 p-4 rounded-md ${
                    notification.type === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {notification.message}
                </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
                <button 
                    onClick={sendMonthlyReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Email Monthly Report
                </button>
            </div>
            
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens (decimal 18)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
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