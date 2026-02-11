import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Download, UploadCloud, Loader2, Twitter, Facebook, Instagram, Linkedin, Youtube, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn, isEventFinished } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 6;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

const ACTIVITY_LEAD_BY_OPTIONS = [
  'Institute Council',
  'Student Council',
];

const socialMediaPlatforms = [
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
] as const;

const formSchema = z.object({
  student_participants: z.coerce.number().int().min(0, 'Cannot be negative'),
  faculty_participants: z.coerce.number().int().min(0, 'Cannot be negative'),
  external_participants: z.coerce.number().int().min(0, 'Cannot be negative'),
  activity_lead_by: z.string().min(1, 'Activity lead is required'),
  final_report_remarks: z.string().optional(),
  photos: z.array(z.instanceof(File)).min(MIN_PHOTOS, `At least ${MIN_PHOTOS} photos are required`).max(MAX_PHOTOS, `Maximum ${MAX_PHOTOS} photos allowed`),
  social_media_selection: z.array(z.string()).optional(),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  youtube_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ReportFormData = z.infer<typeof formSchema>;

type ReportData = {
  aiObjective: string;
  photoUrls: string[];
  formData: ReportFormData;
  durationHours: number;
  password?: string;
  regenerationCount?: number;
};

type EventReportGeneratorDialogProps = {
  event: any;
  isOpen: boolean;
  onClose: () => void;
};

// Helper function to calculate duration in hours
const calculateDurationHours = (event: any): number => {
  if (!event.event_date || !event.start_time || !event.end_time) return 0;

  try {
    const startDate = parseISO(event.event_date);
    const endDate = event.end_date ? parseISO(event.end_date) : startDate;

    const [startH, startM] = event.start_time.split(':').map(Number);
    const [endH, endM] = event.end_time.split(':').map(Number);

    // 1. Calculate daily duration (in milliseconds)
    const startOfDay = new Date(2000, 0, 1, startH, startM).getTime();
    const endOfDay = new Date(2000, 0, 1, endH, endM).getTime();
    
    // Handle overnight events (e.g., 10 PM to 2 AM) - though unlikely for this context, we ensure end > start
    let dailyDurationMs = endOfDay - startOfDay;
    if (dailyDurationMs < 0) {
      // If end time is before start time, assume it spans midnight (e.g., 9 PM to 4 AM)
      dailyDurationMs += 24 * 60 * 60 * 1000; 
    }

    const dailyDurationHours = dailyDurationMs / (1000 * 60 * 60);

    // 2. Calculate total number of days (inclusive)
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // 3. Calculate total duration
    const totalDuration = dailyDurationHours * totalDays;

    return Math.max(1, Math.round(totalDuration * 10) / 10); // Round to one decimal place, minimum 1 hour
  } catch (e) {
    console.error("Error calculating duration:", e);
    return 1;
  }
};


const EventReportGeneratorDialog = ({ event, isOpen, onClose }: EventReportGeneratorDialogProps) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Preview
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<HTMLDivElement>(null);
  
  const durationHours = useMemo(() => calculateDurationHours(event), [event]);

  useEffect(() => {
    if (isOpen && event && !isEventFinished(event)) {
      toast.error('Cannot access report generator for unfinished events.');
      onClose();
      return;
    }

    const fetchExistingReport = async () => {
      if (!isOpen || !event?.id || !event.has_report) return;
      
      setIsLoadingReport(true);
      try {
        const report = await api.reports.get(event.id);
        
        // Prepare data for preview
        const formattedReportData: ReportData = {
          aiObjective: event.objective || '', // Fallback or fetch from AI if needed, but usually we save it
          photoUrls: report.report_photo_urls || [],
          formData: {
            student_participants: report.student_participants,
            faculty_participants: report.faculty_participants,
            external_participants: report.external_participants,
            activity_lead_by: report.activity_lead_by || 'Institute Council', // Fallback if missing
            final_report_remarks: report.final_report_remarks,
            photos: [], // Files aren't needed in read-only mode
            social_media_selection: Object.keys(report.social_media_links || {}),
            twitter_url: report.social_media_links?.twitter || '',
            facebook_url: report.social_media_links?.facebook || '',
            instagram_url: report.social_media_links?.instagram || '',
            linkedin_url: report.social_media_links?.linkedin || '',
            youtube_url: report.social_media_links?.youtube || '',
          },
          durationHours: event.activity_duration_hours || calculateDurationHours(event),
          password: report.report_password,
          regenerationCount: report.regeneration_count || 0,
        };

        // Try to regenerate AI objective if empty, or use existing event objective
        if (!formattedReportData.aiObjective && (event.title || event.description)) {
           // We might want to keep the AI generation logic here if it wasn't saved in event.objective
        }

        setReportData(formattedReportData);
        setIsReadOnly(true);
        setStep(2);
      } catch (error) {
        console.error('Failed to fetch existing report:', error);
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchExistingReport();
  }, [isOpen, event, onClose]);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_participants: event?.student_participants ?? 0,
      faculty_participants: event?.faculty_participants ?? 0,
      external_participants: event?.external_participants ?? 0,
      activity_lead_by: event?.activity_lead_by || '',
      final_report_remarks: event?.final_report_remarks || '',
      photos: [],
      social_media_selection: [],
      twitter_url: '',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
      youtube_url: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentFiles = form.getValues('photos') || [];
    const newFiles = [...currentFiles, ...acceptedFiles].slice(0, MAX_PHOTOS);
    // Warning if trying to add more than max
    if ([...currentFiles, ...acceptedFiles].length > MAX_PHOTOS) {
       toast.warning(`You can only upload up to ${MAX_PHOTOS} photos.`);
    }
    form.setValue('photos', newFiles, { shouldValidate: true });
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] },
    maxFiles: MAX_PHOTOS,
    maxSize: MAX_PHOTO_SIZE,
  });

  const removePhoto = (index: number) => {
    const currentFiles = form.getValues('photos');
    const newFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue('photos', newFiles, { shouldValidate: true });
  };

  const handleGenerateReport = async (formData: ReportFormData) => {
    setIsGenerating(true);
    
    try {
      // 1. Upload Photos to Backend
      const uploadResult = await api.uploads.multiple(formData.photos);
      const photoUrls = uploadResult.urls;

      // 2. Call AI Service for Objective
      const aiResult = await api.ai.generateObjective({
        title: event.title,
        objective: event.objective,
        description: event.description,
      });
      const aiObjective = aiResult.objective;

      // 3. Prepare Social Media Links
      const social_media_links: { [key: string]: string } = {};
      if (formData.twitter_url) social_media_links.twitter = formData.twitter_url;
      if (formData.facebook_url) social_media_links.facebook = formData.facebook_url;
      if (formData.instagram_url) social_media_links.instagram = formData.instagram_url;
      if (formData.linkedin_url) social_media_links.linkedin = formData.linkedin_url;
      if (formData.youtube_url) social_media_links.youtube = formData.youtube_url;

      // 4. Update Event Record (legacy, but keep for consistency) and Save to event_reports
      await Promise.all([
        api.events.update(event.id, {
          student_participants: formData.student_participants,
          faculty_participants: formData.faculty_participants,
          external_participants: formData.external_participants,
          activity_lead_by: formData.activity_lead_by,
          activity_duration_hours: durationHours,
          final_report_remarks: formData.final_report_remarks,
          report_photo_urls: photoUrls,
          social_media_links,
        }),
        api.reports.upsert(event.id, {
          final_report_remarks: formData.final_report_remarks,
          student_participants: formData.student_participants,
          faculty_participants: formData.faculty_participants,
          external_participants: formData.external_participants,
          social_media_links,
          report_photo_urls: photoUrls,
          activity_lead_by: formData.activity_lead_by, // Adding this to the body as well
        })
      ]);

      const savedReport = await api.reports.get(event.id);

      setReportData({ aiObjective, photoUrls, formData, durationHours, password: savedReport.report_password });
      setIsReadOnly(true); // Once generated, it becomes read-only in this session
      setStep(2);
      toast.success('Report generated and saved successfully.');
    } catch (e: any) {
      toast.error(`Report generation failed: ${e.message}`);
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.outerHTML;
    const printableContainer = document.createElement('div');
    printableContainer.className = 'printable-container';
    printableContainer.innerHTML = printContents;
    document.body.appendChild(printableContainer);
    toast.info("Your browser's print dialog will open. Please select 'Save as PDF'.");
    setTimeout(() => {
      window.print();
      document.body.removeChild(printableContainer);
    }, 500);
  };

  const handleDownloadPDF = async () => {
    if (!reportContentRef.current || !attachmentsRef.current || !reportData?.password) return;
    
    setIsGenerating(true);
    const toastId = toast.loading("Generating secure PDF...");
    
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        encryption: {
          userPassword: reportData.password,
          ownerPassword: reportData.password,
          userPermissions: ['print', 'modify', 'copy', 'annot-forms']
        }
      });
      
      const addElementToPdf = async (element: HTMLElement, firstPage: boolean = false) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = contentHeight;
        let position = 0;

        if (!firstPage) {
          pdf.addPage();
        }

        // Add first image chunk
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content exceeds one page
        while (heightLeft > 0) {
          position = heightLeft - contentHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
          heightLeft -= pdfHeight;
        }
      };

      // 1. Add Main Content
      await addElementToPdf(reportContentRef.current, true);
      
      // 2. Add Attachments Section (Always starts on new page)
      await addElementToPdf(attachmentsRef.current);
      
      pdf.save(`Activity_Report_${event.title.replace(/\s+/g, '_')}.pdf`);
      toast.success("Secure PDF downloaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("PDF Error:", error);
      toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;
    const { aiObjective, photoUrls, formData, durationHours } = reportData;

    return (
      <div className="printable-report bg-white text-black p-8 font-serif flex flex-col min-h-[29.7cm]" ref={reportRef}>
        <div ref={reportContentRef} className="bg-white">
          <div className="flex-grow">
            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-black pb-2">
              <img src="/ace.jpeg" alt="ACE Logo" className="h-28 w-28 object-contain" />
              <div className="text-center">
                <h1 className="text-2xl font-bold">ADHIYAMAAN COLLEGE OF ENGINEERING</h1>
                <p className="text-sm font-semibold">(An Autonomous Institution)</p>
                <p className="text-xs">Affiliated to Anna University, Chennai</p>
                <p className="text-xs">Dr. M. G. R. Nagar, Hosur - 635130</p>
              </div>
              <img src="/iic.jpg" alt="IIC Logo" className="h-28 w-28 object-contain" />
            </header>

            {/* Titles */}
            <div className="text-center my-4">
              <h2 className="text-xl font-bold">Institution's Innovation Council</h2>
              <h3 className="text-lg">Activity Report Copy</h3>
            </div>

            {/* Section 1: Event Details */}
            <section className="p-2">
              <div className="text-sm space-y-1">
                {/* Row 1 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Academic Year:</span><span className="col-span-2">{event.academic_year}</span>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Program Driven By:</span><span className="col-span-2">{event.program_driven_by}</span>
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Quarter:</span><span className="col-span-2">{event.quarter}</span>
                </div>
                {/* Row 4 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Program/Activity Name:</span><span className="col-span-2">{event.title}</span>
                </div>
                {/* Row 5 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Program Type:</span><span className="col-span-2">{event.program_type}</span>
                </div>
                {/* Row 6 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Activity Lead By:</span><span className="col-span-2">{formData.activity_lead_by}</span>
                </div>
                {/* Row 7 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Program Theme:</span><span className="col-span-2">{event.program_theme}</span>
                </div>
                {/* Row 8 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Duration (hours):</span><span className="col-span-2">{durationHours}</span>
                </div>
                {/* Row 9 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Start Date:</span><span className="col-span-2">{format(new Date(event.event_date), 'dd-MM-yyyy')}</span>
                </div>
                {/* Row 10 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">End Date:</span><span className="col-span-2">{format(new Date(event.end_date || event.event_date), 'dd-MM-yyyy')}</span>
                </div>
                {/* Row 11 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">No. of Student Participants:</span><span className="col-span-2">{formData.student_participants}</span>
                </div>
                {/* Row 12 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">No. of Faculty Participants:</span><span className="col-span-2">{formData.faculty_participants}</span>
                </div>
                {/* Row 13 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">No. of External Participants:</span><span className="col-span-2">{formData.external_participants}</span>
                </div>
                {/* Row 14 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Expenditure Amount:</span><span className="col-span-2">{event.budget_estimate > 0 ? `Rs. ${event.budget_estimate}` : 'N/A'}</span>
                </div>
                {/* Row 15 */}
                <div className="grid grid-cols-4 border-b border-gray-200 pb-1">
                  <span className="font-bold col-span-2">Remarks:</span><span className="col-span-2">{formData.final_report_remarks || 'N/A'}</span>
                </div>
                {/* Row 16 (Last row, no border-b) */}
                <div className="grid grid-cols-4 pt-1">
                  <span className="font-bold col-span-2">Mode of Session:</span><span className="col-span-2 capitalize">{event.mode_of_event}</span>
                </div>
              </div>
            </section>

            {/* Section 2: Overview */}
            <section className="p-2 mt-4">
              <h4 className="font-bold text-center text-md mb-2 border-b border-gray-300 pb-1">Overview</h4>
              <div className="grid grid-cols-2 gap-x-4 text-sm space-y-2">
                <div><h5 className="font-bold mb-1">Objective:</h5><p>{aiObjective}</p></div>
                <div><h5 className="font-bold mb-1">Benefits in terms of learning/Skill/Knowledge Obtained:</h5><p>{event.proposed_outcomes}</p></div>
              </div>
            </section>
          </div>
        </div>

        <div ref={attachmentsRef} className="bg-white">
          {/* Section 3: Attachments */}
          <section className="p-2 mt-4">
            <h4 className="font-bold text-center text-md mb-2 border-b border-gray-300 pb-1">Attachments</h4>
            <div className="grid grid-cols-2 gap-4">
              {photoUrls.map((url, index) => (
                <div key={index} className="border border-gray-300 p-1">
                  <img src={url} alt={`Event Photo ${index + 1}`} className="w-full h-48 object-contain" />
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Social Media */}
          <section className="p-2 mt-4">
            <h4 className="font-bold text-center text-md mb-2 border-b border-gray-300 pb-1">Promotion in Social Media</h4>
            <table className="w-full text-sm border-collapse border border-black">
              <thead><tr><th className="border border-black p-1">Social Media</th><th className="border border-black p-1">URL</th></tr></thead>
              <tbody>
                {Object.entries(reportData.formData).filter(([key]) => key.endsWith('_url') && key !== 'photos').map(([key, value]) => {
                  if (!value) return null;
                  const platform = key.replace('_url', '');
                  return (<tr key={key}><td className="border border-black p-1 capitalize">{platform}</td><td className="border border-black p-1 break-all">{String(value)}</td></tr>);
                })}
              </tbody>
            </table>
          </section>

          {/* Section 5: Signature Labels */}
          <section className="mt-12 pb-4 grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-32 border-t border-black mb-1"></div>
              <span className="text-xs font-bold uppercase">Coordinator</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 border-t border-black mb-1"></div>
              <span className="text-xs font-bold uppercase">HOD</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 border-t border-black mb-1"></div>
              <span className="text-xs font-bold uppercase">DEAN</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 border-t border-black mb-1"></div>
              <span className="text-xs font-bold uppercase">PRINCIPAL</span>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const handleClose = () => {
    setStep(1);
    setReportData(null);
    setIsReadOnly(false);
    form.reset();
    onClose();
  };

  const selectedSocialMedia = form.watch('social_media_selection') || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-4xl max-h-[95vh] overflow-y-auto", step === 2 && "sm:max-w-6xl")}>
        <DialogHeader className="print:hidden">
          <DialogTitle>Generate Final Report: {event?.title}</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Step 1: Provide post-event details and upload photos.' : 'Step 2: Review and download the final report.'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateReport)} className="space-y-6">
              {/* Section 1 Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="student_participants" render={({ field }) => (<FormItem><FormLabel>No. of Student Participants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="faculty_participants" render={({ field }) => (<FormItem><FormLabel>No. of Faculty Participants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="external_participants" render={({ field }) => (<FormItem><FormLabel>No. of External Participants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <FormField control={form.control} name="activity_lead_by" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Lead By</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_LEAD_BY_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormItem>
                  <FormLabel>Duration (in hours)</FormLabel>
                  <Input value={durationHours} disabled />
                  <FormDescription className="text-xs">Calculated from event start/end time.</FormDescription>
                </FormItem>
                
                <FormField control={form.control} name="final_report_remarks" render={({ field }) => (<FormItem className="md:col-span-3"><FormLabel>Final Remarks</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>

              {/* Photo Uploads */}
              <div>
                <FormLabel>Event Photos (Min {MIN_PHOTOS}, Max {MAX_PHOTOS}, JPEG/PNG, Max 2MB each)</FormLabel>
                <div {...getRootProps()} className={cn('p-8 mt-2 border-2 border-dashed rounded-md text-center cursor-pointer', isDragActive && 'border-primary bg-primary/10')}><input {...getInputProps()} /><UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" /><p>Drag & drop photos here, or click to select (Upload {MIN_PHOTOS} to {MAX_PHOTOS} photos)</p></div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {form.watch('photos').map((file, index) => (<div key={index} className="relative"><img src={URL.createObjectURL(file)} alt="preview" className="w-full h-24 object-cover rounded" /><Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removePhoto(index)}>X</Button></div>))}
                </div>
                <FormMessage>{form.formState.errors.photos?.message}</FormMessage>
              </div>

              {/* Social Media */}
              <div>
                <FormField control={form.control} name="social_media_selection" render={() => (
                  <FormItem>
                    <FormLabel>Social Media Promotion</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {socialMediaPlatforms.map((platform) => (<FormField key={platform.id} control={form.control} name="social_media_selection" render={({ field }) => (<FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value?.includes(platform.id)} onCheckedChange={(checked) => {return checked ? field.onChange([...(field.value || []), platform.id]) : field.onChange(field.value?.filter((v) => v !== platform.id))}} /></FormControl><platform.icon className="h-5 w-5" /><FormLabel>{platform.label}</FormLabel></FormItem>)} />))}
                    </div>
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {selectedSocialMedia.includes('twitter') && <FormField control={form.control} name="twitter_url" render={({ field }) => (<FormItem><FormLabel>Twitter URL</FormLabel><FormControl><Input {...field} placeholder="https://twitter.com/..." /></FormControl><FormMessage /></FormItem>)} />}
                  {selectedSocialMedia.includes('facebook') && <FormField control={form.control} name="facebook_url" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} placeholder="https://facebook.com/..." /></FormControl><FormMessage /></FormItem>)} />}
                  {selectedSocialMedia.includes('instagram') && <FormField control={form.control} name="instagram_url" render={({ field }) => (<FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} placeholder="https://instagram.com/..." /></FormControl><FormMessage /></FormItem>)} />}
                  {selectedSocialMedia.includes('linkedin') && <FormField control={form.control} name="linkedin_url" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} placeholder="https://linkedin.com/..." /></FormControl><FormMessage /></FormItem>)} />}
                  {selectedSocialMedia.includes('youtube') && <FormField control={form.control} name="youtube_url" render={({ field }) => (<FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input {...field} placeholder="https://youtube.com/..." /></FormControl><FormMessage /></FormItem>)} />}
                </div>
              </div>
              <DialogFooter><Button type="submit" disabled={isGenerating}>{isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate & Preview Report'}</Button></DialogFooter>
            </form>
          </Form>
        )}

        {step === 2 && (
          <>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 print:hidden space-y-2">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-sm text-amber-700 font-medium">
                  This report is password protected. Password: <span className="font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-200 select-all">{reportData?.password}</span>
                </p>
              </div>
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                <p className="text-[11px] text-amber-600 leading-tight">
                  <span className="font-bold">Security Note:</span> The "System Save" button below uses browser print which <span className="underline">cannot</span> be password protected. Use "Download Protected PDF" for a secure version.
                </p>
              </div>
            </div>
            {renderReportContent()}
            <DialogFooter className="print:hidden">
              {!isReadOnly ? (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isGenerating}>Back to Edit</Button>
              ) : (
                reportData && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsReadOnly(false);
                      setStep(1);
                    }} 
                    disabled={isGenerating}
                    className="mr-auto text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Regenerate Report
                  </Button>
                )
              )}
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Download Password Protected PDF
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventReportGeneratorDialog;