import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import edjsHTML from "editorjs-html";
import html2pdf from "html2pdf.js";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { ChevronDown, ChevronUp, Edit2, Save, X, FileDown, ArrowLeft, Eye } from 'lucide-react';
import Navbar from "./Navbar";
import CustomizationPanel from './CustomizationPanel';

const API_BASE_URL = "https://rfp-me-backend.onrender.com";
const TEST_MODE = false;

interface Section {
  title: string;
  content: string;
}

const ReviewPage = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(["Title Page"]);

  useEffect(() => {
    if (sections.length > 0) {
      setExpandedSections(sections.map((section) => section.title).concat("Title Page"));
    }
  }, [sections]);

  const [styles, setStyles] = useState({
    color: '#333333',
    fontFamily: 'Arial',
});

  const { companyName, companyDescription, selectedFile } = location.state || {};

  const convertTextFormatting = (text) => {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold (**bold**)
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italics (*italic*)
        .replace(/__(.*?)__/g, "<u>$1</u>"); // Underline (__underline__)
};
  const edjsParser = edjsHTML({
    header: (block) => `<h${block.data.level}>${block.data.text}</h${block.data.level}>`,
    paragraph: (block) => `<p>${convertTextFormatting(block.data.text)}</p>`,
    list: (block) => {
        const listTag = block.data.style === "unordered" ? "ul" : "ol";
        return `<${listTag}>${block.data.items.map(item => `<li>${convertTextFormatting(item)}</li>`).join('')}</${listTag}>`;
    },
    marker: (block) => `<strong>${block.data.text}</strong>`, // Convert marker (highlight) to bold
});

