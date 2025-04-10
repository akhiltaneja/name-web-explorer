
import { CheckCircle } from "lucide-react";

const SearchFeatures = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      <div className="flex items-center text-gray-700">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span>Search across multiple platforms</span>
      </div>
      <div className="flex items-center text-gray-700">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span>Export reports easily</span>
      </div>
      <div className="flex items-center text-gray-700">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span>100% private searches</span>
      </div>
    </div>
  );
};

export default SearchFeatures;
