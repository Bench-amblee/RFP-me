import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const UploadPage = ({ companyName, setCompanyName, companyDescription, setCompanyDescription, file, setFile }) => {  
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!file || !companyName || !companyDescription) {
      alert("Please fill in all fields.");
      return;
    }
    navigate("/review"); // Redirect to review page
  };

  return (
    <>
    <Navbar /> {/* Add this at the top */}
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Rest of the Upload page content */}
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Upload RFP & Company Info</h1>
      
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4"/>
      
      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="border p-2 mb-4 w-80 rounded"
      />

      <textarea
        placeholder="Company Description"
        value={companyDescription}
        onChange={(e) => setCompanyDescription(e.target.value)}
        className="border p-2 mb-4 w-80 rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Generate Response
      </button>
    </div>
  </div>
  </>
  );
};

export default UploadPage;