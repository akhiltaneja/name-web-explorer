
import { SocialMediaProfile } from "@/types/socialMedia";
import SocialResultCard from "@/components/SocialResultCard";
import { Globe } from "lucide-react";

interface AdditionalResultsProps {
  additionalResults: SocialMediaProfile[];
  filteredAdditionalResults: SocialMediaProfile[];
  viewMode: "grid" | "list";
}

const AdditionalResults = ({ 
  additionalResults, 
  filteredAdditionalResults, 
  viewMode 
}: AdditionalResultsProps) => {
  if (additionalResults.length === 0) return null;

  return (
    <>
      <div className="mt-8 mb-3">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <Globe className="h-5 w-5 text-blue-500" />
          Additional Web Results
          <span className="text-sm font-normal bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full border border-blue-200">
            {filteredAdditionalResults.length} found
          </span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Additional profiles found from across the web
        </p>
      </div>

      <div className={`grid gap-2 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {filteredAdditionalResults.map((profile, index) => (
          <SocialResultCard key={`additional-${index}`} profile={profile} />
        ))}
      </div>
    </>
  );
};

export default AdditionalResults;
