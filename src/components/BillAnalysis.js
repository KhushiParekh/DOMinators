import React, { useState } from 'react';
import { Upload, FileSearch, Award, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
// import { auth, db } from "../firebase";
// import { doc, getDoc,collection, getDocs } from "firebase/firestore";
import { auth, db } from "../pages/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

// API Configuration
  const PINATA_API_KEY = 'ac084326986047702b67';
  const PINATA_SECRET_KEY = 'ee506b4c82edafedc90ba0ee143d4ff492bc571f37410d5e039f2a5ea8e03035';
  const GEMINI_API_KEY = 'AIzaSyDzCYTCBk449BmsuoppowGx27fiP8pd0Rc';

// Utility function to calculate green points
const calculateGreenPoints = (analysis) => {
  let points = 0;
  const breakdown = {};

  // Points for renewable energy usage
  if (analysis.renewablePercentage > 0) {
    breakdown.renewable = Math.floor(analysis.renewablePercentage * 2);
    points += breakdown.renewable;
  }

  // Points for reduction in consumption
  if (analysis.consumptionChange < 0) {
    breakdown.reduction = Math.floor(Math.abs(analysis.consumptionChange) * 3);
    points += breakdown.reduction;
  }

  // Points for low total consumption
  if (analysis.consumption < 200) {
    breakdown.efficiency = 50;
    points += breakdown.efficiency;
  } else if (analysis.consumption < 400) {
    breakdown.efficiency = 25;
    points += breakdown.efficiency;
  }

  return { total: points, breakdown };
};

const extractTextFromImage = async (file) => {
  try {
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
  } catch (error) {
    throw new Error('Failed to extract text from image');
  }
};

const analyzeWithGemini = async (text) => {
  try {
    const MODEL_NAME = "gemini-pro";
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a utility bill analyzer. Analyze this utility bill text and extract key information. 
                   Return the response ONLY in this exact JSON format:
                   {
                     "consumption": <number in kWh>,
                     "amount": <number in dollars>,
                     "comparison": {
                       "percentage": <number showing change from last month, negative means decrease>
                     },
                     "renewable": {
                       "percentage": <number showing renewable energy percentage>
                     }
                   }

                   Here's the bill text to analyze:
                   ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const analysisText = data.candidates[0].content.parts[0].text;
    
    // Find the JSON object in the response text
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in Gemini response');
    }

    // Parse the JSON response from Gemini
    const parsedAnalysis = JSON.parse(jsonMatch[0]);
    
    // Ensure all required fields exist with default values if missing
    return {
      consumption: parsedAnalysis.consumption || 0,
      amount: parsedAnalysis.amount || 0,
      consumptionChange: parsedAnalysis.comparison?.percentage || 0,
      renewablePercentage: parsedAnalysis.renewable?.percentage || 2,
    };
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    throw new Error(`Failed to analyze bill: ${error.message}`);
  }
};

// Add this helper function to clean OCR text
const cleanOCRText = (text) => {
  // Remove extra whitespace and special characters
  return text.replace(/\s+/g, ' ')
             .replace(/[^\w\s.$%/-]/g, '')
             .trim();
};

// Update the processFile function
// const processFile = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     // Extract text using OCR
//     const extractedText = await extractTextFromImage(file);
//     const cleanedText = cleanOCRText(extractedText);

//     console.log('Extracted Text:', cleanedText); // For debugging

//     // Analyze with Gemini
//     const analysisResult = await analyzeWithGemini(cleanedText);
    
//     console.log('Analysis Result:', analysisResult); // For debugging

//     // Calculate green points
//     const greenPoints = calculateGreenPoints(analysisResult);

//     // Combine analysis and green points
//     const fullAnalysis = {
//       ...analysisResult,
//       greenPoints
//     };

//     setAnalysis(fullAnalysis);

//     // Upload to IPFS
//     const hash = await uploadToPinata(file);
//     setIpfsHash(hash);

//   } catch (err) {
//     console.error('Processing Error:', err); // For debugging
//     setError(err.message || "Failed to process the bill. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };

// Rest of the component remains the same...

const uploadToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: formData
    });

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    throw new Error('Failed to upload to IPFS');
  }
};

