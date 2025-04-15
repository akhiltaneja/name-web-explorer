import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

// Import the blog data
import { blogPosts } from "./blogData";

const BlogIndex = () => {
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
                
                <Button asChild className="mt-4 self-start">
                  <Link to={`/blog/${featuredPost.slug}`} className="flex items-center">
                    Read Article
                    <ChevronRight size={18} className="ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <Separator className="my-12" />
        
        {/* Other Posts */}
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Latest Articles</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map(post => (
            <Card key={post.id} className="flex flex-col h-full group hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  <Link to={`/blog/${post.slug}`} className="hover:text-blue-700 transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pb-2">
                <p className="text-gray-600">{post.summary}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="text-blue-600 p-0 hover:bg-transparent hover:text-blue-800">
                  <Link to={`/blog/${post.slug}`} className="flex items-center">
                    Read Article
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
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

export default BlogIndex;
