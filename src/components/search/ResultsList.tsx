
import { SocialMediaProfile } from "@/types/socialMedia";
import SocialResultCard from "@/components/SocialResultCard";
import { Separator } from "@/components/ui/separator";

interface ResultsListProps {
  filteredResults: SocialMediaProfile[];
  viewMode: "grid" | "list";
  selectedCategory: string | null;
  profilesByCategory: Record<string, SocialMediaProfile[]>;
}

const ResultsList = ({ 
  filteredResults, 
  viewMode, 
  selectedCategory,
  profilesByCategory 
}: ResultsListProps) => {
  if (filteredResults.length === 0) return null;

  return (
    <>
      {filteredResults.length > 0 && <Separator className="bg-gray-200 my-4" />}

      {!selectedCategory && Object.keys(profilesByCategory).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(profilesByCategory).map(([category, profiles]) => (
            <div key={category}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                {category}
                <span className="ml-2 text-sm font-normal bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full border border-blue-100">
                  {profiles.length}
                </span>
              </h3>
              <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {profiles.map((profile, index) => (
                  <SocialResultCard key={`${category}-${index}`} profile={profile} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {filteredResults.map((profile, index) => (
            <SocialResultCard key={index} profile={profile} />
          ))}
        </div>
      )}
    </>
  );
};

export default ResultsList;
