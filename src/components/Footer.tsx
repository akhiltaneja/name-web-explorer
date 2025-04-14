
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
              <span className="font-bold text-xl text-purple-500">PeoplePeeper</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Powerful social media profiling tool to help you find and verify online
              presence across multiple platforms quickly and efficiently.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github size={20} />
              </a>
              <button 
                onClick={toggleTheme} 
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © {currentYear} PeoplePeeper.com. All rights reserved.
            </p>
          </div>
          
          <div className="grid grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-300 mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
                <li><Link to="/profile" className="hover:text-purple-400 transition-colors">My Account</Link></li>
                <li><Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                <li><Link to="/knowledge-base" className="hover:text-purple-400 transition-colors">Knowledge Base</Link></li>
                <li><Link to="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-300 mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact Sales</Link></li>
                <li><Link to="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
