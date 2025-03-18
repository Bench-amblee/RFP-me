import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import edjsHTML from "editorjs-html";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { ChevronDown, ChevronUp, Edit2, Save, X, FileDown, ArrowLeft, } from 'lucide-react';
import Navbar from "./Navbar";
import CustomizationPanel from './CustomizationPanel';
import RfpContext from "./RfpContext";
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';


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
  console.log("Starting PDF generation");
  
  if (!sections.length) {
    alert("The response is still generating. Please wait!");
    return;
  }

  const fileName = `${companyName.replace(/\s+/g, '_')}_RFP_Response.pdf`;
  
  // Build document content
  const content = [];
  
  // Add title page
  content.push(
    { text: 'RFP Response Document', fontSize: 24, alignment: 'center', margin: [0, 50, 0, 20] },
    { text: `Company: ${companyName}`, margin: [0, 5] },
    { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 5] },
  );
  
  // Process each section
  sections.forEach(section => {
    // Add section heading
    content.push({ 
      text: section.title, 
      fontSize: 18,
      margin: [0, 20, 0, 10], 
      pageBreak: 'before' 
    });
    
    // Extract the actual content from various possible formats
    let sectionContent = '';
    let listItems = [];
    
    try {
      // If content is stored in the API format with type and data
      if (section.content && typeof section.content === 'object') {
        if (section.content.type === 'paragraph' && section.content.data) {
          // Preserve line breaks in PDFs by using an array of text objects
          const lines = section.content.data.split('\n');
          lines.forEach((line, idx) => {
            content.push({
              text: line,
              fontSize: 12,
              margin: idx === 0 ? [0, 10, 0, 0] : [0, 5, 0, 0]
            });
          });
        } else if (section.content.type === 'list' && Array.isArray(section.content.data)) {
          listItems = section.content.data;
          hasContent = true;
        }
      }
      // If content is stored as Editor.js JSON string
      else if (typeof section.content === 'string') {
        try {
          const parsedContent = JSON.parse(section.content);
          
          if (parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
            // Combine all blocks into a single content string
            sectionContent = parsedContent.blocks
              .filter(block => block.type === 'paragraph')
              .map(block => block.data.text)
              .join('\n\n');
              
            // Extract list items if any
            const listBlocks = parsedContent.blocks.filter(block => block.type === 'list');
            if (listBlocks.length > 0 && listBlocks[0].data.items) {
              listItems = listBlocks[0].data.items;
            }
          }
        } catch (e) {
          // If it's not valid JSON, use it as plain text
          sectionContent = section.content;
        }
      }
      
      // Add the extracted content to the PDF
      if (sectionContent) {
        content.push({ 
          text: sectionContent, 
          fontSize: 12,
          margin: [0, 10, 0, 15] 
        });
      }
      
      // Add list items if any
      if (listItems.length > 0) {
        content.push({
          ul: listItems.map(item => ({
            text: item,
            margin: [0, 5]
          }))
        });
      }
      
    } catch (error) {
      console.error(`Error processing section ${section.title}:`, error);
      // Fallback to displaying raw content
      content.push({ 
        text: `[Error displaying content: ${error.message}]`, 
        fontSize: 12,
        margin: [0, 10, 0, 15],
        color: 'red'
      });
    }
  });
  
  // Define document
  const docDefinition = {
    content: content,
    defaultStyle: {
      fontSize: 12
    }
  };
  
  try {
    console.log("Creating PDF with pdfMake");
    pdfMake.createPdf(docDefinition).download(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
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
    console.log("Starting editing for:", section.title);
    setEditingSection(section.title);
  
    if (editorRef.current) {
      editorRef.current.destroy();
    }
  
    // Create editor.js data structure
    let editorData = { blocks: [] };
    
    try {
      // Handle API format (type + data)
      if (section.content && typeof section.content === 'object') {
        console.log("Processing API format content:", section.content);
        
        if (section.content.type === 'paragraph') {
          // Add paragraph block
          editorData = {
            blocks: [{
              type: 'paragraph',
              data: {
                text: section.content.data
              }
            }]
          };
        } else if (section.content.type === 'list' && Array.isArray(section.content.data)) {
          // Add list block
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
      // Try to parse if it's a JSON string (Editor.js format)
      else if (typeof section.content === 'string') {
        try {
          const parsedContent = JSON.parse(section.content);
          if (parsedContent.blocks) {
            editorData = parsedContent;
          } else {
            // If it's JSON but not in Editor.js format
            editorData = {
              blocks: [{
                type: 'paragraph',
                data: {
                  text: section.content
                }
              }]
            };
          }
        } catch (e) {
          // If it's not valid JSON, use as plain text
          editorData = {
            blocks: [{
              type: 'paragraph',
              data: {
                text: section.content
              }
            }]
          };
        }
      }
      
      console.log("Initializing editor with data:", editorData);
    } catch (error) {
      console.error("Error preparing content for editor:", error);
      // Initialize with empty block on error
      editorData = {
        blocks: [{
          type: 'paragraph',
          data: {
            text: ''
          }
        }]
      };
    }
  
    // Initialize the editor with a short delay
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
      console.log("Editor saved data:", outputData);
      
      // Extract text content from each block for API format
      let paragraphContent = "";
      let listItems = [];
      
      if (outputData.blocks && outputData.blocks.length > 0) {
        outputData.blocks.forEach((block, index) => {
          if (block.type === 'paragraph') {
            // Append paragraph text with proper line breaks
            if (paragraphContent) {
              // Add double newline between paragraphs
              paragraphContent += "\n\n" + block.data.text;
            } else {
              paragraphContent = block.data.text;
            }
          } else if (block.type === 'list' && block.data.items) {
            // Collect list items
            listItems = [...listItems, ...block.data.items];
          }
        });
      }
      
      // Determine content format to save
      let newContent;
      if (listItems.length > 0) {
        // If list items were found, save as list type
        newContent = {
          type: 'list',
          data: listItems
        };
      } else {
        // Otherwise save as paragraph type
        newContent = {
          type: 'paragraph',
          data: paragraphContent || ""
        };
      }
      
      console.log("Saving section with content:", newContent);
      
      // Update sections with the new content
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
                                    // Split paragraph text by newlines and add <br> tags
                                    const formattedText = contentObj.data
                                      .split('\n')
                                      .map((line, index) => (
                                        <React.Fragment key={index}>
                                          {line}
                                          {index < contentObj.data.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                      ));
                                    
                                    return <p>{formattedText}</p>;
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
                                                // Preserve line breaks in paragraph content
                                                const text = block.data.text.replace(/\n/g, '<br>');
                                                return `<p>${text}</p>`;
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