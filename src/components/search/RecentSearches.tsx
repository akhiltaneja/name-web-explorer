
import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentSearchesProps {
  recentSearches: string[];
  onSearchSelect: (query: string) => void;
}

const RecentSearches = ({ recentSearches, onSearchSelect }: RecentSearchesProps) => {
  if (!recentSearches || recentSearches.length === 0) return null;
  
  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Search className="h-4 w-4 mr-2 text-gray-500" />
          Recent Searches
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {recentSearches.map((query, index) => (
          <button
            key={index}
            className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 transition-colors flex items-center"
            onClick={() => onSearchSelect(query)}
          >
            <Search className="h-3.5 w-3.5 mr-2 text-gray-400" />
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
