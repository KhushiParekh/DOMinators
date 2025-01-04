import { useState } from 'react';
import QRCode from 'react-qr-code';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

const ReclaimURLVerifier = () => {
  const [url, setUrl] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatProofData = (proof) => {
    try {
      // Extract the parameters from the proof
      const parameters = proof.parameters ? JSON.parse(proof.parameters) : {};
      return {
        ...proof,
        parameters
      };
    } catch (err) {
      return proof;
    }
  };

  const ProofDisplay = ({ proof }) => {
    const formattedProof = formatProofData(proof);
    
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="space-y-3">
          <div className="border-b pb-2">
            <h4 className="text-lg font-medium">Proof Details</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="font-medium">Provider:</span> {formattedProof.provider}
            </div>
            <div>
              <span className="font-medium">Identifier:</span> {formattedProof.identifier}
            </div>
            {formattedProof.ownerPublicKey && (
              <div>
                <span className="font-medium">Owner Public Key:</span>
                <div className="text-sm font-mono break-all bg-gray-50 p-2 rounded">
                  {formattedProof.ownerPublicKey}
                </div>
              </div>
            )}
            {formattedProof.parameters && (
              <div>
                <span className="font-medium">Parameters:</span>
                <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(formattedProof.parameters, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {formattedProof.signatures && (
              <div>
                <span className="font-medium">Signatures:</span>
                <div className="text-sm font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                  {formattedProof.signatures.map((sig, index) => (
                    <div key={index} className="mb-2">
                      <div>Type: {sig.type}</div>
                      <div className="break-all">Signature: {sig.signature}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {formattedProof.context && (
              <div>
                <span className="font-medium">Context:</span>
                <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(formattedProof.context, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const verifyURL = async () => {
    if (!url) {
      setError('Please enter a URL to verify');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const APP_ID = '0x0f2285d3b3B904Cef3e4292cfE1A2141C5D20Dd9';
      const APP_SECRET = '0x34c8de06dd966c9117f7ddc118621b962476275bc8d357d75ff5269649a40ea6';
      const PROVIDER_ID = 'ce973302-0c9c-4216-8f0c-411ab4e47c42';

      const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID, {
        url: url,
      });

      const reqUrl = await reclaimProofRequest.getRequestUrl();
      setRequestUrl(reqUrl);

      await reclaimProofRequest.startSession({
        onSuccess: (verificationProofs) => {
          console.log('Verification success', verificationProofs);
          setProofs(verificationProofs);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Verification failed', error);
          setError('Verification failed: ' + error.message);
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error('Error setting up verification:', err);
      setError('Error setting up verification: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="url" className="block text-sm font-medium">
            Enter URL to Verify
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={verifyURL}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Verifying...' : 'Verify URL'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {requestUrl && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Scan QR Code to Verify</h3>
            <div className="inline-block p-4 bg-white rounded shadow">
              <QRCode value={requestUrl} />
            </div>
          </div>
        )}

        {proofs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Verification Results</h3>
            {proofs.map((proof, index) => (
              <ProofDisplay key={index} proof={proof} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReclaimURLVerifier;