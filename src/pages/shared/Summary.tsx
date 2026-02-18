import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 15;

const Summary = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.events.list();
      // Filter out drafts if necessary, but typically summary shows submitted events
      const submittedEvents = data.filter((e: any) => e.status !== 'draft');
      setEvents(submittedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events summary");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];
    
    // Sort by created_at descending (newest first)
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (approvalFilter === "all") return result;
    if (approvalFilter === "pending") {
      return result.filter(e => e.status !== "approved" && e.status !== "rejected" && e.status !== "cancelled");
    }
    if (approvalFilter === "approved") {
      return result.filter(e => e.status === "approved");
    }
    return result;
  }, [events, approvalFilter]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedEvents, currentPage]);

  const downloadExcel = () => {
    const data = filteredAndSortedEvents.map((event, index) => ({
      "S.No": index + 1,
      "Title": event.title,
      "Dept/Club/Society/Direct to HOD": event.department_club || "N/A",
      "Event Date": event.event_date ? (
        event.end_date && event.event_date !== event.end_date 
          ? `${format(new Date(event.event_date), "dd/MM/yyyy")} - ${format(new Date(event.end_date), "dd/MM/yyyy")}`
          : format(new Date(event.event_date), "dd/MM/yyyy")
      ) : "N/A",
      "Submitted on": event.created_at ? format(new Date(event.created_at), "dd/MM/yyyy HH:mm:ss") : "N/A",
      "Approved by HOD": event.hod_approval_at ? format(new Date(event.hod_approval_at), "dd/MM/yyyy HH:mm:ss") : "N/A",
      "Approved by Dean": event.dean_approval_at ? format(new Date(event.dean_approval_at), "dd/MM/yyyy HH:mm:ss") : "N/A",
      "Approved by Principal": event.principal_approval_at ? format(new Date(event.principal_approval_at), "dd/MM/yyyy HH:mm:ss") : "N/A",
      "Report Generated on": event.report_submitted_at ? format(new Date(event.report_submitted_at), "dd/MM/yyyy HH:mm:ss") : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events Summary");
    XLSX.writeFile(workbook, `Events_Summary_${approvalFilter}_${format(new Date(), "ddMMyyyy")}.xlsx`);
    toast.success("Summary downloaded successfully");
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Events Summary
          </h1>
          <p className="text-slate-500 mt-1 font-medium">View and export the status of all event requests.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={approvalFilter} onValueChange={(val) => { setApprovalFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-[200px] bg-white border-slate-200 rounded-xl shadow-sm">
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={downloadExcel} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            <Download className="h-4 w-4" />
            Download XLSX
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800">Summary Report</CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {approvalFilter} Records: {filteredAndSortedEvents.length}
            </div>
            {totalPages > 1 && (
              <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100/50">
                <TableRow>
                  <TableHead className="w-16 font-bold text-slate-700">S.No</TableHead>
                  <TableHead className="font-bold text-slate-700 min-w-[200px]">Title</TableHead>
                  <TableHead className="font-bold text-slate-700">Dept/Club/Society/Direct to HOD</TableHead>
                  <TableHead className="font-bold text-slate-700">Event Date</TableHead>
                  <TableHead className="font-bold text-slate-700">Submitted on</TableHead>
                  <TableHead className="font-bold text-slate-700">Approved by HOD</TableHead>
                  <TableHead className="font-bold text-slate-700">Approved by Dean</TableHead>
                  <TableHead className="font-bold text-slate-700">Approved by Principal</TableHead>
                  <TableHead className="font-bold text-slate-700">Report Generated on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <FileText className="h-12 w-12 mb-2" />
                        <p className="font-bold text-lg uppercase tracking-widest">No matching events found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEvents.map((event, index) => {
                    const sNo = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                      <TableRow key={event.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-medium text-slate-500">{sNo}</TableCell>
                        <TableCell className="font-bold text-slate-900">{event.title}</TableCell>
                        <TableCell className="font-medium text-slate-600">{event.department_club || "N/A"}</TableCell>
                        <TableCell className="font-bold text-primary text-sm">
                          {event.event_date ? (
                            event.end_date && event.event_date !== event.end_date 
                              ? `${format(new Date(event.event_date), "dd/MM/yyyy")} - ${format(new Date(event.end_date), "dd/MM/yyyy")}`
                              : format(new Date(event.event_date), "dd/MM/yyyy")
                          ) : "N/A"}
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {event.created_at ? format(new Date(event.created_at), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                        </TableCell>
                        <TableCell>
                          {event.hod_approval_at ? (
                            <span className="text-emerald-600 font-bold text-sm">
                              {format(new Date(event.hod_approval_at), "dd/MM/yyyy HH:mm:ss")}
                            </span>
                          ) : (
                            <span className="text-slate-300">---</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.dean_approval_at ? (
                            <span className="text-emerald-600 font-bold text-sm">
                              {format(new Date(event.dean_approval_at), "dd/MM/yyyy HH:mm:ss")}
                            </span>
                          ) : (
                            <span className="text-slate-300">---</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.principal_approval_at ? (
                            <span className="text-emerald-600 font-bold text-sm">
                              {format(new Date(event.principal_approval_at), "dd/MM/yyyy HH:mm:ss")}
                            </span>
                          ) : (
                            <span className="text-slate-300">---</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.report_submitted_at ? (
                            <span className="text-indigo-600 font-bold text-sm">
                              {format(new Date(event.report_submitted_at), "dd/MM/yyyy HH:mm:ss")}
                            </span>
                          ) : (
                            <span className="text-slate-300">---</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-white border-t flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium font-mono uppercase">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedEvents.length)} of {filteredAndSortedEvents.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Show only current page and its neighbors, and first/last
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl font-bold transition-all ${currentPage === pageNum ? 'shadow-md shadow-primary/20' : ''}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Summary;
