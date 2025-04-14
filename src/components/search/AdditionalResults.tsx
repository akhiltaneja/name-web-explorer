
import { SocialMediaProfile } from "@/types/socialMedia";
import SocialResultCard from "@/components/SocialResultCard";
import { Globe, AlertCircle } from "lucide-react";

interface AdditionalResultsProps {
  additionalResults: SocialMediaProfile[];
  filteredAdditionalResults: SocialMediaProfile[];
  viewMode: "grid" | "list";
  unverifiedResults?: SocialMediaProfile[];
}

const AdditionalResults = ({ 
  additionalResults, 
  filteredAdditionalResults, 
  viewMode,
  unverifiedResults = []
}: AdditionalResultsProps) => {
  if (additionalResults.length === 0 && unverifiedResults.length === 0) return null;

  return (
    <>
      {additionalResults.length > 0 && (
        <>
          <div className="mt-8 mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Globe className="h-5 w-5 text-blue-500" />
              Additional Web Results
              <span className="text-sm font-normal bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full border border-blue-100">
                {filteredAdditionalResults.length} found
              </span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Additional profiles found from across the web
            </p>
          </div>

          <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredAdditionalResults.map((profile, index) => (
              <SocialResultCard key={`additional-${index}`} profile={profile} />
            ))}
          </div>
        </>
      )}

      {unverifiedResults.length > 0 && (
        <>
          <div className="mt-8 mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Unverified Results
              <span className="text-sm font-normal bg-amber-50 text-amber-700 py-0.5 px-2 rounded-full border border-amber-100">
                {unverifiedResults.length} found
              </span>
            </h2>
          </div>

          <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {unverifiedResults.map((profile, index) => (
              <SocialResultCard key={`unverified-${index}`} profile={profile} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default AdditionalResults;
