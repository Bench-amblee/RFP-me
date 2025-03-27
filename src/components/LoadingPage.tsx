import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RfpContext from "./RfpContext";
import { Loader } from "lucide-react";

const API_BASE_URL = "https://rfp-me-backend.onrender.com";
// Set to true for quick testing without API calls
const TEST_MODE = true;

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const { companyName, companyDescription, file, setResponseData } = useContext(RfpContext) || {};
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !companyName || !companyDescription) {
      navigate("/upload");
      return;
    }

    const fetchAIResponse = async () => {
      try {
        setProgress(10);
        setStatusMessage("Starting request processing...");

        // Use test data for quick development and testing
        if (TEST_MODE) {
          setProgress(30);
          setStatusMessage("Analyzing RFP document...");
          
          setTimeout(() => {
            setProgress(60);
            setStatusMessage("Generating response...");
          }, 1000);
          
          setTimeout(() => {
            setProgress(90);
            setStatusMessage("Finalizing document...");
            
            const staticResponse = {
              response: [
                { 
                  title: "Executive Summary", 
                  content: "<p>Thank you for considering our services. We are excited to present this comprehensive proposal that addresses all your requirements while leveraging our company's unique expertise and experience.</p><p>Our team has carefully analyzed your RFP and developed a tailored approach that aligns with your objectives and timeline. We are confident in our ability to deliver exceptional results that exceed your expectations.</p>" 
                },
                { 
                  title: "Project Approach", 
                  content: "<p>Our methodology for this project follows a proven framework that ensures quality, efficiency, and transparency throughout the engagement:</p><ul><li>Initial assessment and planning phase</li><li>Design and development with regular checkpoints</li><li>Comprehensive testing and quality assurance</li><li>Implementation with minimal disruption</li><li>Ongoing support and optimization</li></ul>" 
                },
                { 
                  title: "Pricing and Deliverables", 
                  content: "<p>We have prepared a competitive pricing structure that provides excellent value while ensuring the highest quality deliverables:</p><ul><li>Complete project documentation</li><li>All source files and assets</li><li>Training and knowledge transfer</li><li>90-day support period</li></ul><p>Our pricing is transparent with no hidden costs or surprises.</p>" 
                },
                { 
                  title: "Timeline and Milestones", 
                  content: "<p>We propose the following timeline to ensure timely delivery of all project components:</p><ul><li><strong>Week 1-2:</strong> Discovery and planning</li><li><strong>Week 3-6:</strong> Development and implementation</li><li><strong>Week 7-8:</strong> Testing and refinement</li><li><strong>Week 9:</strong> Final delivery and deployment</li></ul>" 
                },
                { 
                  title: "Team and Expertise", 
                  content: "<p>Our dedicated team brings extensive experience in similar projects:</p><ul><li>Project Manager with 10+ years of experience</li><li>Senior technical specialists in all required domains</li><li>Quality assurance professionals</li><li>Dedicated customer success manager</li></ul>" 
                },
                { 
                  title: "Conclusion", 
                  content: "<p>We believe our proposal represents the ideal balance of expertise, quality, and value. Our team is fully prepared to begin work immediately upon selection and is committed to delivering excellent results.</p><p>Thank you for considering our proposal. We look forward to the opportunity to collaborate with you on this important project.</p>" 
                }
              ]
            };

            setResponseData(JSON.stringify(staticResponse));
            setProgress(100);
            navigate("/review");
          }, 2000);
          
          return;
        }

        // Real API call if not in test mode
        setProgress(20);
        setStatusMessage("Preparing data...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", companyDescription);

        setProgress(30);
        setStatusMessage("Sending data to AI...");

        const res = await fetch(`${API_BASE_URL}/process_rfp`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        setProgress(60);
        setStatusMessage("Processing AI response...");
        
        const data = await res.json();
        
        if (!data || !data.response) {
          throw new Error("Invalid response format from API");
        }
        
        setProgress(90);
        setStatusMessage("Preparing document...");
        
        setResponseData(JSON.stringify(data));
        
        setProgress(100);
        setStatusMessage("Complete!");
        
        // Ensure 100% progress is shown before navigating
        setTimeout(() => {
          navigate("/review");
        }, 500);
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setProgress(0);
      }
    };

    fetchAIResponse();
  }, [file, companyName, companyDescription, navigate, setResponseData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Generating Your RFP Response
        </h2>
        
        {error ? (
          <div className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">An error occurred</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/upload")}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Back to Upload
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-6">
              <Loader className="animate-spin h-12 w-12 text-blue-600" />
            </div>
            
            <p className="text-gray-600 text-center mb-6">{statusMessage}</p>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Processing company: {companyName}</p>
              <p>File: {file?.name}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingPage;

