
/**
 * Generates a list of potential social media profiles for a given username
 */
export const getSocialMediaProfiles = (username: string, fullName: string) => {
  const platforms = [
    {
      platform: "Twitter",
      url: `https://twitter.com/${username}`,
      username: `@${username}`,
      icon: "𝕏",
      color: "#1DA1F2"
    },
    {
      platform: "LinkedIn",
      url: `https://linkedin.com/in/${username}`,
      username: fullName,
      icon: "in",
      color: "#0077B5"
    },
    {
      platform: "Facebook",
      url: `https://facebook.com/${username}`,
      username: fullName,
      icon: "f",
      color: "#4267B2"
    },
    {
      platform: "GitHub",
      url: `https://github.com/${username}`,
      username: username,
      icon: "🐙",
      color: "#333333"
    },
    {
      platform: "Behance",
      url: `https://behance.net/${username}`,
      username: username,
      icon: "Be",
      color: "#053eff"
    },
    {
      platform: "About.me",
      url: `https://about.me/${username}`,
      username: username,
      icon: "A",
      color: "#00A98F"
    },
    {
      platform: "Fiverr",
      url: `https://fiverr.com/${username}`,
      username: username,
      icon: "Fi",
      color: "#1DBF73"
    },
    {
      platform: "Giphy",
      url: `https://giphy.com/${username}`,
      username: username,
      icon: "G",
      color: "#FF6666"
    },
    {
      platform: "Archive.org",
      url: `https://archive.org/details/@${username}`,
      username: username,
      icon: "📚",
      color: "#2A4B87"
    },
    {
      platform: "Gravatar",
      url: `https://gravatar.com/${username}`,
      username: username,
      icon: "G",
      color: "#1E8CBE"
    }
  ];

  return platforms;
};
