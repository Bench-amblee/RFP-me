import { Upload, FileText, CheckCircle, BarChart3, Database, Settings, Trash2, UserPlus, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import Navbar from "../components/Navbar";


const Home = () => {
  const [activeTab, setActiveTab] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  type Tab = 'home' | 'upload' | 'review' | 'database' | 'analytics';

  return (
    <>
    <Navbar /> {/* Add this at the top */}
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Rest of the Home page content */}
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
  </div>
  </>

  );
};

  export default Home;
