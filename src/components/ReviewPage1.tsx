import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import html2pdf from "html2pdf.js";
import { ChevronDown, ChevronUp, Edit2, Save, X, FileDown, ArrowLeft, Eye } from 'lucide-react';
import Navbar from "./Navbar";
import CustomizationPanel from './CustomizationPanel';

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
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [styles, setStyles] = useState({
    color: '#333333',
    fontFamily: 'Arial',
});

  const { companyName, companyDescription, selectedFile } = location.state || {};

  const generatePDF = (styles) => {
    if (!sections.length) {
        alert("The response is still generating. Please wait!");
        return;
    }

    const fileName = `${companyName.replace(/\s+/g, '_')}_RFP_Response.pdf`;

    const printContent = document.createElement("div");
    printContent.id = "print-content";

    const customStyles = `
      <style>
        body { 
          font-family: ${styles.fontFamily}, sans-serif;
          color: ${styles.textColor};
        }
        h1 { 
          font-size: 32px;
          color: ${styles.textColor};
          text-align: center;
          margin-top: 50px;
          font-weight: 700;
        }
        h2 { 
          font-size: ${styles.headingFontSize};
          color: ${styles.headingColor};
          margin-top: 40px;
          font-weight: 600;
        }
        p { 
          font-size: ${styles.textFontSize};
          line-height: 1.8;
          margin: 12px 0;
          color: ${styles.textColor};
        }
        .title-page {
          page-break-after: always;
          text-align: center;
          padding: 80px 50px;
          border-bottom: 2px solid #e5e7eb;
        }
        .section {
          page-break-after: always;
          padding: 40px;
        }
        .metadata {
          margin-top: 30px;
          color: #6b7280;
          font-size: 16px;
        }
        .metadata p {
          margin: 8px 0;
        }
      </style>
    `;

    const titlePage = document.createElement("div");
    titlePage.className = "title-page";
    titlePage.innerHTML = `
      ${customStyles}
      <h1>RFP Response Document</h1>
      <div class="metadata">
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${projectName ? `<p><strong>Project Name:</strong> ${projectName}</p>` : ""}
      </div>
    `;
    printContent.appendChild(titlePage);

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
        margin: [20, 20, 20, 20],
        filename: fileName,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
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

  const startEditing = (section: Section) => {
    setEditingSection(section.title);
    setEditContent(section.content.replace(/<br\/?>/g, '\n'));
  };

  const saveEdits = () => {
    setSections(sections.map(section => 
      section.title === editingSection
        ? { ...section, content: editContent.replace(/\n/g, '<br/>') }
        : section
    ));
    setEditingSection(null);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent("");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Sidebar Navigation */}
        <div className={`fixed top-16 left-0 h-full bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Document Sections</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => toggleSection("Title Page")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    expandedSection === "Title Page" ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  Title Page
                </button>
              </li>
              {sections.map((section, index) => (
                <li key={index}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      expandedSection === section.title ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">RFP Response Review</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                  <button
                    onClick={() => generatePDF(styles)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <FileDown size={20} />
                    Export PDF
                  </button>
              </div>
            </div>

            {/* Add Customization Panel Here */}
            <CustomizationPanel setStyles={setStyles} />

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Generating your response...</p>
                </div>
              </div>
            ) : (
              <div
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              style={{
                color: styles.color,
                fontFamily: styles.fontFamily,
              }}
            >
                {/* Title Page */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection("Title Page")}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Title Page</h2>
                    {expandedSection === "Title Page" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === "Title Page" && (
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="space-y-2 text-gray-600">
                        <p><strong>Company:</strong> {companyName}</p>
                        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                        {projectName && <p><strong>Project Name:</strong> {projectName}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Sections */}
                {sections.map((section, index) => (
                  <div key={index} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                      <div className="flex items-center gap-2">
                        {expandedSection === section.title && editingSection !== section.title && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(section);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {expandedSection === section.title ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    {expandedSection === section.title && (
                      <div className="px-6 py-4 bg-gray-50">
                        {editingSection === section.title ? (
                          <div className="space-y-4">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-64 p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelEditing}
                                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition"
                              >
                                <X size={18} />
                                Cancel
                              </button>
                              <button
                                onClick={saveEdits}
                                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                <Save size={18} />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                            className="prose max-w-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;