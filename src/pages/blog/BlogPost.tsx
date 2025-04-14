
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Tag, Calendar } from "lucide-react";

// Import the blog data
import { blogPosts } from "./blogData";

const BlogPost = () => {
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

export default BlogPost;
