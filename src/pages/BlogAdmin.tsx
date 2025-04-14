
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  EyeIcon, 
  ImageIcon, 
  TagIcon,
  SearchIcon,
  Save,
  Calendar,
  RefreshCw,
  Upload,
  ChevronDown,
  Settings,
  Layers
} from "lucide-react";

// Fake blog data - would be fetched from API in real app
const mockBlogPosts = [
  {
    id: 1,
    title: "How to Find Someone's Online Footprint Using Just Their Name or Username",
    slug: "find-someones-online-footprint",
    excerpt: "Discover techniques and tools to uncover digital traces and social media profiles with minimal information.",
    status: "published",
    author: "Digital Investigation Team",
    date: "April 12, 2025",
    category: "OSINT",
    tags: ["OSINT", "Digital Investigation", "Online Privacy"],
    image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    title: "Why Checking a Candidate's Internet Presence Should Be Part of Every Hiring Process",
    slug: "candidate-internet-presence-hiring",
    excerpt: "Learn how reviewing a candidate's online footprint can provide valuable insights for recruiters and hiring managers.",
    status: "published",
    author: "HR Professional",
    date: "April 10, 2025",
    category: "HR",
    tags: ["Hiring", "HR", "Recruitment"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 3,
    title: "Top 5 Tools to Investigate Online Profiles — Free and Paid Options Compared",
    slug: "top-tools-investigate-online-profiles",
    excerpt: "A comparison of the best tools for digital footprint analysis and social media investigation.",
    status: "draft",
    author: "Tech Reviewer",
    date: "April 7, 2025",
    category: "Tools",
    tags: ["Tools", "Review", "Comparison"],
    image: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 4,
    title: "What is Digital Footprinting? How It Works and Why It Matters in 2025",
    slug: "digital-footprinting-explained",
    excerpt: "Understanding digital footprints and their importance in today's connected world.",
    status: "draft",
    author: "Privacy Expert",
    date: "April 5, 2025",
    category: "Privacy",
    tags: ["Digital Footprint", "Privacy", "Online Security"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
];

// Mock categories and tags for the editor
const categories = ["OSINT", "HR", "Tools", "Privacy", "Marketing", "Security", "Education"];
const popularTags = ["Digital Footprint", "Privacy", "Social Media", "OSINT", "Hiring", "Recruitment", "Online Security", "Digital Identity"];

const BlogAdmin = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState(mockBlogPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  
  // Filter posts based on search term
  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleNewPost = () => {
    const newPost = {
      id: Date.now(),
      title: "New Blog Post",
      slug: "new-blog-post",
      excerpt: "Enter a brief summary of your post here.",
      content: "<p>Start writing your blog post content here...</p>",
      status: "draft",
      author: profile?.full_name || user?.email || "Anonymous",
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }),
      category: "",
      tags: [],
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    };
    
    setBlogPosts([...blogPosts, newPost]);
    setCurrentPost(newPost);
    setIsEditing(true);
    
    toast({
      title: "New post created",
      description: "You can now start editing your new blog post.",
    });
  };
  
  const handleEditPost = (post: any) => {
    setCurrentPost(post);
    setIsEditing(true);
  };
  
  const handleDeleteClick = (post: any) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    setBlogPosts(blogPosts.filter(post => post.id !== postToDelete.id));
    setDeleteDialogOpen(false);
    setPostToDelete(null);
    
    toast({
      title: "Post deleted",
      description: "The blog post has been permanently deleted.",
    });
    
    if (currentPost && currentPost.id === postToDelete.id) {
      setCurrentPost(null);
      setIsEditing(false);
    }
  };
  
  const handleSavePost = () => {
    if (!currentPost) return;
    
    // Update the posts list with the edited post
    setBlogPosts(blogPosts.map(post => 
      post.id === currentPost.id ? currentPost : post
    ));
    
    toast({
      title: "Post saved",
      description: "Your blog post has been saved successfully.",
    });
  };
  
  const handlePublish = () => {
    if (!currentPost) return;
    
    const updatedPost = { ...currentPost, status: "published" };
    
    setBlogPosts(blogPosts.map(post => 
      post.id === currentPost.id ? updatedPost : post
    ));
    
    setCurrentPost(updatedPost);
    
    toast({
      title: "Post published",
      description: "Your blog post is now live and visible to readers.",
    });
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="mb-8">You need to be logged in to access the blog admin panel.</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Check if user has admin privileges
  const isAdmin = profile?.role === "admin";
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-8">You need admin privileges to access the blog management panel.</p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <div className="flex gap-4">
            <Link to="/blog">
              <Button variant="outline">
                <EyeIcon size={16} className="mr-2" />
                View Blog
              </Button>
            </Link>
            <Button onClick={handleNewPost}>
              <PlusIcon size={16} className="mr-2" />
              New Post
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Blog Posts</CardTitle>
                  <Button variant="ghost" size="sm">
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  Manage your blog posts, drafts, and publications.
                </CardDescription>
                <div className="mt-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No blog posts found.</p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div 
                        key={post.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          currentPost?.id === post.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleEditPost(post)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 truncate max-w-[200px]">
                            {post.title}
                          </h3>
                          <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {post.date}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPost(post);
                              }}
                            >
                              <PencilIcon size={14} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(post);
                              }}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {isEditing && currentPost ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Edit Post</h2>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSavePost}
                        >
                          <Save size={16} className="mr-2" />
                          Save Draft
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handlePublish}
                        >
                          {currentPost.status === 'published' ? 'Update' : 'Publish'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Post Title</label>
                        <Input 
                          value={currentPost.title} 
                          onChange={(e) => setCurrentPost({...currentPost, title: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Slug</label>
                        <div className="flex items-center mt-1">
                          <span className="text-gray-500 mr-1">yourdomain.com/blog/</span>
                          <Input 
                            value={currentPost.slug} 
                            onChange={(e) => setCurrentPost({...currentPost, slug: e.target.value})}
                            className="flex-grow"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Excerpt/Summary</label>
                        <Textarea 
                          value={currentPost.excerpt} 
                          onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
                          className="mt-1 h-20"
                        />
                      </div>
                      
                      <Tabs defaultValue="content">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="content">Content</TabsTrigger>
                          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
                          <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="content" className="pt-4">
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-2 border-b flex items-center space-x-2">
                              <Button variant="ghost" size="sm">Paragraph</Button>
                              <Button variant="ghost" size="sm">Heading</Button>
                              <Button variant="ghost" size="sm">Bold</Button>
                              <Button variant="ghost" size="sm">Italic</Button>
                              <Button variant="ghost" size="sm">Link</Button>
                              <Button variant="ghost" size="sm">
                                <ImageIcon size={16} />
                              </Button>
                            </div>
                            <Textarea 
                              value={currentPost.content || "<p>Start writing your blog post content here...</p>"} 
                              onChange={(e) => setCurrentPost({...currentPost, content: e.target.value})}
                              className="h-96 rounded-none border-0 focus:ring-0"
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="seo" className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Meta Title</label>
                            <Input 
                              value={currentPost.metaTitle || currentPost.title} 
                              onChange={(e) => setCurrentPost({...currentPost, metaTitle: e.target.value})}
                              className="mt-1"
                              placeholder="SEO-optimized title for search engines"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Meta Description</label>
                            <Textarea 
                              value={currentPost.metaDescription || currentPost.excerpt} 
                              onChange={(e) => setCurrentPost({...currentPost, metaDescription: e.target.value})}
                              className="mt-1 h-20"
                              placeholder="Brief description that appears in search results"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Focus Keyword</label>
                            <Input 
                              value={currentPost.focusKeyword || ""} 
                              onChange={(e) => setCurrentPost({...currentPost, focusKeyword: e.target.value})}
                              className="mt-1"
                              placeholder="Main keyword for this article"
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="settings" className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Featured Image</label>
                            <div className="mt-1 flex items-center">
                              <div className="mr-4 h-20 w-32 overflow-hidden rounded border">
                                {currentPost.image ? (
                                  <img 
                                    src={currentPost.image} 
                                    alt="Featured" 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                <Upload size={16} className="mr-2" />
                                Upload Image
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <div className="relative mt-1">
                              <select 
                                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={currentPost.category || ""}
                                onChange={(e) => setCurrentPost({...currentPost, category: e.target.value})}
                              >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <TagIcon size={16} className="mr-2" />
                              Tags
                            </label>
                            <div className="mt-1">
                              <Input 
                                placeholder="Add tags separated by commas" 
                                value={currentPost.tags.join(", ")} 
                                onChange={(e) => setCurrentPost({
                                  ...currentPost, 
                                  tags: e.target.value.split(",").map((tag: string) => tag.trim()).filter(Boolean)
                                })}
                              />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {popularTags.map(tag => (
                                <Badge 
                                  key={tag}
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-blue-50"
                                  onClick={() => {
                                    if (!currentPost.tags.includes(tag)) {
                                      setCurrentPost({
                                        ...currentPost,
                                        tags: [...currentPost.tags, tag]
                                      });
                                    }
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Author</label>
                            <Input 
                              value={currentPost.author} 
                              onChange={(e) => setCurrentPost({...currentPost, author: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Publication Date</label>
                            <Input 
                              type="date"
                              value={currentPost.rawDate || new Date().toISOString().split('T')[0]} 
                              onChange={(e) => setCurrentPost({
                                ...currentPost, 
                                rawDate: e.target.value,
                                date: new Date(e.target.value).toLocaleDateString('en-US', {
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric'
                                })
                              })}
                              className="mt-1"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-12 flex flex-col items-center justify-center text-center">
                <Layers className="h-16 w-16 text-gray-300 mb-6" />
                <h3 className="text-xl font-medium mb-2">No Post Selected</h3>
                <p className="text-gray-500 mb-6">Select a post to edit or create a new one.</p>
                <Button onClick={handleNewPost}>
                  <PlusIcon size={16} className="mr-2" />
                  Create New Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default BlogAdmin;
