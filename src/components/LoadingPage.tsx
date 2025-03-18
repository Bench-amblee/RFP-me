import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RfpContext from "../components/RfpContext";

const API_BASE_URL = "https://rfp-me-backend.onrender.com";
const TEST_MODE = true;

const LoadingPage = () => {
  const navigate = useNavigate();
  const { companyName, companyDescription, file, setResponseData } = useContext(RfpContext) || {};
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!file || !companyName || !companyDescription) {
      alert("Missing required data. Redirecting...");
      navigate("/");
      return;
    }

    const fetchAIResponse = async () => {
      setProgress(20);

      if (TEST_MODE) {
        setTimeout(() => {
          const staticResponse = {
            response: [
              { title: "Executive Summary", content: JSON.stringify({ blocks: [{ type: "paragraph", data: { text: "Thank you for considering us..." } }] }) },
              { title: "Project Approach", content: JSON.stringify({ blocks: [{ type: "paragraph", data: { text: "We follow a structured methodology..." } }] }) },
              { title: "Pricing and Deliverables", content: JSON.stringify({ blocks: [{ type: "paragraph", data: { text: "Our team will create high quality deliverables..." } }] }) },
              { title: "Conclusion", content: JSON.stringify({ blocks: [{ type: "paragraph", data: { text: "We will ensure high quality work..." } }] }) },

            ]
          };

          // ✅ Store in RfpContext (so ReviewPage can access it)
          setResponseData(JSON.stringify(staticResponse));

          setProgress(100);
          navigate("/review");
        }, 2000);
        return;
      }

      setProgress(40);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", companyDescription);

      try {
        const res = await fetch(`${API_BASE_URL}/process_rfp`, {
          method: "POST",
          body: formData,
        });

        setProgress(70);

        const parsedData = await res.json();

        if (!parsedData.response || !Array.isArray(parsedData.response)) {
          alert("Unexpected response format. Please try again.");
          return;
        }
        console.log("Response from API:", parsedData);
        console.log("Type of parsedData:", typeof parsedData);
        console.log("Setting response data to:", typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData));
        // ✅ Store response in RfpContext
        setResponseData(typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData));

        setProgress(100);
        navigate("/review");
      } catch (error) {
        console.error("Fetch error:", error);
        alert("An error occurred. Please try again.");
      }
    };

    fetchAIResponse();
  }, [file, companyName, companyDescription, navigate, setResponseData]); // ✅ Add setResponseData to dependencies

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <h2 className="text-xl font-semibold mb-4">Generating RFP Response...</h2>
      <div className="w-1/2 bg-gray-300 rounded-full h-6 overflow-hidden">
        <div
          className="bg-blue-600 h-full"
          style={{ width: `${progress}%`, transition: "width 0.5s ease-in-out" }}
        ></div>
      </div>
      <p className="mt-2 text-gray-600">{progress}%</p>
    </div>
  );
};

export default LoadingPage;

