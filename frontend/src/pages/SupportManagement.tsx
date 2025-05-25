import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- import useNavigate

const SupportProducts = () => {
  const navigate = useNavigate(); // <-- create navigate function

  const handleCustomerSupportClick = () => {
    navigate('/support-customer'); // <-- redirect to SupportCustomer page
  };

  const handleFarmerSupportClick = () => {
    navigate('/support-farmer'); // <-- redirect to SupportFarmer page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-12 text-gray-800">Support</h1>
      <div className="flex gap-10">
        <button 
          onClick={handleCustomerSupportClick}
          className="px-8 py-4 bg-blue-600 text-white text-xl rounded-xl hover:bg-blue-700 transition"
        >
          Customer Support
        </button>
        <button 
          onClick={handleFarmerSupportClick} // <-- add onClick handler for Farmer Support
          className="px-8 py-4 bg-green-600 text-white text-xl rounded-xl hover:bg-green-700 transition"
        >
          Farmer Support
        </button>
      </div>
    </div>
  );
};

export default SupportProducts;




