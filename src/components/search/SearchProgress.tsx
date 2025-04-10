
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";

interface SearchProgressProps {
  isSearching: boolean;
  searchProgress: number;
  name: string;
}

const SearchProgress = ({ isSearching, searchProgress, name }: SearchProgressProps) => {
  if (!isSearching) return null;
  
  return (
    <div className="mt-4 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm animate-fade-in flex items-start">
      <div className="mr-4 bg-blue-100 p-2 rounded-full">
        <Search className="h-6 w-6 text-blue-600" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-blue-800 mb-1">Searching...</h3>
        <p className="text-blue-700 mb-2">Looking for "{name}" across social networks</p>
        <Progress value={searchProgress} className="h-2 bg-blue-100" />
      </div>
    </div>
  );
};

export default SearchProgress;
