
import { Progress } from "@/components/ui/progress";

interface SearchProgressProps {
  isSearching: boolean;
  searchProgress: number;
  name: string;
}

const SearchProgress = ({ isSearching, searchProgress, name }: SearchProgressProps) => {
  if (!isSearching) return null;
  
  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm animate-fade-in">
      <p className="text-blue-700 mb-2">Searching social networks for "{name}"</p>
      <Progress value={searchProgress} className="h-2 bg-blue-100" />
    </div>
  );
};

export default SearchProgress;
