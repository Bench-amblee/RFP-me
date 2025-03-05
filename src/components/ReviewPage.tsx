import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import html2pdf from "html2pdf.js";
import Navbar from "../components/Navbar";

const API_BASE_URL = "https://rfp-me-backend.onrender.com";
const TEST_MODE = true;

interface Section {
  title: string;
  content: string;
}

const ReviewPage = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("Title Page");
  const navigate = useNavigate();
  const location = useLocation();

  const { companyName, companyDescription, selectedFile } = location.state || {};

  const generatePDF = () => {
    if (!sections.length) {
        alert("The response is still generating. Please wait!");
        return;
    }

    const fileName = `${companyName.replace(/\s+/g, '_')}_RFP_Response.pdf`;

    // Create a hidden printable area with all sections expanded
    const printContent = document.createElement("div");
    printContent.id = "print-content";

    // Add custom styles
    const styles = `
        <style>
            body { font-family: Arial, sans-serif; }
            h1, h2 { color: #2C3E50; margin-bottom: 10px; }
            h1 { font-size: 28px; text-align: center; margin-top: 50px; }
            h2 { font-size: 22px; margin-top: 30px; }
            p, div { font-size: 14px; line-height: 1.6; margin: 5px 0; }
            .title-page { page-break-after: always; text-align: center; padding: 50px; }
            .section { page-break-after: always; padding: 20px; }
        </style>
    `;

    // Title Page
    const titlePage = document.createElement("div");
    titlePage.className = "title-page";
    titlePage.innerHTML = `
        ${styles}
        <h1>RFP Response</h1>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${projectName ? `<p><strong>Project Name:</strong> ${projectName}</p>` : ""}
    `;
    printContent.appendChild(titlePage);

    // Each section on a new page
    sections.forEach((section) => {
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section";
        sectionDiv.innerHTML = `
            <h2>${section.title}</h2>
            ${DOMPurify.sanitize(section.content)}
        `;
        printContent.appendChild(sectionDiv);
    });

    document.body.appendChild(printContent);
    printContent.style.display = "block";

    const options = {
        margin: 10,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    setTimeout(() => {
        html2pdf().set(options).from(printContent).save().then(() => {
            document.body.removeChild(printContent);
        });
    }, 500);
};

  useEffect(() => {
    if (!selectedFile || !companyName || !companyDescription) {
      alert("Missing required data. Redirecting...");
      navigate("/");
      return;
    }

    setIsLoading(true);

    if (TEST_MODE) {
      const staticResponse = `
        <h2>Executive Summary</h2>
        <p>Thank you for considering us for your project. Our solutions are tailored to meet your needs.</p>
        
        <h2>Project Approach</h2>
        <p>We follow a structured methodology to ensure project success...</p>
        
        <h2>Pricing and Deliverables</h2>
        <p>Our pricing model is flexible and transparent...</p>
        
        <h2>Conclusion</h2>
        <p>We look forward to collaborating and driving success together...</p>
      `;

      parseAndSetSections(staticResponse);
      setIsLoading(false);
    } else {
      const fetchAIResponse = async () => {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("description", companyDescription);

        const res = await fetch(`${API_BASE_URL}/process_rfp`, {
          method: "POST",
          body: formData,
        });

        const responseText = await res.text();
        parseAndSetSections(responseText);
        setIsLoading(false);
      };

      fetchAIResponse();
    }
  }, [selectedFile, companyName, companyDescription, navigate]);

  const parseAndSetSections = (htmlResponse: string) => {
    const sectionTitles = [
      "Executive Summary",
      "Project Approach",
      "Pricing and Deliverables",
      "Conclusion",
    ];

    const newSections: Section[] = [];
    let currentSection: Section | null = null;
    const lines = htmlResponse.split(/<br\/?>|\n/);

    lines.forEach((line) => {
      const titleMatch = sectionTitles.find((title) => line.includes(title));
      if (titleMatch) {
        if (currentSection) {
          newSections.push(currentSection);
        }
        currentSection = { title: titleMatch, content: "" };
      } else if (currentSection) {
        currentSection.content += line + "<br/>";
      }

      const projectNameMatch = line.match(/Project Name[:\s]*(.*)/i);
      if (projectNameMatch && !projectName) {
        setProjectName(projectNameMatch[1]);
      }
    });

    if (currentSection) {
      newSections.push(currentSection);
    }

    setSections(newSections);
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSection((prev) => (prev === sectionTitle ? null : sectionTitle));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Your RFP Response</h1>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-700 italic animate-pulse">Generating response...</p>
            </div>
          ) : (
            <div id="response-content" className="bg-white p-6 rounded-lg shadow-md space-y-4">
              {/* Title Page */}
              <div className="border-b pb-4 mb-4">
                <button
                  onClick={() => toggleSection("Title Page")}
                  className="w-full text-left focus:outline-none"
                >
                  <h2 className="text-4xl font-bold mb-2">RFP Response</h2>
                </button>
                {expandedSection === "Title Page" && (
                  <div className="text-lg">
                    <p><strong>Company:</strong> {companyName}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    {projectName && <p><strong>Project Name:</strong> {projectName}</p>}
                  </div>
                )}
              </div>

              {/* Collapsible Sections */}
              {sections.map((section, index) => (
                <div key={index} className="border-b pb-4 mb-4">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full text-left focus:outline-none"
                  >
                    <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  </button>
                  {expandedSection === section.title && (
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
            >
              Back to Upload
            </button>

            <button
              onClick={generatePDF}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Download as PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;