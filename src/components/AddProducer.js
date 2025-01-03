import React, { useState, useEffect } from 'react';

const ProducerManagement = ({ contract, address }) => {
  const [gst, setGst] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [producerInfo, setProducerInfo] = useState(null);

  useEffect(() => {
    loadProducerInfo();
  }, [contract, address]);

  const loadProducerInfo = async () => {
    try {
      const info = await contract.getProducerInfo(address);
      setProducerInfo({
        gst: info.gst,
        location: info.location,
        verified: info.verified
      });
    } catch (error) {
      console.error('Error loading producer info:', error);
    }
  };

  const handleRegisterAndVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tx = await contract.registerAndVerifyProducer(gst, location);
      await tx.wait();
      await loadProducerInfo();
      setGst('');
      setLocation('');
    } catch (error) {
      setError(error.message || 'Error registering producer');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {producerInfo ? (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Producer Information</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">GST:</span> {producerInfo.gst}</p>
            <p><span className="font-semibold">Location:</span> {producerInfo.location}</p>
            <p>
              <span className="font-semibold">Status:</span>
              {producerInfo.verified ? (
                <span className="ml-2 text-green-600">Verified</span>
              ) : (
                <span className="ml-2 text-yellow-600">Pending Verification</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Register as Producer</h2>
          <form onSubmit={handleRegisterAndVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="Enter GST number"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Register & Verify'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProducerManagement;