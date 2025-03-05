import React, { useState } from 'react';
import { FileText, Upload, BarChart3, Home, Image, Type, Palette, Save, ArrowLeft, ArrowRight } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [documentTitle, setDocumentTitle] = useState('RFP Response Document');
  const [selectedColor, setSelectedColor] = useState('#4169E1');
  
  const colorOptions = [
    '#4169E1', // Royal Blue (primary color from your design)
    '#4CAF50', // Green (accent color from your design)
    '#FF5722', // Deep Orange
    '#9C27B0', // Purple
    '#607D8B', // Blue Grey
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">RFP Generator</h1>
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md">
              <BarChart3 className="w-4 h-4 mr-2" />
              Review
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md rounded-lg p-4 mr-6">
          <h2 className="text-lg font-semibold mb-4">Document Tools</h2>
          
          <div className="space-y-4">
            <button 
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'editor' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('editor')}
            >
              <FileText className="w-5 h-5 mr-3" />
              <span>Editor</span>
            </button>
            
            <button 
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'images' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('images')}
            >
              <Image className="w-5 h-5 mr-3" />
              <span>Images</span>
            </button>
            
            <button 
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'typography' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('typography')}
            >
              <Type className="w-5 h-5 mr-3" />
              <span>Typography</span>
            </button>
            
            <button 
              className={`w-full flex items-center p-3 rounded-md ${activeTab === 'colors' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('colors')}
            >
              <Palette className="w-5 h-5 mr-3" />
              <span>Colors</span>
            </button>
          </div>
          
          <div className="mt-8">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              Save Document
            </button>
          </div>
        </div>

        {/* Document Preview and Editing Area */}
        <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
          {/* Document Navigation */}
          <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-b">
            <div className="flex items-center space-x-4">
              <button className="p-1 rounded hover:bg-gray-200">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="p-1 rounded hover:bg-gray-200">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div>
              <span className="text-sm text-gray-500">Page 1 of 5</span>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-8">
            {activeTab === 'editor' && (
              <div className="space-y-6">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0"
                  style={{ color: selectedColor }}
                />
                
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold" style={{ color: selectedColor }}>Executive Summary</h2>
                  <p className="my-4">
                    Our proposal addresses all requirements outlined in your RFP. We bring 15+ years of industry experience and a dedicated team of experts ready to deliver exceptional results on time and within budget.
                  </p>
                  
                  <h2 className="text-xl font-semibold mt-6" style={{ color: selectedColor }}>Company Background</h2>
                  <p className="my-4">
                    Founded in 2008, our company has successfully completed over 500 projects similar to yours. We pride ourselves on our innovative approach and commitment to client satisfaction.
                  </p>
                  
                  <h2 className="text-xl font-semibold mt-6" style={{ color: selectedColor }}>Proposed Solution</h2>
                  <p className="my-4">
                    Our comprehensive solution includes custom development, implementation, training, and ongoing support. We utilize cutting-edge technologies to ensure scalability and future-proof your investment.
                  </p>
                  
                  <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="italic text-gray-600">Click to edit this text. You can customize all content in this document including headings, paragraphs, and images.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Image Management</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center">Drag and drop an image here or click to upload</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Upload Image</button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Sample chart" 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium">Project Success Rate</p>
                      <div className="flex justify-between mt-2">
                        <button className="text-xs text-blue-600">Replace</button>
                        <button className="text-xs text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Recently Used Images</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Business chart" 
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Team meeting" 
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Workspace" 
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                      alt="Data analysis" 
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Typography Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                      <option>Montserrat</option>
                      <option>Poppins</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                      <option>Lato</option>
                      <option>Source Sans Pro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading Size</label>
                    <div className="flex items-center">
                      <input 
                        type="range" 
                        min="16" 
                        max="48" 
                        defaultValue="24" 
                        className="w-full mr-3"
                      />
                      <span className="text-sm text-gray-500">24px</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Text Size</label>
                    <div className="flex items-center">
                      <input 
                        type="range" 
                        min="12" 
                        max="24" 
                        defaultValue="16" 
                        className="w-full mr-3"
                      />
                      <span className="text-sm text-gray-500">16px</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Line Height</label>
                    <div className="flex items-center">
                      <input 
                        type="range" 
                        min="1" 
                        max="2" 
                        step="0.1" 
                        defaultValue="1.5" 
                        className="w-full mr-3"
                      />
                      <span className="text-sm text-gray-500">1.5</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Preview</h3>
                  <h1 className="text-2xl font-bold mb-2">Heading 1</h1>
                  <h2 className="text-xl font-semibold mb-2">Heading 2</h2>
                  <h3 className="text-lg font-medium mb-2">Heading 3</h3>
                  <p className="mb-2">This is a paragraph of text that demonstrates the body font style and size. The quick brown fox jumps over the lazy dog.</p>
                  <p className="text-sm">This is smaller text that might be used for captions or footnotes.</p>
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Color Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-gray-900' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                    <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme Preview</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                      <p className="text-sm text-center">Primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-md bg-gray-800"></div>
                      <p className="text-sm text-center">Secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-md bg-gray-100"></div>
                      <p className="text-sm text-center">Background</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Document Preview with Selected Colors</h3>
                  <div className="p-4 bg-white rounded border border-gray-200">
                    <h1 className="text-2xl font-bold mb-2" style={{ color: selectedColor }}>RFP Response</h1>
                    <p className="mb-3">This preview shows how your selected colors will appear in your document.</p>
                    <button className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: selectedColor }}>
                      Call to Action
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;