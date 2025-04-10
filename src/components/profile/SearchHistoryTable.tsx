
import { format, parseISO } from "date-fns";
import { Download, FileText, Mail, Search, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchHistory } from "@/types/socialMedia";
import { Link } from "react-router-dom";

interface SearchHistoryTableProps {
  searchHistory: SearchHistory[];
  onClearHistory: () => void;
  onViewResults: (query: string) => void;
  onDownloadReport: (query: string) => void;
  onEmailReport: (query: string) => void;
}

const SearchHistoryTable = ({
  searchHistory,
  onClearHistory,
  onViewResults,
  onDownloadReport,
  onEmailReport
}: SearchHistoryTableProps) => {
  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-800">Search History</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHistory}
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          <Trash className="h-4 w-4 mr-1" />
          Clear History
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Results</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchHistory.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <Link 
                    to={`/search/${encodeURIComponent(item.query)}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {item.query}
                  </Link>
                </TableCell>
                <TableCell>{format(parseISO(item.created_at), 'MMM d, yyyy - h:mm a')}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {item.result_count} results
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewResults(item.query)}
                      className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadReport(item.query)}
                      className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEmailReport(item.query)}
                      className="h-8 px-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SearchHistoryTable;
