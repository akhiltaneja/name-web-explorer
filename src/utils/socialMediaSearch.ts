
import { SocialMediaProfile } from "@/types/socialMedia";

/**
 * Generates a list of potential social media profiles for a given username
 */
export const getSocialMediaProfiles = (username: string, fullName: string): SocialMediaProfile[] => {
  const platforms: SocialMediaProfile[] = [
    {
      platform: "Twitter",
      url: `https://twitter.com/${username}`,
      username: `@${username}`,
      icon: "𝕏",
      color: "#1DA1F2",
      category: "Social network"
    },
    {
      platform: "LinkedIn",
      url: `https://linkedin.com/in/${username}`,
      username: fullName,
      icon: "in",
      color: "#0077B5",
      category: "Professional"
    },
    {
      platform: "Facebook",
      url: `https://facebook.com/${username}`,
      username: fullName,
      icon: "f",
      color: "#4267B2",
      category: "Social network"
    },
    {
      platform: "SoundCloud",
      url: `https://soundcloud.com/${username}`,
      username: username,
      icon: "SC",
      color: "#FF5500",
      category: "Music"
    },
    {
      platform: "Flickr",
      url: `https://www.flickr.com/photos/${username}`,
      username: username,
      icon: "F",
      color: "#0063DC",
      category: "Photography"
    },
    {
      platform: "GitHub",
      url: `https://github.com/${username}`,
      username: username,
      icon: "🐙",
      color: "#333333",
      category: "Software development"
    },
    {
      platform: "Behance",
      url: `https://behance.net/${username}`,
      username: username,
      icon: "Be",
      color: "#053eff",
      category: "Visual Arts and Design"
    },
    {
      platform: "About.me",
      url: `https://about.me/${username}`,
      username: username,
      icon: "A",
      color: "#00A98F",
      category: "Technology"
    },
    {
      platform: "Academia.edu",
      url: `https://independent.academia.edu/${username}`,
      username: username,
      icon: "A",
      color: "#41454A",
      category: "Education"
    },
    {
      platform: "Archive.org",
      url: `https://archive.org/details/@${username}`,
      username: username,
      icon: "📚",
      color: "#2A4B87",
      category: "Education"
    },
    {
      platform: "Arduino",
      url: `https://create.arduino.cc/projecthub/${username}`,
      username: username,
      icon: "⚡",
      color: "#00979D",
      category: "Technology"
    },
    {
      platform: "Audiojungle",
      url: `https://audiojungle.net/user/${username}`,
      username: username,
      icon: "🎵",
      color: "#76B852",
      category: "Music"
    },
    {
      platform: "Bitchute",
      url: `https://bitchute.com/channel/${username}/`,
      username: username,
      icon: "B",
      color: "#EF4137",
      category: "Political"
    },
    {
      platform: "BodyBuilding",
      url: `https://bodyspace.bodybuilding.com/${username}`,
      username: username,
      icon: "💪",
      color: "#2C2C2C",
      category: "Online Community"
    },
    {
      platform: "DailyMotion",
      url: `https://www.dailymotion.com/${username}`,
      username: username,
      icon: "D",
      color: "#0066DC",
      category: "News"
    },
    {
      platform: "Disqus",
      url: `https://disqus.com/${username}`,
      username: username,
      icon: "D",
      color: "#2E9FFF",
      category: "Technology"
    },
    {
      platform: "Fiverr",
      url: `https://fiverr.com/${username}`,
      username: username,
      icon: "Fi",
      color: "#1DBF73",
      category: "Marketplace"
    },
    {
      platform: "Giphy",
      url: `https://giphy.com/${username}`,
      username: username,
      icon: "G",
      color: "#FF6666",
      category: "Entertainment"
    },
    {
      platform: "Gravatar",
      url: `https://gravatar.com/${username}`,
      username: username,
      icon: "G",
      color: "#1E8CBE",
      category: "Images"
    },
    {
      platform: "Imgur",
      url: `https://imgur.com/user/${username}`,
      username: username,
      icon: "I",
      color: "#1BB76E",
      category: "Technology"
    },
    {
      platform: "Kaggle",
      url: `https://www.kaggle.com/${username}`,
      username: username,
      icon: "K",
      color: "#20BEFF",
      category: "Data science"
    },
    {
      platform: "Mastodon",
      url: `https://mastodon.social/@${username}`,
      username: username,
      icon: "M",
      color: "#6364FF",
      category: "Online Community"
    },
    {
      platform: "Medium",
      url: `https://medium.com/@${username}`,
      username: username,
      icon: "M",
      color: "#00AB6C",
      category: "News"
    },
    {
      platform: "Pinterest",
      url: `https://www.pinterest.com/${username}/`,
      username: username,
      icon: "P",
      color: "#E60023",
      category: "Social network"
    },
    {
      platform: "Reddit",
      url: `https://www.reddit.com/user/${username}`,
      username: `u/${username}`,
      icon: "R",
      color: "#FF4500",
      category: "Social network"
    },
    {
      platform: "SlideShare",
      url: `https://slideshare.net/${username}`,
      username: username,
      icon: "S",
      color: "#0077B5",
      category: "Online Community"
    },
    {
      platform: "TikTok",
      url: `https://tiktok.com/@${username}`,
      username: `@${username}`,
      icon: "T",
      color: "#000000",
      category: "Social network"
    },
    {
      platform: "Tumblr",
      url: `https://${username}.tumblr.com`,
      username: username,
      icon: "T",
      color: "#36465D",
      category: "Images"
    },
    {
      platform: "Twitch",
      url: `https://www.twitch.tv/${username}`,
      username: username,
      icon: "T",
      color: "#9146FF",
      category: "Online Community"
    },
    {
      platform: "VSCO",
      url: `https://vsco.co/${username}`,
      username: username,
      icon: "V",
      color: "#000000",
      category: "Online Community"
    },
    {
      platform: "Vimeo",
      url: `https://vimeo.com/${username}`,
      username: username,
      icon: "V",
      color: "#1AB7EA",
      category: "Video"
    },
    {
      platform: "Wikipedia",
      url: `https://meta.wikimedia.org/wiki/Special:CentralAuth/${username}`,
      username: username,
      icon: "W",
      color: "#000000",
      category: "Education"
    },
    {
      platform: "YouTube",
      url: `https://www.youtube.com/@${username}`,
      username: `@${username}`,
      icon: "▶️",
      color: "#FF0000",
      category: "Video"
    }
  ];

  return platforms;
};

