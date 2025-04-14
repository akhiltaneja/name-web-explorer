import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Tag, Calendar } from "lucide-react";

// Sample blog data - in a real app, this would come from a database
const blogPosts = [
  {
    id: 1,
    slug: "find-someones-online-footprint",
    title: "How to Find Someone's Online Footprint Using Just Their Name or Username",
    summary: "Discover techniques and tools to uncover digital traces and social media profiles with minimal information.",
    content: `
      <h2>Introduction</h2>
      <p>In today's digital world, almost everyone leaves traces of their online activity across various platforms. Whether you're trying to reconnect with an old friend, verify someone's identity, or conduct due diligence for professional reasons, finding someone's online footprint can provide valuable insights.</p>
      
      <h2>Start with Basic Search Techniques</h2>
      <p>Begin with a simple search of the person's name in quotation marks in search engines. This helps narrow down results to exact matches. If the name is common, add qualifiers like location, profession, or interests if you know them.</p>
      
      <h2>Username Search</h2>
      <p>Usernames are often reused across platforms. If you know a username from one platform, try searching for it on others. Tools like PeoplePeeper can automate this process by checking dozens of sites simultaneously.</p>
      
      <h2>Reverse Image Search</h2>
      <p>If you have a photo of the person, a reverse image search can reveal where else that image appears online, potentially leading to profiles you weren't aware of.</p>
      
      <h2>Social Media Cross-Referencing</h2>
      <p>Once you find one social profile, look for links to other platforms. Many people cross-promote their accounts or include links in their bios.</p>
      
      <h2>Advanced Search Operators</h2>
      <p>Learn to use advanced search operators like "site:" to search specific websites, or "inurl:" to find mentions of a name within URLs.</p>
      
      <h2>Privacy Considerations</h2>
      <p>Always respect privacy and legal boundaries when conducting online searches. Use this information ethically and responsibly.</p>
      
      <h2>Conclusion</h2>
      <p>Finding someone's online footprint doesn't require advanced technical skills—just patience and the right approach. Start with the basics and gradually expand your search using the techniques mentioned above.</p>
    `,
    author: "Digital Investigation Team",
    date: "April 12, 2025",
    tags: ["OSINT", "Digital Investigation", "Online Privacy"],
    image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    slug: "candidate-internet-presence-hiring",
    title: "Why Checking a Candidate's Internet Presence Should Be Part of Every Hiring Process",
    summary: "Learn how reviewing a candidate's online footprint can provide valuable insights for recruiters and hiring managers.",
    content: `
      <h2>The Digital First Impression</h2>
      <p>Before candidates walk through your door for an interview, they've already created numerous digital footprints across the internet. These online traces can provide valuable insights beyond what's visible on a resume or cover letter.</p>
      
      <h2>Beyond the Resume</h2>
      <p>Resumes are carefully curated documents that show candidates in the best possible light. Online profiles, especially those created years ago, can offer a more authentic picture of who they are professionally and personally.</p>
      
      <h2>Red Flags and Green Lights</h2>
      <p>Online screening can reveal both potential concerns and positive attributes. Inappropriate content might raise red flags, while professional articles, industry contributions, or thoughtful discussions can signal a passionate, engaged candidate.</p>
      
      <h2>Legal and Ethical Considerations</h2>
      <p>While online screening is valuable, it must be conducted ethically and legally. Avoid making decisions based on protected characteristics, and implement a consistent screening process for all candidates.</p>
      
      <h2>Implementing a Structured Approach</h2>
      <p>Rather than casual browsing, develop a structured approach to online screening. Create a checklist of platforms to review and specific professional attributes you're looking for.</p>
      
      <h2>Tools for Efficient Screening</h2>
      <p>Manual searches across dozens of platforms can be time-consuming. Tools like PeoplePeeper can streamline this process by automatically checking multiple sites for a candidate's online presence.</p>
      
      <h2>Balancing Online Presence with Other Factors</h2>
      <p>An online presence check should be just one component of your hiring process, not the determining factor. Balance it with interviews, references, and skills assessments for a complete picture.</p>
    `,
    author: "HR Professional",
    date: "April 10, 2025",
    tags: ["Hiring", "HR", "Recruitment"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  // ... other blog posts would follow
];

// Blog index page component
export const BlogIndex = () => {
  const [featuredPost, ...otherPosts] = blogPosts;
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">PeoplePeeper Blog</h1>
          <p className="mt-4 text-xl text-gray-600">Insights on Digital Footprints, Online Privacy, and Social Media Research</p>
        </div>
        
        {/* Featured Post */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold mb-4">
                    <Link to={`/blog/${featuredPost.slug}`} className="hover:text-blue-700 transition-colors">
                      {featuredPost.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-lg mb-6">
                    {featuredPost.summary}
                  </CardDescription>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <User size={16} className="mr-2" />
                    <span>{featuredPost.author}</span>
                    <span className="mx-2">•</span>
                    <Calendar size={16} className="mr-2" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <Button asChild className="mt-2">
                    <Link to={`/blog/${featuredPost.slug}`}>
                      Read More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <Separator className="my-12" />
        
        {/* Other Posts */}
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Latest Articles</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map(post => (
            <Card key={post.id} className="flex flex-col h-full">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link to={`/blog/${post.slug}`} className="hover:text-blue-700 transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">{post.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-0">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <span>{post.date}</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Individual blog post component
export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would be a database query
    const foundPost = blogPosts.find(p => p.slug === slug);
    setPost(foundPost);
    setLoading(false);
  }, [slug]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-12 w-1/2"></div>
            
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mb-6">
                <div className="h-6 bg-gray-200 rounded mb-3 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Button asChild>
            <Link to="/blog">Return to Blog</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8">
          ← Back to all articles
        </Link>
        
        <article>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center text-gray-600 mb-8">
            <div className="flex items-center mr-6">
              <User size={18} className="mr-2" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center mr-6">
              <Calendar size={18} className="mr-2" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
              <Tag size={18} className="mr-2" />
              {post.tags.map((tag: string, i: number) => (
                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-80 object-cover rounded-lg mb-8"
          />
          
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        
        <Separator className="my-12" />
        
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Discover More With PeoplePeeper</h2>
          <p className="mb-6">Ready to explore digital footprints? Try our advanced social profile search engine.</p>
          <Button asChild>
            <Link to="/">Start Searching Now</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Default export for the router
const Blog = {
  Index: BlogIndex,
  Post: BlogPost
};

export default Blog;
