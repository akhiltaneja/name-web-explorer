
import SearchBar from "./SearchBar";
import SearchProgress from "./SearchProgress";
import GuestLimitWarning from "./GuestLimitWarning";
import SearchFeatures from "./SearchFeatures";

interface HeroProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchProgress: number;
  searchLimitReached: boolean;
  user: any;
  guestCheckAvailable: boolean;
}

const Hero = ({
  name,
  setName,
  handleSearch,
  isSearching,
  searchProgress,
  searchLimitReached,
  user,
  guestCheckAvailable
}: HeroProps) => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="container mx-auto py-16 px-4 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight animate-fade-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Candidate Checker</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 md:mb-12 animate-fade-in" style={{animationDelay: "0.2s"}}>
            Find and verify social media profiles with a simple search
          </p>

          <SearchBar 
            name={name}
            setName={setName}
            handleSearch={handleSearch}
            isSearching={isSearching}
            searchLimitReached={searchLimitReached}
            user={user}
          />

          <SearchProgress 
            isSearching={isSearching} 
            searchProgress={searchProgress}
            name={name}
          />

          <GuestLimitWarning 
            user={user}
            guestCheckAvailable={guestCheckAvailable}
            isSearching={isSearching}
          />

          <SearchFeatures />
        </div>
      </div>
    </section>
  );
};

export default Hero;
