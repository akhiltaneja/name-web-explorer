
import { SocialMediaProfile } from "@/types/socialMedia";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePdfReport = (searchName: string, profiles: SocialMediaProfile[]): jsPDF => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text(`Social Media Report: ${searchName}`, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${format(new Date(), 'PPP')} at ${format(new Date(), 'p')}`, 14, 30);
  
  // Add info
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Found ${profiles.length} social media profiles matching "${searchName}"`, 14, 40);
  
  // Create table
  const tableColumn = ["Platform", "Username", "Status", "Category", "URL"];
  const tableRows = profiles.map(profile => [
    profile.platform,
    profile.username,
    profile.status || "Unknown",
    profile.category || "General",
    profile.url
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 135, 245], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    margin: { top: 10 },
  });
  
  // Add branding
  doc.setFontSize(12);
  doc.setTextColor(66, 135, 245);
  doc.text("CandidateChecker.io", 14, doc.internal.pageSize.height - 20);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("The ultimate social profile search tool", 14, doc.internal.pageSize.height - 16);
  
  // Add footer with page numbers
  const pageCount = doc.internal.pages.length - 1;
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 100);
    doc.text(`CandidateChecker.io - Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
  }
  
  return doc;
};

export const downloadPdfReport = (searchName: string, profiles: SocialMediaProfile[]): void => {
  try {
    const doc = generatePdfReport(searchName, profiles);
    doc.save(`${searchName.replace(/\s+/g, "_")}_social_report.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

export const emailPdfReport = async (email: string, searchName: string, profiles: SocialMediaProfile[]): Promise<boolean> => {
  try {
    const doc = generatePdfReport(searchName, profiles);
    const pdfBase64 = doc.output('datauristring');
    
    // Simulate email sending (in a real app this would call an API)
    console.log(`Email report for "${searchName}" would be sent to ${email} with PDF attachment`);
    console.log("PDF data:", pdfBase64.substring(0, 100) + "...");
    
    // For this demo, we'll just simulate a successful email
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1500);
    });
  } catch (error) {
    console.error("Error generating email report:", error);
    return false;
  }
};
