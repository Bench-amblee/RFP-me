import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";

const UploadPage = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    console.log("Selected File:", selectedFile);
    console.log("Company Name:", companyName);
    console.log("Company Description:", companyDescription);

    if (!selectedFile || !companyName || !companyDescription) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Navigating to review page...",{
      selectedFile,
      companyName,
      companyDescription, 
    });
    navigate("/review", {
      state: {
        selectedFile,
        companyName,
        companyDescription,
      },
    }

    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File uploaded:", file.name);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    console.log("File removed");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Your RFP
            </h2>

            {/* File Upload */}
            <div className="mb-6">
              <label
                htmlFor="rfp-file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                RFP Document
              </label>

              <div
                className="border-2 border-dashed border-gray-300 rounded-md px-6 py-10 text-center transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drop your RFP document here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOCX, or TXT files up to 10MB
                </p>
              </div>

              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Display Selected File */}
            {selectedFile && (
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow border">
                <div>
                  <p className="font-semibold">File: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Company Name Input */}
            <div className="mb-6">
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name
              </label>
              <input
                type="text"
                id="company-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            {/* Company Description Input */}
            <div className="mb-6">
              <label
                htmlFor="company-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Description
              </label>
              <textarea
                id="company-description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your company and expertise"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium"
            >
              Generate RFP Response
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default UploadPage;