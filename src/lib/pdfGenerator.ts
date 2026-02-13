import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const generateApprovalPDF = (event: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Reduced margin
  let yPos = 15; // Start higher

  // --- Header ---
  try {
    const aceLogo = new Image();
    aceLogo.src = '/ace.jpeg';
    doc.addImage(aceLogo, 'JPEG', margin, 10, 20, 20); // Smaller logo

    const iicLogo = new Image();
    iicLogo.src = '/iic.jpg';
    doc.addImage(iicLogo, 'JPEG', pageWidth - margin - 20, 10, 20, 20); // Smaller logo
  } catch (e) {
    console.error("Error adding logos", e);
  }

  // Text
  yPos = 18;
  doc.setFontSize(14); // Smaller header font
  doc.setFont('helvetica', 'bold');
  doc.text('Adhiyamaan College of Engineering (Autonomous)', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dr. M.G.R. Nagar, Hosur – 635130', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Draw line
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(14); // Smaller title
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT APPROVAL FORM', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // --- Event Details ---
  doc.setFontSize(10); // Reduced content font size
  const leftColX = margin;
  const rightColX = margin + 55;
  const valueWidth = pageWidth - rightColX - margin;

  const addDetail = (label: string, value: string | null | undefined, maxLines = 0) => {
    // Check for page break - try to avoid it by using less space
    // If strict single page, we might just clip or overlap if too long, but we'll try to fit.
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    
    let text = value || 'N/A';
    
    if (maxLines > 0) {
       const lines = doc.splitTextToSize(text, valueWidth);
       if (lines.length > maxLines) {
         text = lines.slice(0, maxLines).join(' ') + '...';
       }
    }

    const splitText = doc.splitTextToSize(text, valueWidth);
    doc.text(splitText, rightColX, yPos);
    
    // Tighter spacing: 5 per line + 3 padding
    yPos += (splitText.length * 5) + 2; 
  };

  // 1. Title
  addDetail('Event Title', event.title);
  
  // 2. Organized By
  addDetail('Organized By', event.department_club);
  
  // 3. Academic Year
  addDetail('Academic Year', event.academic_year);
  
  // 4. Program Driven By
  addDetail('Program Driven By', event.program_driven_by);
  
  // 5. Program Theme
  addDetail('Program Theme', event.program_theme);
  
  // 6. Program Type
  addDetail('Program Type', event.program_type);
  
  // 7. Date & Time
  const dateStr = `${format(new Date(event.event_date), 'dd MMM yyyy')} ${event.end_date ? ` - ${format(new Date(event.end_date), 'dd MMM yyyy')}` : ''}`;
  const timeStr = `${event.start_time} to ${event.end_time}`;
  addDetail('Date & Time', `${dateStr} | ${timeStr}`);
  
  // 8. Venue
  addDetail('Venue', event.venues?.name || event.other_venue_details);
  
  // 9. Event Mode
  addDetail('Event Mode', event.mode_of_event ? event.mode_of_event.charAt(0).toUpperCase() + event.mode_of_event.slice(1) : 'N/A');
  
  // 10. Event Category
  const categoryStr = Array.isArray(event.category) ? event.category.join(', ') : event.category;
  addDetail('Event Category', categoryStr);
  
  // 11. Objective (Max 2 lines)
  addDetail('Objective', event.objective, 2);
  
  // 12. Key Indicator / Outcomes (Max 2 lines)
  addDetail('Key Indicator', event.proposed_outcomes, 2);
  
  // 13. SDG Alignment
  const sdgStr = Array.isArray(event.sdg_alignment) ? event.sdg_alignment.join(', ') : event.sdg_alignment;
  addDetail('Alignment with SDGs', sdgStr);
  
  // 14. Target Audience
  const audienceStr = Array.isArray(event.target_audience) ? event.target_audience.join(', ') : event.target_audience;
  addDetail('Target Audience', audienceStr);

  // 15. Speaker Details
  const speakers = Array.isArray(event.speakers) 
    ? event.speakers.map((s: string, i: number) => `${s} (${event.speaker_details?.[i] || ''})`).join('; ')
    : 'N/A';
  // Truncate speakers if too long
  addDetail('Speaker Details', speakers, 2);
  
  // 16. Budget Estimation
  addDetail('Budget Estimation', event.budget_estimate && event.budget_estimate > 0 ? `Rs. ${event.budget_estimate}` : 'N/A');
  
  // 17. Funding Source
  if (event.budget_estimate && event.budget_estimate > 0) {
    const fundingStr = Array.isArray(event.funding_source) ? event.funding_source.join(', ') : event.funding_source;
    addDetail('Funding Source', fundingStr);
  }

  // --- Footer (Signatures) ---
  // Force footer to bottom of page, even if content pushes it down (overwrite if necessary to keep single page)
  yPos = pageHeight - 35; // Lower bottom margin
  
  const colWidth = (pageWidth - (2 * margin)) / 3;
  const col1X = margin + (colWidth / 2); // Center of col 1
  const col2X = margin + colWidth + (colWidth / 2); // Center of col 2
  const col3X = margin + (2 * colWidth) + (colWidth / 2); // Center of col 3

  const drawSignatureBlock = (x: number, label: string, approvedAt: string | null) => {
    // Approval Status
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0); // Green
    doc.text('APPROVED', x, yPos, { align: 'center' });
    
    // Timestamp (if available)
    if (approvedAt) {
      try {
        const dateStr = format(new Date(approvedAt), 'dd MMM yyyy');
        const timeStr = format(new Date(approvedAt), 'hh:mm a');
        doc.setFontSize(8); // Smaller timestamp
        doc.setTextColor(100, 100, 100); // Grey
        doc.text(dateStr, x, yPos + 4, { align: 'center' });
        doc.text(timeStr, x, yPos + 8, { align: 'center' });
      } catch (e) {
        // Fallback or skip if date invalid
      }
    }
    
    // Label
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10); // Smaller label
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, yPos + 18, { align: 'center' });
  };

  drawSignatureBlock(col1X, 'HOD / Convener', event.hod_approval_at);
  drawSignatureBlock(col2X, 'Dean (IR)', event.dean_approval_at);
  drawSignatureBlock(col3X, 'Principal', event.principal_approval_at);

  // Save the PDF
  doc.save(`Event_Approval_${(event.title || 'event').substring(0, 15).replace(/[^a-z0-9]/gi, '_')}.pdf`);
};
