
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailReportDialog from "@/components/EmailReportDialog";
import DomainSuggestions from "@/components/DomainSuggestions";
import { emailTextReport, downloadTextReport } from "@/utils/reportGenerator";

import Hero from "@/components/search/Hero";
import ResultsHeader from "@/components/search/ResultsHeader";
import CategoryFilter from "@/components/search/CategoryFilter";
import ResultsList from "@/components/search/ResultsList";
import AdditionalResults from "@/components/search/AdditionalResults";
import EmptyResults from "@/components/search/EmptyResults";
import Features from "@/components/search/Features";
import FAQ from "@/components/search/FAQ";
import { useSearch } from "@/hooks/useSearch";

const RECENT_SEARCHES_KEY = "people_peeper_recent_searches";
const MAX_RECENT_SEARCHES = 6;

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();

  const {
    name,
    setName,
    results,
    additionalResults,
    unverifiedResults,
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
    isDeepVerifying,
    verificationProgress
  } = useSearch(user, profile, refreshProfile);

  useEffect(() => {
    const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (storedSearches) {
      try {
        const parsedSearches = JSON.parse(storedSearches);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(parsedSearches);
        }
      } catch (e) {
        console.error("Error parsing recent searches:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (name && results.length > 0 && !isSearching && !isDeepVerifying) {
      addToRecentSearches(name);
    }
  }, [name, results, isSearching, isDeepVerifying]);

  const addToRecentSearches = (searchTerm: string) => {
    setRecentSearches(prevSearches => {
      const filteredSearches = prevSearches.filter(s => s !== searchTerm);
      const newSearches = [searchTerm, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const clearRecentSearch = (searchTerm: string) => {
    setRecentSearches(prevSearches => {
      const newSearches = prevSearches.filter(s => s !== searchTerm);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    toast({
      title: "Recent searches cleared",
      description: "Your search history has been cleared."
    });
  };

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

  const filteredUnverifiedResults = selectedCategory
    ? unverifiedResults?.filter(profile => profile.category === selectedCategory) || []
    : unverifiedResults || [];

  const showResults = 
    (name && (results.length > 0 || isSearching)) && 
    !(isSearching || isDeepVerifying);

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
          profile={profile}
          guestCheckAvailable={guestCheckAvailable}
          checksRemaining={checksRemaining}
          showLimitModal={showLimitModal}
          setShowLimitModal={setShowLimitModal}
          recentSearches={recentSearches}
          onClearSearch={clearRecentSearch}
          onClearAllSearches={clearAllRecentSearches}
          isDeepVerifying={isDeepVerifying}
          verificationProgress={verificationProgress}
        />

        <section className="py-8 px-4" ref={resultsRef}>
          <div className="container mx-auto max-w-6xl">
            {showResults && (
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
                isDeepVerifying={isDeepVerifying}
                verificationProgress={verificationProgress}
              />
            )}

            {showResults && (
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {showResults && (
              <ResultsList 
                filteredResults={filteredResults}
                viewMode={viewMode}
                selectedCategory={selectedCategory}
                profilesByCategory={profilesByCategory}
              />
            )}

            {showResults && (additionalResults.length > 0 || filteredUnverifiedResults.length > 0) && (
              <AdditionalResults 
                additionalResults={additionalResults}
                filteredAdditionalResults={filteredAdditionalResults}
                viewMode={viewMode}
                unverifiedResults={filteredUnverifiedResults}
              />
            )}

            {showResults && availableDomains.length > 0 && availableDomains.some(d => d.available) && (
              <div className="mt-10 mb-6">
                <DomainSuggestions username={name.toLowerCase().replace(/\s+/g, '')} domains={availableDomains} />
              </div>
            )}
          </div>
        </section>

        <EmptyResults 
          name={name}
          isSearching={isSearching || isDeepVerifying}
          results={results}
          onReset={() => setName("")}
        />

        {!name && !isSearching && !isDeepVerifying && results.length === 0 && (
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
