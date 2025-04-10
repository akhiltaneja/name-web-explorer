
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to the most common questions about CandidateChecker and how to make the most of the tool.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border border-gray-200">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              What is CandidateChecker?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              CandidateChecker is a tool designed to help you find and verify online presence across multiple social media platforms. Enter a name, and we'll search for profiles across various platforms to help you build a complete picture of someone's online footprint.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              How accurate are the search results?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              Our tool uses a combination of search methods to find potential profiles. We verify the availability of these profiles, but cannot guarantee that every profile belongs to the exact person you're searching for, especially for common names. Always review the results carefully.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              How many searches can I perform?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              Free users can perform 3 searches per day. Premium users get 500 searches per month, and Unlimited plan users have no search restrictions. To increase your search limit, consider upgrading your plan.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              Can I download or share the search results?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              Yes, you can download search results as a PDF report or share them via email. The reports include all found profiles with clickable links and are formatted for easy reading and sharing.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              What social networks do you search?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              We search across major social networks including Twitter, Facebook, LinkedIn, Instagram, TikTok, YouTube, GitHub, and many more. Results are categorized by type (Social Network, Professional, Creativity, etc.) to help you easily find what you're looking for.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              Is my search history saved?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              For registered users, we save your search history to make it easy to access previous searches. As a guest user, your searches are stored locally on your device but not in our system.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
