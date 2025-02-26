import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, BarChart3, Database, Settings, Trash2, UserPlus, ArrowRight, Loader } from 'lucide-react';

type Tab = 'home' | 'upload' | 'review' | 'database' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [isSigningUp, setIsSigningUp] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companyDescription, setCompanyDescription] = useState("");  
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File uploade:",file.name);
      }
    };
  
  const removeFile = () => {
    setSelectedFile(null);
  };

  const API_BASE_URL = "https://rfp-me-backend.onrender.com";

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", companyDescription);

    try {
      const res = await fetch(`${API_BASE_URL}/process_rfp`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error:", error);
    }
      setIsLoading(false);
  };
    
  const renderHomePage = () => (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Transform Your RFP Process with
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent"> AI-Powered </span>
              Proposals
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Create winning proposals in minutes, not hours. Our AI-powered platform analyzes RFPs, generates tailored responses, and helps you track success metrics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsSigningUp(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Sign Up Free
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center"
              >
                Try Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>

          {isSigningUp ? (
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6">Create Your Account</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Create Account
                </button>
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsSigningUp(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6">Welcome Back</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Sign In
                </button>
                <p className="text-center text-sm text-gray-500">
                  Need an account?{' '}
                  <button
                    onClick={() => setIsSigningUp(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
            <p className="text-gray-600">
              Simply upload your RFP document and let our AI analyze and extract key requirements.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Generation</h3>
            <p className="text-gray-600">
              Our AI generates tailored responses based on your company's expertise and past successes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Success</h3>
            <p className="text-gray-600">
              Monitor your proposal performance and get insights to improve win rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomePage();
      case 'upload':
        return (
          <div className="space-y-6">
            <div 
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
            >
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Drop your RFP document here or click to browse</p>
                  <p className="text-xs text-gray-500">PDF, DOCX, or TXT files up to 10MB</p>
                </div>
              </div>
              <input
                id='file-upload'
                type='file'
                accept='.pdf,.doc,.docx,.txt'
                className='hidden'
                onChange={handleFileChange}
                />
            </div>

            {selectedFile && (
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow border">
                <div>
                  <p className="font-semibold">File: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button onClick={removeFile} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
                </button> 
              </div>
            )}

            {selectedFile && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company Description</label>
                <textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Describe your company, the AI will use your language as reference when responding to the RFP"
                  maxLength={1000}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm resize-none h-28"
                />
                <p className="text-xs text-gray-500">{companyDescription.length} / 1000 characters</p>
              </div>
            )}

            {selectedFile && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                >
                  {isLoading ? <Loader className="animate-spin h-5 w-5" /> : null}
                  {isLoading ? "Processing..." : "Submit"}
                </button>
            )}

            {response && (
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="font-semibold">Generated RFP Response:</h3>
                <p className="text-gray-700">{response}</p>
              </div>
            )}

            {/*   Sections to be added later:

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Response Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Response Length</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Concise</option>
                      <option>Standard</option>
                      <option>Detailed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Writing Style</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Professional</option>
                      <option>Technical</option>
                      <option>Conversational</option>
                    </select>
                  </div>
                </div>
              </div>


              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Template Selection</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm">Standard Template</span>
                  </div>
                  <div className="flex items-center p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Technical Proposal</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    + Upload Custom Template
                  </button>
                </div>
              </div>
            </div>
            */}
          </div>

        );


      case 'review':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Review & Quality Check</h2>
            <p className="text-gray-600">Upload your RFP response for AI review and scoring.</p>
          </div>
        );
      case 'database':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Project Database</h2>
            <p className="text-gray-600">Access and manage your past projects and experiences.</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Track your RFP performance and insights.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center"
              >
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">RFP Generator</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab !== 'home' && (
                <>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'upload'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload RFP
                  </button>
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'review'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Review
                  </button>
                  <button
                    onClick={() => setActiveTab('database')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'database'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Database className="h-5 w-5 mr-2" />
                    Database
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      activeTab === 'analytics'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics
                  </button>
                </>
              )}
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className={activeTab === 'home' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;