
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
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 100);
    doc.text(`CandidateChecker.io - Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }
  
  return doc;
};

export const downloadPdfReport = (searchName: string, profiles: SocialMediaProfile[]): void => {
  const doc = generatePdfReport(searchName, profiles);
  doc.save(`${searchName.replace(/\s+/g, "_")}_social_report.pdf`);
};

export const emailPdfReport = async (email: string, searchName: string, profiles: SocialMediaProfile[]): Promise<boolean> => {
  try {
    const doc = generatePdfReport(searchName, profiles);
    const pdfBase64 = doc.output('datauristring');
    
    // In a real implementation, you would call an API to send the email
    console.log(`Email report for "${searchName}" would be sent to ${email} with PDF attachment`);
    
    // For this demo, we'll just return success
    return true;
  } catch (error) {
    console.error("Error generating email report:", error);
    return false;
  }
};