const convertEditorJSToHTML = (editorContent) => {
  try {
      if (!editorContent) return "";
      
      const parsedContent = JSON.parse(editorContent); // 👈 Parse Editor.js JSON
      return edjsParser.parse(parsedContent); // 👈 Use edjsHTML parser
  } catch (error) {
      console.error("Error parsing EditorJS content:", error);
      return "";
  }
};


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
      body { font-family: ${styles.fontFamily}, sans-serif; color: ${styles.textColor}; }
      h1 { font-size: 32px; color: ${styles.textColor}; text-align: center; margin-top: 50px; font-weight: 700; }
      h2 { font-size: ${styles.headingFontSize}; color: ${styles.headingColor}; margin-top: 40px; font-weight: 600; }
      p { font-size: ${styles.textFontSize}; line-height: 1.8; margin: 12px 0; color: ${styles.textColor}; }
      strong { font-weight: bold; } 
      em { font-style: italic; } 
      u { text-decoration: underline; }
      ul, ol { margin-left: 20px; }
      li { margin-bottom: 8px; }
      span[style*="color"] { color: inherit !important; } /* Preserve inline colors */
      
      /* Ensure each section starts on a new page */
      .section {
          page-break-before: always;
          padding: 40px;
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
          <h2 style="color: ${styles.headingColor};">${section.title}</h2>
          <div style="color: ${styles.textColor}; font-family: ${styles.fontFamily}, sans-serif;">
              ${convertEditorJSToHTML(section.content)}
          </div>
      `;
      printContent.appendChild(sectionDiv);
  });

  document.body.appendChild(printContent);
  printContent.style.display = "block";

  const options = {
      margin: [20, 20, 20, 20],
      filename: fileName,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { 
          scale: 3, // Higher scale for better quality
          useCORS: true,
          dpi: 300, 
          letterRendering: true // Ensures proper text rendering
      },
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

      const staticResponse = {
        time: Date.now(),
        blocks: [
          { type: "header", data: { text: "Executive Summary", level: 2 } },
          { type: "paragraph", data: { text: "Thank you for considering us for your project..." } },
          { type: "header", data: { text: "Project Approach", level: 2 } },
          { type: "paragraph", data: { text: "We follow a structured methodology to ensure project success..." } },
          { type: "header", data: { text: "Pricing and Deliverables", level: 2 } },
          { type: "paragraph", data: { text: "Our pricing model is flexible and transparent..." } },
          { type: "header", data: { text: "Conclusion", level: 2 } },
          { type: "paragraph", data: { text: "We look forward to collaborating and driving success together..." } }
        ]
      };

      parseAndSetSections(JSON.stringify(staticResponse));
      setIsLoading(false);
    } else {
      const fetchAIResponse = async () => {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("description", companyDescription);
    
        try {
            const res = await fetch(`${API_BASE_URL}/process_rfp`, {
                method: "POST",
                body: formData,
            });
    
            const responseText = await res.text();
            console.log("Raw API Response:", responseText);
    
            const parsedData = JSON.parse(responseText);
    
            // ✅ Check if the response contains an error
            if (parsedData.error) {
                console.error("Backend Error:", parsedData.error);
                alert(`Error: ${parsedData.error}`); // Show an alert for user feedback
                return;
            }
    
            // ✅ Check if response key exists and is an array
            if (!parsedData.response || !Array.isArray(parsedData.response)) {
                console.error("Unexpected response format:", parsedData);
                alert("Unexpected response format. Please try again.");
                return;
            }
    
            parseAndSetSections(responseText);
            setIsLoading(false);
    
        } catch (error) {
            console.error("Fetch error:", error);
            alert("An error occurred while fetching data. Please try again.");
        }
    };

      fetchAIResponse();
    }
  }, [selectedFile, companyName, companyDescription, navigate]);

  const parseAndSetSections = (jsonResponse: string) => {
    try {
        const parsedData = JSON.parse(jsonResponse);
        console.log("Parsed JSON:", parsedData); // Debugging

        // Check for response format variations
        const sectionsArray = parsedData.response || parsedData.sections;
        
        if (!sectionsArray || !Array.isArray(sectionsArray)) {
            console.error("Invalid response format:", parsedData);
            return;
        }

        const sections = sectionsArray.map((section) => ({
            title: section.title || "Untitled Section", // Fallback for missing titles
            content: section.content?.data || "", // Ensure content exists
            type: section.content?.type || "paragraph", // Default type
        }));

        setSections(sections);
    } catch (error) {
        console.error("Error parsing JSON response:", error);
    }
};
  
  

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prevExpanded => 
      prevExpanded.includes(sectionTitle)
        ? prevExpanded.filter(title => title !== sectionTitle) // Collapse if open
        : [...prevExpanded, sectionTitle] // Expand if closed
    );
  };

  const startEditing = (section: Section) => {
    console.log("🚀 startEditing() triggered for:", section.title);
    setEditingSection(section.title);
  
    if (editorRef.current) {
      editorRef.current.destroy();
    }
  
    let parsedContent;
    try {
      parsedContent = section.content ? JSON.parse(section.content) : { blocks: [] };
    } catch (error) {
      console.error("Error parsing section content:", error);
      parsedContent = { blocks: [] };
    }
  
    setTimeout(() => {
      editorRef.current = new EditorJS({
        holder: 'editor-js-container',
        tools: {
          header: Header,
          list: List,
          paragraph: Paragraph,
        },
        data: parsedContent, // 👈 Ensure this is properly formatted
      });
    }, 100);
  };


const saveEdits = async () => {
  if (!editorRef.current) return;

  try {
    const outputData = await editorRef.current.save(); // Keep this as JSON

    setSections(prevSections =>
      prevSections.map(section =>
        section.title === editingSection
          ? { ...section, content: JSON.stringify(outputData) } 
          : section
      )
    );

    setEditingSection(null);
  } catch (error) {
    console.error("Error saving edits:", error);
  }
};
  const cancelEditing = () => {
    setEditingSection(null);
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
                    expandedSections.includes("Title Page") ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
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
                      expandedSections.includes(section.title) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
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
                    {expandedSections.includes("Title Page") ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSections.includes("Title Page") && (
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
                        {expandedSections.includes(section.title) && editingSection !== section.title && (
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
                        {expandedSections.includes(section.title) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    {expandedSections.includes(section.title) && (
                      <div className="px-6 py-4 bg-gray-50">
                        {editingSection === section.title ? (
                          <div className="space-y-4">
                            <div id="editor-js-container" className="border p-4 rounded-lg bg-white shadow-sm"></div>
  
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
                          <div>
                            {(() => {
                              try {
                                const contentData = section.content ? JSON.parse(section.content) : null;
                                return (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(
                                        contentData
                                          ? contentData.blocks.map((block: any) => `<p>${block.data.text}</p>`).join('\n')
                                          : section.content // If not JSON, render as-is
                                      ),
                                    }}
                                  />
                                );
                              } catch (error) {
                                console.error("Error parsing section content:", error);
                                return <p>{section.content}</p>; // Render raw text if parsing fails
                              }
                            })()}
                          </div>
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