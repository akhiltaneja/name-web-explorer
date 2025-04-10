
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              <span className="font-bold text-xl text-blue-600">CandidateChecker</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Powerful social media profiling tool to help you find and verify online
              presence across multiple platforms.
            </p>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} CandidateChecker. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Product</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link to="/profile" className="hover:text-blue-600 transition-colors">My Account</Link></li>
              <li><Link to="/profile?tab=plans" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              <li><Link to="/knowledge-base" className="hover:text-blue-600 transition-colors">Knowledge Base</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Support</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
