
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, Copy, Download, ExternalLink, CheckCircle, Loader2 } from "lucide-react";

interface ResultsHeaderProps {
  name: string;
  filteredResults: any[];
  searchTime: number | null;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  handleCopyAll: () => void;
  handleDownloadReport: () => void;
  handleEmailReport: () => void;
  isDeepVerifying?: boolean;
  verificationProgress?: number;
}

const ResultsHeader = ({
  name,
  filteredResults,
  searchTime,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  handleCopyAll,
  handleDownloadReport,
  handleEmailReport,
  isDeepVerifying = false,
  verificationProgress = 0
}: ResultsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-800">
          Results for <span className="text-blue-600">{name}</span>
          <span className="text-sm font-normal bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full border border-blue-100">
            {filteredResults.length} found
          </span>
          
          {isDeepVerifying && (
            <span className="flex items-center gap-1 text-sm font-normal bg-yellow-50 text-yellow-700 py-0.5 px-2 rounded-full border border-yellow-100">
              <Loader2 className="h-3 w-3 animate-spin" />
              Verifying {Math.round(verificationProgress)}%
            </span>
          )}
          
          {!isDeepVerifying && verificationProgress === 100 && (
            <span className="flex items-center gap-1 text-sm font-normal bg-green-50 text-green-700 py-0.5 px-2 rounded-full border border-green-100">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          )}
        </h2>
        {searchTime && (
          <p className="text-sm text-gray-600 mt-1">
            Results found in {searchTime}ms
            {isDeepVerifying && " • Content verification in progress..."}
            {!isDeepVerifying && verificationProgress === 100 && " • All results verified"}
          </p>
        )}
      </div>
      
      {filteredResults.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
          </Button>
          
          <Button 
            variant={selectedCategory ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={`${!selectedCategory ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
          >
            <Filter size={14} className="mr-1" />
            All
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyAll}
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <Copy size={14} className="mr-1" />
            Copy All
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadReport}
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <Download size={14} className="mr-1" />
            Download
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEmailReport}
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <ExternalLink size={14} className="mr-1" />
            Email
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResultsHeader;
