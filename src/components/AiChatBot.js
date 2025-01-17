import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json'

const RECChatbot = ({ contractAddress, geminiApiKey }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isProducer, setIsProducer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const chatRef = useRef(null);
    
  const CA = "0xb513E1bfCD84DA7885d739ddd3eB16005AD85671";
  contractAddress = CA;
  const GEMINI_API_KEY = 'AIzaSyAmP3R-BenptMU2OBKfsBDIhrTlOTrIEFo';
  geminiApiKey = GEMINI_API_KEY;
  const CONTRACT_ABI = abi;
  const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : null;
  const signer = provider?.getSigner();
  const contract = contractAddress && signer ? new ethers.Contract(contractAddress, CONTRACT_ABI, signer) : null;

  const addMessage = (text, isBot = false) => {
    setMessages(prev => [...prev, { text, isBot, timestamp: Date.now() }]);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const connectWallet = async () => {
    try {
      if (!provider) {
        addMessage("Please install MetaMask!", true);
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);
      checkProducerStatus(address);
      addMessage(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, true);
    } catch (error) {
      addMessage("Failed to connect wallet: " + error.message, true);
    }
  };

  const checkProducerStatus = async (address) => {
    try {
      const producerInfo = await contract.getProducerInfo(address);
      setIsProducer(producerInfo.verified);
      if (producerInfo.verified) {
        addMessage("Welcome verified producer! How can I help you today?", true);
      } else {
        addMessage("You need to be a verified producer to use this interface.", true);
      }
    } catch (error) {
      addMessage("Error checking producer status: " + error.message, true);
    }
  };

  

  const processWithGemini = async (userInput) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${geminiApiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant for a blockchain REC (Renewable Energy Certificate) trading platform.
                     Parse this user request and respond with a JSON object containing 'function' and 'parameters'.
                     Available functions: mintTokens, burnTokens, listTokens, cancelListing, transferTokens.
                     Energy types allowed: solar, wind, hydro, biomass, geothermal
                     User request: "${userInput}"
                     
                     Example response format:
                     {
                       "function": "mintTokens",
                       "parameters": {
                         "amount": "100",
                         "energyType": "solar"
                       }
                     }
                     
                     Only respond with the JSON object, no additional text.`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 1,
            topK: 1,
            maxOutputTokens: 1000,
          },
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response format from Gemini API');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Try to parse the AI response as JSON
      try {
        const parsedResponse = JSON.parse(aiResponse.trim());
        return processAIResponse(parsedResponse, userInput);
      } catch (error) {
        console.error('Failed to parse AI response:', aiResponse);
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      console.error('AI Processing error:', error);
      addMessage("Failed to process request: " + error.message, true);
      return null;
    }
  };

  const processAIResponse = (aiResponse, originalInput) => {
    const params = extractParams(originalInput);
    
    if (!aiResponse.function || !aiResponse.parameters) {
      throw new Error('Invalid AI response format');
    }

    // Map the AI response to contract function parameters
    switch (aiResponse.function) {
      case 'mintTokens':
        return {
          function: 'mintTokens',
          params: {
            amount: params.amount || ethers.utils.parseEther('1'), // Default to 1 if not specified
            energyType: params.energyType || aiResponse.parameters.energyType
          }
        };

      case 'burnTokens':
        return {
          function: 'burnTokens',
          params: {
            amount: params.amount || ethers.utils.parseEther('1'),
            energyType: params.energyType || aiResponse.parameters.energyType
          }
        };

      case 'listTokens':
        return {
          function: 'listTokens',
          params: {
            amount: params.amount || ethers.utils.parseEther('1'),
            price: params.price || ethers.utils.parseEther('1'),
            energyType: params.energyType || aiResponse.parameters.energyType
          }
        };

      case 'cancelListing':
        if (!params.listingId && !aiResponse.parameters.listingId) {
          throw new Error('Listing ID is required for cancellation');
        }
        return {
          function: 'cancelListing',
          params: {
            listingId: params.listingId || parseInt(aiResponse.parameters.listingId)
          }
        };

      case 'transferTokens':
        if (!params.recipient && !aiResponse.parameters.to) {
          throw new Error('Recipient address is required for transfer');
        }
        return {
          function: 'transferTokens',
          params: {
            to: params.recipient || aiResponse.parameters.to,
            amount: params.amount || ethers.utils.parseEther('1'),
            energyType: params.energyType || aiResponse.parameters.energyType
          }
        };

      default:
        throw new Error('Unknown function type');
    }
  };

  const extractParams = (text) => {
    const params = {
      amount: null,
      energyType: null,
      price: null,
      listingId: null,
      recipient: null
    };

    // Extract amount (looking for numbers followed by optional units)
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(tokens?|RECs?|certificates?|units?)?/i);
    if (amountMatch) {
      params.amount = ethers.utils.parseEther(amountMatch[1].toString());
    }

    // Extract energy type
    const energyTypes = ['solar', 'wind', 'hydro', 'biomass', 'geothermal'];
    for (const type of energyTypes) {
      if (text.toLowerCase().includes(type)) {
        params.energyType = type;
        break;
      }
    }

    // Extract price (if present)
    const priceMatch = text.match(/(\d+(?:\.\d+)?)\s*(eth|ether|wei)/i);
    if (priceMatch) {
      params.price = ethers.utils.parseEther(priceMatch[1].toString());
    }

    // Extract listing ID (now supports more formats)
    const listingMatch = text.match(/(?:listing|list|sale)(?:\s+|#|number|id)?\s*(\d+)/i);
    if (listingMatch) {
      params.listingId = parseInt(listingMatch[1]);
    }

    // Extract ethereum address
    const addressMatch = text.match(/0x[a-fA-F0-9]{40}/i);
    if (addressMatch) {
      params.recipient = addressMatch[0];
    }

    return params;
  };

  const interpretGeminiResponse = (response, originalInput) => {
    const text = response.candidates[0].content.parts[0].text;
    const params = extractParams(originalInput);
    
    if (text.toLowerCase().includes('mint')) {
      return {
        function: 'mintTokens',
        params: {
          amount: params.amount,
          energyType: params.energyType
        }
      };
    } else if (text.toLowerCase().includes('burn')) {
      return {
        function: 'burnTokens',
        params: {
          amount: params.amount,
          energyType: params.energyType
        }
      };
    } else if (text.toLowerCase().includes('list')) {
      return {
        function: 'listTokens',
        params: {
          amount: params.amount,
          price: params.price || ethers.utils.parseEther('1'), // Default price
          energyType: params.energyType
        }
      };
    } else if (text.toLowerCase().includes('cancel')) {
      return {
        function: 'cancelListing',
        params: {
          listingId: params.listingId
        }
      };
    } else if (text.toLowerCase().includes('transfer')) {
      return {
        function: 'transferTokens',
        params: {
          to: params.recipient,
          amount: params.amount,
          energyType: params.energyType
        }
      };
    }
    return null;
  };

  const executeTransaction = async (action) => {
    try {
      let tx;
      switch (action.function) {
        case 'mintTokens':
          tx = await contract.mintTokens(action.params.amount, action.params.energyType);
          break;
        case 'burnTokens':
          tx = await contract.burnTokens(action.params.amount, action.params.energyType);
          break;
        case 'listTokens':
          tx = await contract.listTokens(action.params.amount, action.params.price, action.params.energyType);
          break;
        case 'cancelListing':
          tx = await contract.cancelListing(action.params.listingId);
          break;
        case 'transferTokens':
          tx = await contract.transferTokens(action.params.to, action.params.amount, action.params.energyType);
          break;
        default:
          throw new Error('Unknown function');
      }
      await tx.wait();
      addMessage(`Transaction successful! Hash: ${tx.hash}`, true);
    } catch (error) {
      addMessage("Transaction failed: " + error.message, true);
    }
    setShowModal(false);
    setPendingAction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage(input, false);
    setInput('');

    if (!isConnected) {
      addMessage("Please connect your wallet first!", true);
      return;
    }

    if (!isProducer) {
      addMessage("Only verified producers can use this interface!", true);
      return;
    }

    const action = await processWithGemini(input);
    if (action) {
      setPendingAction(action);
      setShowModal(true);
    } else {
      addMessage("I couldn't understand that request. Could you please rephrase?", true);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-100">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">REC Producer Assistant</h1>
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Connect Wallet
          </button>
        ) : (
          <span className="text-sm text-gray-600">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        )}
      </div>

      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow p-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-4 ${msg.isBot ? 'text-left' : 'text-right'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.isBot ? 'bg-gray-200' : 'bg-blue-500 text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Transaction</h2>
            <p className="mb-4">
              Are you sure you want to execute this transaction?
              <br />
              Function: {pendingAction.function}
              <br />
              Parameters: {JSON.stringify(pendingAction.params)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => executeTransaction(pendingAction)}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RECChatbot;