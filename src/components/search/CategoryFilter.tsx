
import { Button } from "@/components/ui/button";
import { SocialMediaCategory } from "@/types/socialMedia";

interface CategoryFilterProps {
  categories: SocialMediaCategory[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }: CategoryFilterProps) => {
  if (categories.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 pb-6">
      {categories.map((category) => (
        <Button
          key={category.name}
          variant={selectedCategory === category.name ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
          className={selectedCategory === category.name ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-100 text-gray-700"}
        >
          {category.name}
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            {category.count}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
