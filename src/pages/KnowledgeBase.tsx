
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Code, Database, Search, Server, ShieldCheck } from "lucide-react";

const KnowledgeBase = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="container mx-auto py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Knowledge Base
                </span>
              </h1>
              <p className="text-xl text-gray-700">
                Learn about the technology and methodology behind CandidateChecker
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <Tabs defaultValue="technology" className="w-full">
              <TabsList className="mb-8 w-full justify-start border-b pb-px">
                <TabsTrigger value="technology" className="text-base">Technology Stack</TabsTrigger>
                <TabsTrigger value="methodology" className="text-base">Methodology</TabsTrigger>
                <TabsTrigger value="faq" className="text-base">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="technology" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Code className="h-6 w-6 text-blue-600" />
                      <CardTitle>Frontend Technology</CardTitle>
                    </div>
                    <CardDescription>
                      The technologies used to build the user interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li>
                        <h3 className="font-semibold text-gray-900">React</h3>
                        <p className="text-gray-600">
                          A JavaScript library for building user interfaces with component-based architecture.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">TypeScript</h3>
                        <p className="text-gray-600">
                          A strongly typed programming language that builds on JavaScript, giving better tooling and error prevention.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">Tailwind CSS</h3>
                        <p className="text-gray-600">
                          A utility-first CSS framework for rapidly building custom user interfaces without writing CSS.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">Shadcn UI</h3>
                        <p className="text-gray-600">
                          A collection of reusable components built with Radix UI and Tailwind CSS.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">React Router</h3>
                        <p className="text-gray-600">
                          A collection of navigational components for managing routing in React applications.
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Server className="h-6 w-6 text-blue-600" />
                      <CardTitle>Backend Technology</CardTitle>
                    </div>
                    <CardDescription>
                      The technologies used to handle data and server-side operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li>
                        <h3 className="font-semibold text-gray-900">Supabase</h3>
                        <p className="text-gray-600">
                          An open-source Firebase alternative providing database, authentication, and storage services.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">PostgreSQL</h3>
                        <p className="text-gray-600">
                          A powerful, open-source object-relational database system used for data storage.
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />
                      <CardTitle>Security Features</CardTitle>
                    </div>
                    <CardDescription>
                      How we keep your data secure and private
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li>
                        <h3 className="font-semibold text-gray-900">Authentication</h3>
                        <p className="text-gray-600">
                          User authentication is handled through Supabase Authentication, providing secure email/password login.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">Row Level Security (RLS)</h3>
                        <p className="text-gray-600">
                          Our database uses Row Level Security to ensure users can only access their own data.
                        </p>
                      </li>
                      <li>
                        <h3 className="font-semibold text-gray-900">Data Encryption</h3>
                        <p className="text-gray-600">
                          All data is encrypted in transit using HTTPS and at rest in our database.
                        </p>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="methodology" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Search className="h-6 w-6 text-blue-600" />
                      <CardTitle>Search Methodology</CardTitle>
                    </div>
                    <CardDescription>
                      How we find and verify social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Profile Identification</h3>
                        <p className="text-gray-600">
                          CandidateChecker uses advanced pattern matching algorithms to generate potential username formats based on the provided name. These patterns are based on common username conventions across different platforms.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Verification Process</h3>
                        <p className="text-gray-600">
                          Once potential profiles are identified, our system performs real-time verification checks using HTTP requests to determine if the profiles actually exist. This process includes:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                          <li>Analyzing HTTP status codes</li>
                          <li>Checking for platform-specific error pages</li>
                          <li>Processing redirect chains</li>
                          <li>Validating profile content markers</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Categorization</h3>
                        <p className="text-gray-600">
                          Profiles are automatically categorized based on platform type (Social Network, Professional, Creative, etc.) to help users quickly find the most relevant profiles for their needs.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Database className="h-6 w-6 text-blue-600" />
                      <CardTitle>Data Handling</CardTitle>
                    </div>
                    <CardDescription>
                      How we handle and protect user data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Privacy-First Approach</h3>
                        <p className="text-gray-600">
                          CandidateChecker is designed with privacy as a core principle. We only store the minimum information necessary to provide our service:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600">
                          <li>For authenticated users: Search queries and result counts (not the actual results)</li>
                          <li>For guest users: Only temporary session data that expires after 24 hours</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">No Third-Party Sharing</h3>
                        <p className="text-gray-600">
                          We do not sell or share your search data with any third parties. Your searches remain private and are only visible to you in your account history.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-blue-600" />
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Is CandidateChecker free to use?</h3>
                        <p className="text-gray-600">
                          We offer a free tier that allows guests to perform up to 3 searches per day. Registered users with a free account also get 3 searches per day. Premium and unlimited plans are available for users who need more searches.
                        </p>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">How accurate are the results?</h3>
                        <p className="text-gray-600">
                          Our system uses sophisticated verification techniques, but accuracy depends on several factors including name uniqueness and profile visibility settings. We typically achieve 85-95% accuracy for profiles that are publicly accessible.
                        </p>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Can people know I searched for them?</h3>
                        <p className="text-gray-600">
                          No. CandidateChecker performs passive searches that don't interact with the profiles directly. The people you search for will not receive any notifications or know that you looked them up.
                        </p>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">What if I need to search many profiles?</h3>
                        <p className="text-gray-600">
                          Our premium plans are designed for users who need to perform multiple searches. The Premium plan allows 500 searches per day, while the Unlimited plan has no daily search limit.
                        </p>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Can I search for someone using their email address?</h3>
                        <p className="text-gray-600">
                          Currently, CandidateChecker only supports searches by name. Email-based searches may be added in a future update.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default KnowledgeBase;