/**
 * Checks if a URL is active or returns a 404
 * This would require an actual API in production
 * Here we'll simulate with random results
 */
export const checkUrlStatus = async (url: string): Promise<boolean> => {
  // In a real app, this would make an actual HTTP request
  // For this demo, we'll return random results with 80% likelihood of success
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.2);
    }, 100);
  });
};

/**
 * Check if domains are available for the username
 */
export const checkDomainAvailability = async (username: string): Promise<{tld: string, available: boolean, price: number}[]> => {
  // This would use a domain check API in production
  // Here we simulate with random availability
  const tlds = ['.com', '.net', '.org', '.io', '.co', '.me', '.xyz', '.dev', '.in'];
  
  return Promise.all(tlds.map(tld => {
    const available = Math.random() > 0.6; // 40% chance domain is available
    return {
      tld,
      available,
      price: available ? Math.floor(Math.random() * 15) + 8 : 0 // $8-$23 price range
    };
  }));
};

/**
 * Generates additional "scraped" results to simulate web search findings
 */
export const getAdditionalResults = (username: string, fullName: string): SocialMediaProfile[] => {
  const additionalPlatforms: SocialMediaProfile[] = [
    {
      platform: "Spotify",
      url: `https://open.spotify.com/user/${username}`,
      username: username,
      icon: "🎵",
      color: "#1DB954",
      category: "Music",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Quora",
      url: `https://www.quora.com/profile/${username}`,
      username: username,
      icon: "Q",
      color: "#B92B27",
      category: "Social Q&A",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Etsy",
      url: `https://www.etsy.com/shop/${username}`,
      username: username,
      icon: "E",
      color: "#F1641E",
      category: "Marketplace",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Stack Overflow",
      url: `https://stackoverflow.com/users/${Math.floor(Math.random() * 9000000) + 1000000}/${username}`,
      username: username,
      icon: "S",
      color: "#F48024",
      category: "Technology",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Substack",
      url: `https://${username}.substack.com`,
      username: username,
      icon: "S",
      color: "#FF6719",
      category: "Writing",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Patreon",
      url: `https://www.patreon.com/${username}`,
      username: username,
      icon: "P",
      color: "#F96854",
      category: "Crowdfunding",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Medium",
      url: `https://medium.com/@${username}`,
      username: `@${username}`,
      icon: "M",
      color: "#000000",
      category: "Writing",
      status: Math.random() > 0.3 ? "active" : "inactive"
    },
    {
      platform: "Blogger",
      url: `https://${username}.blogspot.com`,
      username: username,
      icon: "B",
      color: "#FF5722",
      category: "Blogging",
      status: Math.random() > 0.3 ? "active" : "inactive"
    }
  ];
  
  return additionalPlatforms.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2);
};

/**
 * Group social media profiles by category
 */
export const groupProfilesByCategory = (profiles: SocialMediaProfile[]) => {
  const categories: Record<string, SocialMediaProfile[]> = {};
  
  profiles.forEach(profile => {
    const category = profile.category || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(profile);
  });
  
  return categories;
};

/**
 * Get unique categories with counts
 */
export const getCategories = (profiles: SocialMediaProfile[]) => {
  const categoryCounts: Record<string, number> = {};
  
  profiles.forEach(profile => {
    const category = profile.category || 'Other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
};