const BillAnalysis = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [error, setError] = useState(null);
  const [consumers, setConsumers] = useState([]); 
  
  // useEffect(() => {
  //   const fetchConsumers = async () => {
  //     const querySnapshot = await getDocs(collection(db, "Consumers"));
  //     const fetchedConsumers = querySnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setConsumers(fetchedConsumers);
  //   };
  //   fetchConsumers();
  // }, []);
  

    
  // useEffect(() => {
  //   fetchUserData();
  // }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const saveGreenPoints = async (points) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const userRef = doc(db, "Consumers", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentPoints = userDoc.data().greenPoints || 0;
        await updateDoc(userRef, {
          greenPoints: currentPoints + points,
          lastUpdated: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
          greenPoints: points,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving green points:', error);
      throw new Error('Failed to save green points');
    }
  };

  const processFile = async () => {
    try {
      setLoading(true);
      setError(null);

      const extractedText = await extractTextFromImage(file);
      const cleanedText = cleanOCRText(extractedText);
      const analysisResult = await analyzeWithGemini(cleanedText);
      const greenPoints = calculateGreenPoints(analysisResult);

      // Save green points to Firebase
      await saveGreenPoints(greenPoints.total);

      const fullAnalysis = {
        ...analysisResult,
        greenPoints
      };

      setAnalysis(fullAnalysis);

      const hash = await uploadToPinata(file);
      setIpfsHash(hash);

    } catch (err) {
      console.error('Processing Error:', err);
      setError(err.message || "Failed to process the bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-2xl mx-auto text-black p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Smart Bill Analysis</h1>
        <p className="text-gray-600">Upload your bill to get instant analysis and earn green points!</p>
      </div>

      {/* File Upload Section */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload your bill</span>
          </div>
        </label>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="mb-6">
          <img src={preview} alt="Bill preview" className="max-h-64 mx-auto rounded-lg shadow" />
          <button
            onClick={processFile}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              "Analyze Bill"
            )}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <FileSearch className="mr-2" />
              <h2 className="text-xl font-semibold">Bill Analysis</h2>
            </div>
            <div className="space-y-2">
              <p>Energy Usage: {analysis.consumption} kWh</p>
              <p>Bill Amount: ${analysis.amount.toFixed(2)}</p>
              <p>vs Last Month: {analysis.consumptionChange}%</p>
              {/* <p>Renewable Energy: {analysis.renewablePercentage}%</p> */}
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
            <div className="flex items-center mb-4">
              <Award className="mr-2" />
              <h2 className="text-xl font-semibold">Green Points Earned!</h2>
            </div>
            <div>
              <p className="text-lg font-semibold mb-2">
                🎉 You earned {analysis.greenPoints.total} points!
              </p>
              <div className="space-y-1">
                {analysis.greenPoints.breakdown.renewable && (
                  <p>• {analysis.greenPoints.breakdown.renewable} points for renewable energy usage</p>
                )}
                {analysis.greenPoints.breakdown.reduction && (
                  <p>• {analysis.greenPoints.breakdown.reduction} points for consumption reduction</p>
                )}
                {analysis.greenPoints.breakdown.efficiency && (
                  <p>• {analysis.greenPoints.breakdown.efficiency} points for energy efficiency</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IPFS Status */}
      {ipfsHash && (
        <div className="mt-6 bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200">
          <h2 className="text-xl font-semibold mb-2">Successfully uploaded to IPFS!</h2>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            View on IPFS
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BillAnalysis;

// import { useState, useEffect } from 'react';
// import { createWorker } from 'tesseract.js';
// import axios from 'axios';

// const BillAnalysis = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [analysis, setAnalysis] = useState(null);
//   const [extractedText, setExtractedText] = useState(null);
//   const [uploadStatus, setUploadStatus] = useState('');
//   const [ipfsHash, setIpfsHash] = useState('');
//   const [imagePreview, setImagePreview] = useState(null);

//   // Pinata credentials - Should be in environment variables
//   const PINATA_API_KEY = 'ac084326986047702b67';
//   const PINATA_SECRET_KEY = 'ee506b4c82edafedc90ba0ee143d4ff492bc571f37410d5e039f2a5ea8e03035';
//   const GOOGLE_API_KEY = 'AIzaSyDzCYTCBk449BmsuoppowGx27fiP8pd0Rc';

//   const uploadToPinata = async (file) => {
//     try {
//       setUploadStatus('Uploading to Pinata...');
//       const formData = new FormData();
//       formData.append('file', file);

//       const metadata = {
//         name: `energy_bill_${Date.now()}`,
//         keyvalues: {
//           userId: 'user123',
//           uploadDate: new Date().toISOString()
//         }
//       };

//       formData.append('pinataMetadata', JSON.stringify(metadata));

//       const response = await axios.post(
//         'https://api.pinata.cloud/pinning/pinFileToIPFS',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             pinata_api_key: PINATA_API_KEY,
//             pinata_secret_api_key: PINATA_SECRET_KEY,
//           },
//           maxContentLength: Infinity
//         }
//       );

//       setIpfsHash(response.data.IpfsHash);
//       setUploadStatus('Bill uploaded successfully to IPFS!');
//       return response.data.IpfsHash;
//     } catch (error) {
//       console.error('Pinata upload error:', error);
//       setUploadStatus('Failed to upload to IPFS');
//       throw error;
//     }
//   };

//   const processImage = async (imageUrl) => {
//     try {
//       setIsProcessing(true);
//       setErrorMessage(null);

//       // Create and initialize worker
//       const worker = await createWorker({
//         logger: m => console.log(m), // Add logging to debug
//       });
      
//       await worker.loadLanguage('eng');
//       await worker.initialize('eng');
      
//       // Perform OCR
//       const { data } = await worker.recognize(imageUrl);
//       console.log('Extracted text:', data.text); // Debug log
//       setExtractedText(data.text);

//       // Clean up worker
//       await worker.terminate();

//       // Only proceed with analysis if we have text
//       if (data.text) {
//         const analysis = await analyzeWithGemini(data.text);
//         setAnalysis(analysis);
//       } else {
//         throw new Error('No text was extracted from the image');
//       }

//     } catch (error) {
//       console.error('Processing error:', error);
//       setErrorMessage('Error processing image: ' + error.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const analyzeWithGemini = async (text) => {
//     try {
//       const prompt = `Analyze this electricity bill text and extract the following information. If exact values are not found, make reasonable estimates based on the available text. Return ONLY a JSON object with these keys:
//         {
//           "usage": "number in kWh",
//           "amount": "number in dollars",
//           "comparison": "percentage with % symbol",
//           "renewable": "percentage with % symbol if available, otherwise null"
//         }
        
//         Text to analyze: ${text}`;

//       const response = await axios.post(
//         `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
//         {
//           contents: [{
//             parts: [{
//               text: prompt
//             }]
//           }]
//         }
//       );

//       const analysisText = response.data.candidates[0].content.parts[0].text;
      
//       // Clean up the response text to ensure valid JSON
//       const cleanedText = analysisText.replace(/```json|```/g, '').trim();
//       console.log('Cleaned analysis text:', cleanedText); // Debug log
      
//       return JSON.parse(cleanedText);
//     } catch (error) {
//       console.error('Gemini API error:', error);
//       throw new Error('Failed to analyze bill');
//     }
//   };

//   const handleImageChange = async (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       try {
//         setSelectedImage(file);
        
//         // Create image preview
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setImagePreview(reader.result);
//           processImage(reader.result);
//         };
//         reader.readAsDataURL(file);

//         // Upload to Pinata
//         await uploadToPinata(file);
//       } catch (error) {
//         console.error('Error handling image:', error);
//         setErrorMessage('Error handling image: ' + error.message);
//       }
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-4 text-black">
//       <div className="mb-6">
//         <div className="p-6 bg-white rounded-lg shadow-md">
//           <h2 className="text-xl font-bold mb-4">Upload Energy Bill</h2>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//             className="block w-full text-sm text-gray-500 mb-4
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-md file:border-0
//               file:text-sm file:font-semibold
//               file:bg-blue-50 file:text-blue-700
//               hover:file:bg-blue-100"
//           />
//           {imagePreview && (
//             <div className="mt-4">
//               <img 
//                 src={imagePreview} 
//                 alt="Bill preview" 
//                 className="max-w-full h-auto rounded-lg"
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {errorMessage && (
//         <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
//           {errorMessage}
//         </div>
//       )}

//       {isProcessing && (
//         <div className="text-center p-4">
//           <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
//           <p className="text-gray-600">Processing bill...</p>
//         </div>
//       )}

//       {extractedText && (
//         <div className="bg-white rounded-lg shadow-md p-6 mb-4">
//           <h3 className="text-lg font-bold mb-3">Extracted Text</h3>
//           <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
//         </div>
//       )}

//       {analysis && (
//         <div className="bg-white rounded-lg shadow-md p-6 text-black mb-4">
//           <h3 className="text-lg font-bold mb-3">Bill Analysis</h3>
//           <div className="space-y-2">
//             <div className="flex justify-between">
//               <span>Energy Usage:</span>
//               <span>{analysis.usage} kWh</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Bill Amount:</span>
//               <span>${analysis.amount}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>vs Last Month:</span>
//               <span className={analysis.comparison?.includes('-') ? 'text-green-600' : 'text-red-600'}>
//                 {analysis.comparison}
//               </span>
//             </div>
//             {analysis.renewable && (
//               <div className="flex justify-between">
//                 <span>Renewable Energy:</span>
//                 <span className="text-green-600">{analysis.renewable}</span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {uploadStatus && (
//         <div className={`p-4 rounded-lg text-black ${uploadStatus.includes('Failed') ? 'bg-red-50' : 'bg-green-50'}`}>
//           <p>{uploadStatus}</p>
//           {ipfsHash && (
//             <a
//               href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
//             >
//               View on IPFS
//             </a>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BillAnalysis;
