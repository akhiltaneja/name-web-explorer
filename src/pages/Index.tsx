
import { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailReportDialog from "@/components/EmailReportDialog";
import DomainSuggestions from "@/components/DomainSuggestions";
import { emailTextReport, downloadTextReport } from "@/utils/reportGenerator";

// Import the refactored components
import Hero from "@/components/search/Hero";
import ResultsHeader from "@/components/search/ResultsHeader";
import CategoryFilter from "@/components/search/CategoryFilter";
import ResultsList from "@/components/search/ResultsList";
import AdditionalResults from "@/components/search/AdditionalResults";
import EmptyResults from "@/components/search/EmptyResults";
import Features from "@/components/search/Features";
import FAQ from "@/components/search/FAQ";
import { useSearch } from "@/hooks/useSearch";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    name,
    setName,
    results,
    additionalResults,
    isSearching,
    searchProgress,
    searchTime,
    availableDomains,
    profilesByCategory,
    categories,
    guestCheckAvailable,
    searchLimitReached,
    checksRemaining,
    hasReachedSearchLimit,
    handleSearch,
    searchInitiated,
    resultsRef,
    showLimitModal,
    setShowLimitModal,
    emailModalOpen,
    setEmailModalOpen,
    clearResults,
    recentSearches
  } = useSearch(user, profile, refreshProfile);

  // When URL changes, handle the search params
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    
    // Check if we're on a search page
    if (pathSegments[1] === 'search' && pathSegments[2]) {
      const searchQuery = decodeURIComponent(pathSegments[2]);
      
      // Only update the search term if it's different
      if (name !== searchQuery) {
        setName(searchQuery);
      }
    } else if (pathSegments[1] === '') {
      // If we're on the home page, clear results
      clearResults();
    }
  }, [location, name, setName, clearResults]);

  const handleCopyAll = () => {
    const text = filteredResults
      .map(profile => `${profile.platform}: ${profile.url}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard",
      description: `All ${filteredResults.length} URLs have been copied`,
    });
  };

  const handleDownloadReport = () => {
    if (filteredResults.length === 0) {
      toast({
        title: "No results to download",
        description: "Please perform a search first.",
        variant: "destructive",
      });
      return;
    }
    
    downloadTextReport(name, filteredResults);
    
    toast({
      title: "Report downloaded",
      description: `${filteredResults.length} profiles saved to PDF report`,
    });
  };

  const handleEmailReport = () => {
    if (filteredResults.length === 0) {
      toast({
        title: "No results to email",
        description: "Please perform a search first.",
        variant: "destructive",
      });
      return;
    }
    
    setEmailModalOpen(true);
  };

  const sendEmailReport = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    try {
      const success = await emailTextReport(email, name, filteredResults);
      return success;
    } catch (error) {
      console.error("Error sending email report:", error);
      return false;
    }
  };

  const filteredResults = selectedCategory 
    ? results.filter(profile => profile.category === selectedCategory)
    : results;

  const filteredAdditionalResults = selectedCategory 
    ? additionalResults.filter(profile => profile.category === selectedCategory)
    : additionalResults;

  // Determine if search has been initiated based on URL
  const isSearchPage = location.pathname.includes('/search/');

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero 
          name={name}
          setName={setName}
          handleSearch={handleSearch}
          isSearching={isSearching}
          searchProgress={searchProgress}
          searchLimitReached={searchLimitReached}
          user={user}
          guestCheckAvailable={guestCheckAvailable}
          checksRemaining={checksRemaining}
          showLimitModal={showLimitModal}
          setShowLimitModal={setShowLimitModal}
          recentSearches={recentSearches}
          searchInitiated={isSearchPage}
        />

        <section className="py-8 px-4" ref={resultsRef}>
          <div className="container mx-auto max-w-6xl">
            {isSearchPage && (results.length > 0 || isSearching) && (
              <ResultsHeader 
                name={name}
                filteredResults={filteredResults}
                searchTime={searchTime}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                handleCopyAll={handleCopyAll}
                handleDownloadReport={handleDownloadReport}
                handleEmailReport={handleEmailReport}
              />
            )}

            {isSearchPage && (
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            <ResultsList 
              filteredResults={filteredResults}
              viewMode={viewMode}
              selectedCategory={selectedCategory}
              profilesByCategory={profilesByCategory}
            />

            <AdditionalResults 
              additionalResults={additionalResults}
              filteredAdditionalResults={filteredAdditionalResults}
              viewMode={viewMode}
            />

            {availableDomains.length > 0 && availableDomains.some(d => d.available) && (
              <div className="mt-10 mb-6">
                <DomainSuggestions username={name.toLowerCase().replace(/\s+/g, '')} domains={availableDomains} />
              </div>
            )}
          </div>
        </section>

        {isSearchPage && name && !isSearching && results.length === 0 && (
          <EmptyResults 
            name={name}
            isSearching={isSearching}
            results={results}
            onReset={() => {
              clearResults();
              navigate('/');
            }}
          />
        )}

        {!isSearchPage && !isSearching && results.length === 0 && (
          <>
            <Features />
            <FAQ />
          </>
        )}
      </main>
      
      <EmailReportDialog 
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={sendEmailReport}
        searchName={name}
      />
      
      <Footer />
    </div>
  );
};

export default Index;
