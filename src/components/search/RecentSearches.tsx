
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RecentSearchesProps {
  recentSearches: string[];
  onClearSearch?: (search: string) => void;
  onClearAll?: () => void;
  onSearch?: (search: string) => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  recentSearches,
  onClearSearch,
  onClearAll,
  onSearch
}) => {
  const navigate = useNavigate();

  if (!recentSearches?.length) return null;

  const handleSearch = (search: string) => {
    if (onSearch) {
      onSearch(search);
    } else {
      navigate(`/search/${encodeURIComponent(search)}`);
      
      toast({
        title: "Search initiated",
        description: `Searching for "${search}"...`
      });
    }
  };

  return (
    <div className="w-full bg-white border border-purple-200 rounded-md shadow-md mt-4 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-purple-700">
          <Clock size={16} className="text-purple-500" />
          <span>Recent searches</span>
        </div>
        {onClearAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50"
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
            className="flex items-center bg-purple-50 hover:bg-purple-100 rounded-full px-3 py-1.5 text-sm gap-1 border border-purple-200 transition-colors duration-200 shadow-sm"
          >
            <button
              className="text-purple-800 flex items-center gap-1.5"
              onClick={() => handleSearch(search)}
            >
              <Search size={14} className="text-purple-600" />
              {search}
            </button>
            {onClearSearch && (
              <button 
                className="ml-1.5 text-purple-400 hover:text-purple-700 p-0.5"
                onClick={() => onClearSearch(search)}
                aria-label={`Remove ${search} from recent searches`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
