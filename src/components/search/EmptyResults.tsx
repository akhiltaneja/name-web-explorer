
import { Button } from "@/components/ui/button";

interface EmptyResultsProps {
  name: string;
  isSearching: boolean;
  results: any[];
  onReset: () => void;
}

const EmptyResults = ({ name, isSearching, results, onReset }: EmptyResultsProps) => {
  if (results.length > 0 || isSearching || !name) return null;

  return (
    <section className="py-8 px-4 text-center">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any social media profiles matching "{name}". Try a different name or check your spelling.
          </p>
          <Button 
            onClick={onReset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Another Search
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EmptyResults;
