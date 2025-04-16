
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Tag, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Import the blog data
import { blogPosts } from "./blogData";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  
  useEffect(() => {
    // In a real app, this would be a database query
    const foundPost = blogPosts.find(p => p.slug === slug);
    
    // If it's the Sharenting post, fix the image URL
    if (foundPost && foundPost.title.includes("Sharenting")) {
      foundPost.image = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=2400&q=80";
    }
    
    setPost(foundPost);
    
    // Find related posts (excluding current post)
    if (foundPost) {
      const related = blogPosts
        .filter(p => p.slug !== slug)
        .sort(() => 0.5 - Math.random()) // Simple randomization
        .slice(0, 2); // Get 2 random posts
      setRelatedPosts(related);
    }
    
    setLoading(false);
  }, [slug]);
  
  // Format content with proper styling for headings
  const formatContent = (content: string) => {
    // Replace <h2> tags with styled headings
    return content.replace(
      /<h2>(.*?)<\/h2>/g, 
      '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>'
    ).replace(
      /<p>(.*?)<\/p>/g,
      '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>'
    );
  };
  
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
        
        <article className="mb-16">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
          
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
          
          <div 
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} 
          />
          
          {/* Animated Call-to-Action Banner */}
          <motion.div 
            className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white shadow-lg overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="absolute inset-0 bg-white opacity-10"
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            <h2 className="text-3xl font-bold mb-4 relative z-10">Discover Anyone's Internet Footprint</h2>
            <p className="text-lg mb-6 relative z-10">Find digital traces and social media profiles with our powerful people search engine.</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                asChild 
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 text-lg relative z-10"
                size="lg"
              >
                <Link to="/">Try Now</Link>
              </Button>
            </motion.div>
          </motion.div>
          
        </article>
        
        <Separator className="my-12" />
        
        {/* Read More Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Discover More Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link 
                key={relatedPost.id}
                to={`/blog/${relatedPost.slug}`}
                className="flex group hover:shadow-md transition-shadow rounded-lg overflow-hidden border"
              >
                <div className="w-1/3">
                  <img 
                    src={relatedPost.image} 
                    alt={relatedPost.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <h4 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {relatedPost.title}
                  </h4>
                  <div className="flex items-center text-blue-600 mt-auto text-sm">
                    Read Article
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
