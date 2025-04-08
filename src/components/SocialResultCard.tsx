
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { SocialMediaProfile } from "@/types/socialMedia";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SocialResultCardProps {
  profile: SocialMediaProfile;
}

const SocialResultCard = ({ profile }: SocialResultCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.url);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: `${profile.platform} URL has been copied`,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="social-card overflow-hidden shadow hover:shadow-md bg-gray-800 border-gray-700 text-gray-100">
      <CardContent className="p-0">
        <div className="p-4 hover:bg-gray-700/50">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: profile.color }}
            >
              <span className="text-xl">{profile.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-100">{profile.platform}</h3>
              <p className="text-sm text-gray-400">{profile.username}</p>
              {profile.category && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                  {profile.category}
                </span>
              )}
              {profile.status && (
                <span className="inline-flex items-center ml-2 mt-1 px-2 py-0.5 rounded text-xs bg-green-900/30 text-green-300 border border-green-800">
                  {profile.status}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
                asChild
              >
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialResultCard;
