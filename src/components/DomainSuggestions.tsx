
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast";
import { Check, Globe, ExternalLink } from "lucide-react";

interface DomainSuggestion {
  tld: string;
  available: boolean;
  price: number;
}

interface DomainSuggestionsProps {
  username: string;
  domains: DomainSuggestion[];
}

const DomainSuggestions: React.FC<DomainSuggestionsProps> = ({ username, domains }) => {
  const { toast } = useToast();
  const availableDomains = domains.filter(d => d.available);
  const [affiliateLink, setAffiliateLink] = useState<string>('https://www.namecheap.com');
  
  // Load affiliate link from localStorage if available
  useEffect(() => {
    const storedLink = localStorage.getItem('affiliateLink');
    if (storedLink) {
      setAffiliateLink(storedLink);
    }
  }, []);
  
  if (availableDomains.length === 0) return null;
  
  const handleBuyClick = (tld: string) => {
    toast({
      title: "Redirecting to domain registrar",
      description: `You'll be redirected to purchase ${username}${tld}`,
    });
    
    // Use the affiliate link if available, otherwise use default
    window.open(`${affiliateLink}/domains/registration/results/?domain=${username}`, '_blank');
  };
  
  return (
    <Card className="overflow-hidden border-2 border-yellow-400 shadow-lg bg-gradient-to-br from-white to-yellow-50">
      <div className="absolute top-0 right-0 bg-yellow-400 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider transform translate-x-2 -translate-y-1 rotate-3">
        Special Offer
      </div>
      
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Claim Your Personal Domain
        </CardTitle>
        <p className="text-white/80 text-sm mt-1">
          Secure your online identity with your own custom domain
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            We found {availableDomains.length} available domains for you:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {availableDomains.map((domain) => (
              <div
                key={domain.tld}
                className="border border-gray-200 rounded-md p-3 bg-white hover:border-yellow-400 hover:shadow-sm transition-all"
              >
                <p className="font-medium text-gray-800 mb-1">{username}{domain.tld}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ${domain.price}/yr
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleBuyClick(domain.tld)}
                    className="h-7 bg-yellow-400 hover:bg-yellow-500 text-xs px-2"
                  >
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">Includes free email forwarding</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">Easy setup with our partner registrars</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">24/7 customer support</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              className="text-xs text-gray-600 hover:text-gray-800"
              onClick={() => window.open(affiliateLink, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              See all domain options
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainSuggestions;
