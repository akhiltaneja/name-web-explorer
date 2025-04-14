
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Check, AlertTriangle } from "lucide-react";
import { SocialMediaProfile } from "@/types/socialMedia";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      'twitter': 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023.png', // Using the X logo for Twitter
      'linkedin': 'https://cdn.simpleicons.org/linkedin/0A66C2',
      'facebook': 'https://cdn.simpleicons.org/facebook/1877F2',
      'instagram': 'https://cdn.simpleicons.org/instagram/E4405F',
      'youtube': 'https://cdn.simpleicons.org/youtube/FF0000',
      'github': 'https://cdn.simpleicons.org/github/181717',
      'githubcommunity': 'https://cdn.simpleicons.org/github/181717',
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
      'fiverr': 'https://cdn.simpleicons.org/fiverr/1DBF73',
      'devto': 'https://cdn.simpleicons.org/devdotto/0A0A0A',
      'quora': 'https://cdn.simpleicons.org/quora/B92B27',
      'soundcloud': 'https://cdn.simpleicons.org/soundcloud/FF5500',
      'flickr': 'https://cdn.simpleicons.org/flickr/0063DC',
      'spotify': 'https://cdn.simpleicons.org/spotify/1DB954',
      'substack': 'https://cdn.simpleicons.org/substack/FF6719',
      'patreon': 'https://cdn.simpleicons.org/patreon/F96854',
      'etsy': 'https://cdn.simpleicons.org/etsy/F1641E',
      'blogger': 'https://cdn.simpleicons.org/blogger/FF5722',
      'dailymotion': 'https://cdn.simpleicons.org/dailymotion/0066DC',
      'threads': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Threads_%28app%29_logo.svg/512px-Threads_%28app%29_logo.svg.png',
      'telegram': 'https://cdn.simpleicons.org/telegram/0088cc',
      'vsco': 'https://cdn.simpleicons.org/vsco/000000',
    };
    
    return logoMap[normalizedPlatform] || `https://ui-avatars.com/api/?name=${encodeURIComponent(platform)}&background=random&color=fff`;
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-gray-100">
              <AvatarImage src={getLogoUrl(profile.platform)} alt={profile.platform} />
              <AvatarFallback className="bg-blue-50 text-blue-700">{profile.platform.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-800 text-sm">{profile.platform}</h3>
                {profile.status && (
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-xs ${
                      profile.status === 'active' 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100' 
                        : profile.status === 'inactive' 
                          ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100'
                    }`}
                  >
                    {profile.status}
                  </Badge>
                )}
                {profile.verificationStatus === 'verified' && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-100"
                  >
                    verified
                  </Badge>
                )}
                {profile.note && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100"
                  >
                    {profile.note}
                  </Badge>
                )}
                {profile.errorReason && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-gray-800 border border-gray-200">
                        <p className="text-xs max-w-xs">{profile.errorReason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {profile.category && (
                <div className="flex items-center space-x-1 mt-0.5">
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100">
                    {profile.category}
                  </Badge>
                </div>
              )}
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all mt-0.5 inline-block"
              >
                {profile.url}
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50" 
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost"  
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50" 
              asChild
            >
              <a href={profile.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialResultCard;
