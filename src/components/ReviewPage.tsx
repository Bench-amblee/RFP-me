import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';


const API_BASE_URL = "https://rfp-me-backend.onrender.com";

const ReviewPage = ({ companyName, companyDescription, file }) => {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAIResponse = async () => {
      if (!file || !companyName || !companyDescription) {
        alert("Missing required data. Redirecting...");
        navigate("/");
        return;
      }

      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", companyDescription);

      const res = await fetch(`${API_BASE_URL}/process_rfp`, {
        method: "POST",
        body: formData,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setResponse((prev) => prev + decoder.decode(value, { stream: true })); // Update live
      }

      setIsLoading(false);
    };

    fetchAIResponse();
  }, [file, companyName, companyDescription, navigate]);

  return (
    <>
    <Navbar /> {/* Add this at the top */}
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">

      {/* Rest of the Home page content */}
      <div className="max-w-4xl mx-auto">      
      <h1 className="text-3xl font-bold mb-6 text-center">Your RFP Response</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-700 italic animate-pulse">Generating response...</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              
            {/* Render HTML Response with Tailwind Styles */}
            <div
              className="prose lg:prose-xl max-w-none mb-6 prose-headings:text-blue-700 prose-p:text-gray-700 prose-strong:text-black prose-ul:list-disc prose-ol:list-decimal prose-a:text-blue-500 hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: response }}
            />

              <div className="flex justify-between">
                <button
                  onClick={() => navigate("/")}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
                >
                  Back to Upload
                </button>

                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Download as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewPage;