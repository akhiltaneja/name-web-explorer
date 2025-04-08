
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface SocialResultCardProps {
  profile: {
    platform: string;
    url: string;
    username: string;
    icon: string;
    color: string;
  };
}

const SocialResultCard = ({ profile }: SocialResultCardProps) => {
  return (
    <Card className="social-card overflow-hidden shadow hover:shadow-md">
      <CardContent className="p-0">
        <a 
          href={profile.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: profile.color }}
            >
              <span className="text-xl">{profile.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{profile.platform}</h3>
              <p className="text-sm text-gray-500">{profile.username}</p>
            </div>
            <ExternalLink className="text-gray-400" size={16} />
          </div>
        </a>
      </CardContent>
    </Card>
  );
};

export default SocialResultCard;
