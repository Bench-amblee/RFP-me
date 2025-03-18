import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import edjsHTML from "editorjs-html";
import html2pdf from "html2pdf.js";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { ChevronDown, ChevronUp, Edit2, Save, X, FileDown, ArrowLeft, } from 'lucide-react';
import Navbar from "./Navbar";
import CustomizationPanel from './CustomizationPanel';
import RfpContext from "./RfpContext";

interface Section {
  title: string;
  content: string;
}

const ReviewPage = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [projectName] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const [sidebarOpen] = useState(true);
  const navigate = useNavigate();
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

const context = useContext(RfpContext);
    if (!context) {
  throw new Error("ReviewPage must be used within an RfpProvider");
    }
const { companyName, companyDescription, file, responseData } = context;

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

const convertContentToHTML = (content) => {
  try {
    // If it's already a string, return it
    if (typeof content === 'string') return content;
    
    // Handle your API's content format
    if (content && typeof content === 'object') {
      if (content.type === 'paragraph') {
        return `<p>${convertTextFormatting(content.data)}</p>`;
      } else if (content.type === 'list' && Array.isArray(content.data)) {
        // Use proper HTML list with bullet points
        return `<ul style="list-style-type: disc; padding-left: 20px; margin: 12px 0;">
          ${content.data.map(item => `<li style="margin-bottom: 8px;">${convertTextFormatting(item)}</li>`).join('')}
        </ul>`;
      }
    }
    
    // Rest of your function remains the same
    // ...
  } catch (error) {
    console.error("Error converting content to HTML:", error);
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
    body { font-family: ${styles.fontFamily || 'Arial'}, sans-serif; color: ${styles.textColor || '#333'}; }
    h1 { font-size: 32px; color: ${styles.textColor || '#333'}; text-align: center; margin-top: 50px; font-weight: 700; }
    h2 { font-size: ${styles.headingFontSize || '24px'}; color: ${styles.headingColor || '#333'}; margin-top: 20px; padding-top: 20px; font-weight: 600; }
    p { font-size: ${styles.textFontSize || '16px'}; line-height: 1.8; margin: 12px 0; color: ${styles.textColor || '#333'}; }
    strong { font-weight: bold; } 
    em { font-style: italic; } 
    u { text-decoration: underline; }
    
    /* Improved list styling */
    ul { list-style-type: disc !important; margin-left: 20px !important; padding-left: 20px !important; }
    ol { list-style-type: decimal !important; margin-left: 20px !important; padding-left: 20px !important; }
    li { margin-bottom: 8px !important; display: list-item !important; }
    
    /* Ensure each section starts on a new page with consistent positioning */
    .section {
        page-break-before: always;
        padding: 40px;
        position: relative;
    }
    
    /* Add specific styling for section headings */
    .section h2 {
        position: relative;
        top: 0;
        margin-top: 20px;
        margin-bottom: 30px;
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
    
    // Create the heading element separately
    const headingElement = document.createElement("h2");
    headingElement.textContent = section.title;
    headingElement.style.color = styles.headingColor || '#333';
    
    sectionDiv.appendChild(headingElement);
    
    // Create the content container
    const contentDiv = document.createElement("div");
    contentDiv.style.color = styles.textColor || '#333';
    contentDiv.style.fontFamily = styles.fontFamily || 'Arial';
    contentDiv.innerHTML = convertContentToHTML(section.content);
    
    sectionDiv.appendChild(contentDiv);
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
    console.log("ResponseData received in ReviewPage:", responseData);
    console.log("Type of responseData:", typeof responseData);
    if (!file || !companyName || !companyDescription) {
      alert("Missing required data. Redirecting...");
      navigate("/");
      return;
    }
    parseAndSetSections(responseData || "[]"); // Default to empty array if responseData is null or undefined
  }, [file, companyName, companyDescription, responseData, navigate]);

  const parseAndSetSections = (jsonResponse) => {
    try {
      let parsedData;
      if (typeof jsonResponse === 'string') {
        parsedData = JSON.parse(jsonResponse);
      } else {
        parsedData = jsonResponse;
      }
      
      if (!parsedData || !parsedData.response || !Array.isArray(parsedData.response)) {
        console.error("Unexpected data structure:", parsedData);
        throw new Error("Unexpected response format");
      }
  
      // Just pass the sections as they are - don't try to manipulate the content
      const newSections = parsedData.response.map((section) => ({
        title: section.title,
        content: section.content
      }));
  
      setSections(newSections);
    } catch (error) {
      console.error("Error in parseAndSetSections:", error);
    }
  };
  
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prevExpanded => 
      prevExpanded.includes(sectionTitle)
        ? prevExpanded.filter(title => title !== sectionTitle) // Collapse if open
        : [...prevExpanded, sectionTitle] // Expand if closed
    );
  };

  const startEditing = (section) => {
    setEditingSection(section.title);
  
    if (editorRef.current) {
      editorRef.current.destroy();
    }
  
    // Create editor.js data format based on the content
    let editorData = { blocks: [] };
    
    if (section.content) {
      if (section.content.type === 'paragraph') {
        editorData = {
          blocks: [{
            type: 'paragraph',
            data: {
              text: section.content.data
            }
          }]
        };
      } else if (section.content.type === 'list' && Array.isArray(section.content.data)) {
        editorData = {
          blocks: [{
            type: 'list',
            data: {
              style: 'unordered',
              items: section.content.data
            }
          }]
        };
      }
    }
  
    setTimeout(() => {
      editorRef.current = new EditorJS({
        holder: 'editor-js-container',
        tools: {
          header: Header,
          list: List,
          paragraph: Paragraph,
        },
        data: editorData,
      });
    }, 100);
  };


  const saveEdits = async () => {
    if (!editorRef.current) return;
  
    try {
      const outputData = await editorRef.current.save();
      
      // Convert Editor.js format back to your API format
      let newContent = { type: 'paragraph', data: '' };
      
      if (outputData.blocks && outputData.blocks.length > 0) {
        const block = outputData.blocks[0];
        if (block.type === 'paragraph') {
          newContent = {
            type: 'paragraph',
            data: block.data.text
          };
        } else if (block.type === 'list') {
          newContent = {
            type: 'list',
            data: block.data.items
          };
        }
      }
  
      setSections(prevSections =>
        prevSections.map(section =>
          section.title === editingSection
            ? { ...section, content: newContent }
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
                                const contentObj = section.content;
                                
                                // Check if content is in the format returned by your API
                                if (contentObj && (contentObj.type === 'paragraph' || contentObj.type === 'list')) {
                                  if (contentObj.type === 'paragraph') {
                                    return <p>{contentObj.data}</p>;
                                  } else if (contentObj.type === 'list' && Array.isArray(contentObj.data)) {
                                    return (
                                      <ul className="list-disc pl-5 space-y-2">
                                        {contentObj.data.map((item, idx) => (
                                          <li key={idx}>{item}</li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                }
                                
                                // Try to handle it as Editor.js content (fallback)
                                try {
                                  const editorContent = typeof contentObj === 'string' 
                                    ? JSON.parse(contentObj) 
                                    : contentObj;
                                    
                                  if (editorContent && editorContent.blocks) {
                                    return (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: DOMPurify.sanitize(
                                            editorContent.blocks.map((block) => {
                                              if (block.type === 'paragraph') {
                                                return `<p>${block.data.text}</p>`;
                                              } else if (block.type === 'list') {
                                                const listItems = block.data.items
                                                  .map(item => `<li>${item}</li>`)
                                                  .join('');
                                                return block.data.style === 'unordered' 
                                                  ? `<ul>${listItems}</ul>` 
                                                  : `<ol>${listItems}</ol>`;
                                              } else {
                                                return '';
                                              }
                                            }).join('\n')
                                          ),
                                        }}
                                      />
                                    );
                                  }
                                } catch (e) {
                                  console.log("Not Editor.js format, displaying as is");
                                }
                                
                                // If all else fails, just display the content as a string
                                return <p>{JSON.stringify(contentObj)}</p>;
                              } catch (error) {
                                console.error("Error rendering section content:", error);
                                return <p>Error displaying content</p>;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>
    </>
  );  
};

export default ReviewPage;