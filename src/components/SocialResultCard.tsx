
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Check } from "lucide-react";
import { SocialMediaProfile } from "@/types/socialMedia";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      title: "URL copied",
      description: `Copied ${profile.platform} profile URL to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Platform logo helper function
  const getLogoUrl = (platform: string): string => {
    const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, '');
    const logoMap: Record<string, string> = {
      'twitter': 'https://cdn.simpleicons.org/twitter/1DA1F2',
      'linkedin': 'https://cdn.simpleicons.org/linkedin/0A66C2',
      'facebook': 'https://cdn.simpleicons.org/facebook/1877F2',
      'instagram': 'https://cdn.simpleicons.org/instagram/E4405F',
      'youtube': 'https://cdn.simpleicons.org/youtube/FF0000',
      'github': 'https://cdn.simpleicons.org/github/181717',
      'pinterest': 'https://cdn.simpleicons.org/pinterest/BD081C',
      'reddit': 'https://cdn.simpleicons.org/reddit/FF4500',
      'tumblr': 'https://cdn.simpleicons.org/tumblr/36465D',
      'tiktok': 'https://cdn.simpleicons.org/tiktok/000000',
      'discord': 'https://cdn.simpleicons.org/discord/5865F2',
      'twitch': 'https://cdn.simpleicons.org/twitch/9146FF',
      'medium': 'https://cdn.simpleicons.org/medium/000000',
      'stackoverflow': 'https://cdn.simpleicons.org/stackoverflow/F58025',
      'behance': 'https://cdn.simpleicons.org/behance/1769FF',
      'dribbble': 'https://cdn.simpleicons.org/dribbble/EA4C89',
      'vimeo': 'https://cdn.simpleicons.org/vimeo/1AB7EA',
      'fiver': 'https://cdn.simpleicons.org/fiverr/1DBF73',
      'devto': 'https://cdn.simpleicons.org/devdotto/0A0A0A',
      'quora': 'https://cdn.simpleicons.org/quora/B92B27',
    };
    
    return logoMap[normalizedPlatform] || `https://ui-avatars.com/api/?name=${encodeURIComponent(platform)}&background=random&color=fff`;
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={getLogoUrl(profile.platform)} alt={profile.platform} />
                <AvatarFallback>{profile.platform.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-900">{profile.platform}</h3>
              {profile.category && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
                  {profile.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"  
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
                asChild
              >
                <a href={profile.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="text-sm text-gray-700 truncate">
              <span className="font-medium">Username:</span> {profile.username}
            </div>
          </div>
          
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {profile.url}
          </a>
          
          {profile.status && (
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  profile.status === 'active' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                    : profile.status === 'inactive' 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200'
                }`}
              >
                {profile.status}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialResultCard;
