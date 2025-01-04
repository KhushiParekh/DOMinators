import React, { useState, useEffect } from 'react';

const AdminManagement = ({ contract, address }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [buyerAddress, setBuyerAddress] = useState('');
  const [producerGst, setProducerGst] = useState('');
  const [producerLocation, setProducerLocation] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleApproveBuyer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tx = await contract.approveBuyer(buyerAddress);
      await tx.wait();
      setSuccess('Buyer approved successfully!');
      setBuyerAddress('');
    } catch (err) {
      setError(err.message || 'Error approving buyer');
    }
    setLoading(false);
  };

  const handleRegisterAndVerifyProducer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tx = await contract.registerAndVerifyProducer(producerGst, producerLocation);
      await tx.wait();
      setSuccess('Producer registered and verified successfully!');
      setProducerGst('');
      setProducerLocation('');
    } catch (err) {
      setError(err.message || 'Error registering producer');
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <div className="flex justify-center p-4">
        <button
          onClick={() => setShowModal(!showModal)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Admin Actions
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Producer Actions</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Action Buttons */}
            {!modalType && (
              <div className="space-y-4">
                <button
                  onClick={() => handleOpenModal('buyer')}
                  className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Approve Buyer
                </button>
                <button
                  onClick={() => handleOpenModal('producer')}
                  className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Register & Verify Producer
                </button>
              </div>
            )}

            {/* Buyer Approval Form */}
            {modalType === 'buyer' && (
              <form onSubmit={handleApproveBuyer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer Address
                  </label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Enter buyer's address"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </form>
            )}

            {/* Producer Registration Form */}
            {modalType === 'producer' && (
              <form onSubmit={handleRegisterAndVerifyProducer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={producerGst}
                    onChange={(e) => setProducerGst(e.target.value)}
                    placeholder="Enter GST number"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={producerLocation}
                    onChange={(e) => setProducerLocation(e.target.value)}
                    placeholder="Enter location"
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="flex-1 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Register & Verify'}
                  </button>
                </div>
              </form>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;