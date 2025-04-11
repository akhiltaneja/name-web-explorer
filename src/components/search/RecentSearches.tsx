
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';

interface RecentSearchesProps {
  recentSearches: string[];
  onClearSearch?: (search: string) => void;
  onClearAll?: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  recentSearches,
  onClearSearch,
  onClearAll
}) => {
  const navigate = useNavigate();

  if (!recentSearches?.length) return null;

  return (
    <div className="w-full bg-white border border-gray-100 rounded-md shadow-sm mt-2 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={14} />
          <span>Recent searches</span>
        </div>
        {onClearAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-gray-500 hover:text-gray-700"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((search, index) => (
          <div 
            key={`${search}-${index}`}
            className="flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
            <button
              className="text-gray-700"
              onClick={() => navigate(`/search/${encodeURIComponent(search)}`)}
            >
              {search}
            </button>
            {onClearSearch && (
              <button 
                className="ml-1 text-gray-400 hover:text-gray-600"
                onClick={() => onClearSearch(search)}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
