import React, { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { getAuth } from 'firebase/auth';
import Swal from "sweetalert2";

const ProducerSales = ({ contract, account }) => {
    const [history, setHistory] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [userEmail, setUserEmail] = useState('');
    const [fraudFlags, setFraudFlags] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (contract && account) {
            setIsLoading(true);
            fetchSellHistory()
                .finally(() => setIsLoading(false));
            getUserEmail();
        }
    }, [contract, account]);

    const checkFraud = async (transaction) => {
        try {
            // Input validation
            if (!transaction.amount || !transaction.price || !transaction.energyType) {
                console.warn("Invalid transaction data:", transaction);
                return 0;
            }
    
            // Convert from Wei/token decimals to normal numbers
            const amount = parseFloat(transaction.amount) / (10 ** 18); // Assuming 18 decimals
            const price = parseFloat(transaction.price) / (10 ** 18);
            
            // Validate parsed values
            if (isNaN(amount) || isNaN(price) || amount === 0) {
                console.warn("Invalid numeric values in transaction:", transaction);
                return 0;
            }
    
            const transformedData = {
                Energy_Produced_kWh: amount,
                Energy_Sold_kWh: amount,
                Price_per_kWh: price / amount, // Calculate price per kWh
                Total_Amount: price,
                Energy_Consumption_Deviation: 0,
                Producer_Type: transaction.energyType.toLowerCase(),
                Grid_Connection_Type: "direct",
                Location_Type: "urban",
                Weather_Conditions: "normal"
            };
    
            // Validate transformed values are within reasonable ranges
            if (transformedData.Price_per_kWh > 1000 || transformedData.Total_Amount > 1000000) {
                console.warn("Suspicious transaction values detected:", transformedData);
                return 1; // Flag as suspicious
            }
    
            console.log("Sending data to fraud detection:", transformedData);
    
            const response = await fetch('http://localhost:5000/predict_fraud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transformedData),
                signal: AbortSignal.timeout(5000)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log("Fraud detection response:", result);
            
            return result.fraud_probability > result.threshold ? 1 : 0;
    
        } catch (error) {
            console.error("Error in fraud detection:", error);
            return 0;
        }
    };

    const processTransactionBatch = async (transactions) => {
        const results = {};
        let hasDetectedFraud = false;

        for (const transaction of transactions) {
            try {
                const fraudFlag = await checkFraud(transaction);
                const transactionKey = `${transaction.timestamp}-${transaction.counterparty}`;
                results[transactionKey] = fraudFlag;
                

                if (fraudFlag === 1) {
                    hasDetectedFraud = true;
                    await Swal.fire({
                        icon: "warning",
                        title: "Suspicious Activity Detected",
                        text: `A suspicious transaction with ${transaction.counterparty} was identified.`,
                        confirmButtonText: "View Details",
                        confirmButtonColor: "#d33",
                        cancelButtonText: "Dismiss",
                        showCancelButton: true,
                    });
                }
            } catch (error) {
                console.error(`Error processing transaction: ${error}`);
                continue;
            }
        }

        return { results, hasDetectedFraud };
    };

    const fetchSellHistory = async () => {
        try {
            const sellHistory = await contract.getSellingHistory(account);
            setHistory(sellHistory);

            const batchSize = 5;
            const fraudResults = {};
            let suspiciousDetected = false;
           


            for (let i = 0; i < sellHistory.length; i += batchSize) {
                const batch = sellHistory.slice(i, i + batchSize);
                const { results, hasDetectedFraud } = await processTransactionBatch(batch);
                
                Object.assign(fraudResults, results);
                if (hasDetectedFraud) {
                    suspiciousDetected = true;

                }
            }

            setFraudFlags(fraudResults);

            if (!suspiciousDetected && sellHistory.length > 0) {
                await Swal.fire({
                    icon: "success",
                    title: "No Suspicious Activity",
                    text: "No suspicious activities were detected in this month.",
                    confirmButtonText: "Okay",
                    confirmButtonColor: "#3085d6",
                });
            }

        } catch (error) {
            console.error("Error fetching sell history:", error);
            setNotification({
                show: true,
                message: "Failed to fetch history: " + error.message,
                type: "error"
            });
            throw error; // Re-throw to be caught by the loading state handler
        }
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
                setNotification({
                    show: true,
                    message: "Could not fetch user email",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Error fetching user email:", error);
            setNotification({
                show: true,
                message: "Failed to fetch user email",
                type: "error"
            });
        }
    };

    const sendMonthlyReport = async () => {
        if (!userEmail) {
            setNotification({
                show: true,
                message: "No email address found. Please make sure you're logged in.",
                type: "error"
            });
            return;
        }

        try {
            const { transactions, summary } = generateMonthlySummary();
            const currentDate = new Date();
            const monthName = currentDate.toLocaleString('default', { month: 'long' });

            const emailContent = {
                to_email: userEmail,
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

            await emailjs.send(
                'service_i3t8r4m',
                'template_e254j4c',
                emailContent,
                'hfx--3KcbLgX-EWIv'
            );

            setNotification({
                show: true,
                message: `Monthly report for ${monthName} has been sent to ${userEmail}`,
                type: "success"
            });

        } catch (error) {
            console.error("Error sending email:", error);
            setNotification({
                show: true,
                message: "Failed to send monthly report. Please try again.",
                type: "error"
            });
        }
    };

    const renderTransactionRow = (transaction, index) => {
        const isFraudulent = fraudFlags[`${transaction.timestamp}-${transaction.counterparty}`] === 1;
        
        return (
            <tr key={index} className={`hover:bg-gray-50 transition-colors ${isFraudulent ? 'bg-red-50' : ''}`}>
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
        );
    };

    if (isLoading) {
        return (
            <div className="w-full p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading transaction history...</p>
                </div>
            </div>
        );
    }

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
                        {history.map((transaction, index) => renderTransactionRow(transaction, index))}
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