
import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface RecentSearchesProps {
  recentSearches: string[];
  onSearchSelect: (query: string) => void;
}

const RecentSearches = ({ recentSearches, onSearchSelect }: RecentSearchesProps) => {
  if (!recentSearches || recentSearches.length === 0) return null;
  
  return (
    <div className="mt-4 flex items-center space-x-2">
      <div className="text-sm font-medium text-gray-700 flex items-center">
        <Search className="h-4 w-4 mr-2 text-gray-500" />
        <span>Recent:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((query, index) => (
          <Badge
            key={index}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 cursor-pointer transition-colors border-purple-200"
            onClick={() => onSearchSelect(query)}
          >
            {query}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
