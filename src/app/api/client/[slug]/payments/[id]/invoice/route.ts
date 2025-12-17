import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface CartItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const paymentId = params.id;

    // Fetch payment data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment status is accepted
    const acceptedStatuses = ['Accepted', 'accepted', 'approved', 'completed'];
    if (!acceptedStatuses.includes(payment.status)) {
      return NextResponse.json(
        { error: 'Invoice can only be downloaded for accepted payments' },
        { status: 400 }
      );
    }

    // Fetch company information
    const companyId = payment.company_id;
    
    let company;
    let companyError;
    
    if (companyId) {
      const result = await supabase
        .from('companies')
        .select('id, name, logo_url, slug, country, currency')
        .eq('id', companyId)
        .single();
      company = result.data;
      companyError = result.error;
    } else {
      const result = await supabase
        .from('companies')
        .select('id, name, logo_url, slug, country, currency')
        .eq('slug', params.slug)
        .single();
      company = result.data;
      companyError = result.error;
    }

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch website settings
    const { data: websiteSettings } = await supabase
      .from('website_settings')
      .select('contact_email, contact_phone, contact_location, logo_url')
      .eq('company_id', company.id)
      .single();

    const companyLogo = websiteSettings?.logo_url || company.logo_url;
    const companyEmail = websiteSettings?.contact_email || null;
    const companyPhone = websiteSettings?.contact_phone || null;
    const companyAddress = websiteSettings?.contact_location || company.country || null;

    // Parse cart items
    let cartItems: CartItem[] = [];
    if (payment.metadata) {
      try {
        const metadata = typeof payment.metadata === 'string' 
          ? JSON.parse(payment.metadata) 
          : payment.metadata;
        
        if (metadata.cart_items && Array.isArray(metadata.cart_items)) {
          cartItems = metadata.cart_items.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name || 'Product',
            quantity: item.quantity || 1,
            unit_price: parseFloat(item.unit_price || item.price_at_add || 0),
            total_price: parseFloat(item.total_price || (item.quantity * (item.unit_price || item.price_at_add || 0))),
            image: item.image || item.product_image || null,
          }));
        }
      } catch (e) {
        console.error('Error parsing cart items:', e);
      }
    }

    // Generate PDF with jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Add company logo if available
    let logoWidth = 0;
    let logoHeight = 0;
    let logoDataUrl = null;
    
    if (companyLogo) {
      try {
        const logoResponse = await fetch(companyLogo, {
          headers: { 'Accept': 'image/*' },
        });
        
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoArrayBuffer = await logoBlob.arrayBuffer();
          const logoBase64 = Buffer.from(logoArrayBuffer).toString('base64');
          const mimeType = logoBlob.type || 'image/png';
          logoDataUrl = `data:${mimeType};base64,${logoBase64}`;
          
          const maxLogoWidth = 30;
          const maxLogoHeight = 18;
          let aspectRatio = 1.2;
          
          const logoUrlLower = companyLogo.toLowerCase();
          if (logoUrlLower.includes('wide') || logoUrlLower.includes('banner') || logoUrlLower.includes('horizontal')) {
            aspectRatio = 2.5;
          } else if (logoUrlLower.includes('square') || logoUrlLower.includes('icon')) {
            aspectRatio = 1.0;
          }
          
          logoWidth = maxLogoWidth;
          logoHeight = maxLogoWidth / aspectRatio;
          
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight;
            logoWidth = logoHeight * aspectRatio;
          }
          
          if (logoWidth < 15) {
            logoWidth = 15;
            logoHeight = logoWidth / aspectRatio;
          }
          
          let imageFormat = 'PNG';
          if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
            imageFormat = 'JPEG';
          } else if (mimeType.includes('png')) {
            imageFormat = 'PNG';
          }
          
          doc.addImage(logoDataUrl, imageFormat, margin, yPos, logoWidth, logoHeight);
        }
      } catch (error) {
        console.error('Error loading company logo:', error);
      }
    }

    // Top Section: Logo + Company Name (Left) | Invoice # + Address (Right)
    const topSectionY = yPos;
    
    // Left side: Logo and Company Name
    if (logoDataUrl) {
      // Logo is already added
      // Company name below logo
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235); // Blue-600
      doc.text(company.name || 'Company', margin, yPos + logoHeight + 5);
    } else {
      // No logo, just company name
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(company.name || 'Company', margin, yPos + 10);
    }
    
    // Right side: Invoice # and Address
    const rightSectionX = pageWidth - margin;
    let rightY = topSectionY;
    
    // Invoice # header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice #', rightSectionX, rightY, { align: 'right' });
    rightY += 6;
    
    // Invoice number
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(payment.reference_number || payment.id.slice(0, 8).toUpperCase(), rightSectionX, rightY, { align: 'right' });
    rightY += 12;
    
    // Company address (right side)
    if (companyAddress) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const addressLines = doc.splitTextToSize(companyAddress, 80);
      doc.text(addressLines, rightSectionX, rightY, { align: 'right' });
      rightY += addressLines.length * 5;
    }
    
    // Update yPos to below logo/company name section
    yPos = topSectionY + (logoDataUrl ? logoHeight + 25 : 20);

    // Bill To and Invoice Date Section
    const billToSectionY = yPos;
    
    // Left: Bill To
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Bill to:', margin, billToSectionY);
    
    let billToY = billToSectionY + 8;
    if (payment.payer_name) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(payment.payer_name, margin, billToY);
      billToY += 8;
    }
    
    if (payment.payer_email || payment.billing_address) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      if (payment.billing_address) {
        const billingLines = doc.splitTextToSize(payment.billing_address, 80);
        doc.text(billingLines, margin, billToY);
        billToY += billingLines.length * 5;
      }
      if (payment.payer_email) {
        doc.text(payment.payer_email, margin, billToY);
        billToY += 5;
      }
    }
    
    // Right: Invoice Date and Due Date
    const invoiceDateX = pageWidth - margin;
    let invoiceDateY = billToSectionY;
    
    // Invoice date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice date:', invoiceDateX - 40, invoiceDateY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const invoiceDate = new Date(payment.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(invoiceDate, invoiceDateX, invoiceDateY, { align: 'right' });
    invoiceDateY += 8;
    
    // Due date
    const dueDate = payment.payment_date 
      ? new Date(payment.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date(new Date(payment.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Due date:', invoiceDateX - 40, invoiceDateY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(dueDate, invoiceDateX, invoiceDateY, { align: 'right' });
    
    // Update yPos to below Bill To section
    yPos = Math.max(billToY, invoiceDateY) + 15;

    // Products Table with proper formatting
    if (cartItems.length > 0) {
      yPos += 5;
      
      const tableStartY = yPos;
      const cellPadding = 5;
      const cellPaddingVertical = 6;
      const columnSpacing = 6;
      
      // Column widths (in mm)
      const colItemWidth = 50;
      const colQtyWidth = 25;
      const colRateWidth = 25;
      const colAmountWidth = 25;
      
      // Column X positions
      const colItemX = margin + cellPadding;
      const colQtyX = margin + colItemWidth + columnSpacing;
      const colRateX = colQtyX + colQtyWidth + columnSpacing;
      const colAmountX = colRateX + colRateWidth + columnSpacing;
      
      // Table header
      const headerY = tableStartY;
      const headerHeight = 12;
      
      // Header background
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, headerY, contentWidth, headerHeight, 'F');
      
      // Header text (matching preview: Product, Quantity, Unit Price, Total)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('PRODUCT', colItemX, headerY + cellPaddingVertical + 4);
      doc.text('QUANTITY', colQtyX + (colQtyWidth / 2), headerY + cellPaddingVertical + 4, { align: 'center' });
      doc.text('UNIT PRICE', colRateX + (colRateWidth / 2), headerY + cellPaddingVertical + 4, { align: 'center' });
      doc.text('TOTAL', colAmountX + (colAmountWidth / 2), headerY + cellPaddingVertical + 4, { align: 'center' });
      
      // Header bottom border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, headerY + headerHeight, pageWidth - margin, headerY + headerHeight);
      
      // Vertical borders for columns
      doc.setLineWidth(0.4);
      doc.line(colQtyX - (columnSpacing / 2), headerY, colQtyX - (columnSpacing / 2), headerY + headerHeight);
      doc.line(colRateX - (columnSpacing / 2), headerY, colRateX - (columnSpacing / 2), headerY + headerHeight);
      doc.line(colAmountX - (columnSpacing / 2), headerY, colAmountX - (columnSpacing / 2), headerY + headerHeight);
      
      yPos = headerY + headerHeight + 3;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      let subtotal = 0;
      cartItems.forEach((item, index) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
          
          // Redraw header on new page
          doc.setFillColor(248, 249, 250);
          doc.rect(margin, yPos, contentWidth, headerHeight, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('PRODUCT', colItemX, yPos + cellPaddingVertical + 4);
          doc.text('QUANTITY', colQtyX + (colQtyWidth / 2), yPos + cellPaddingVertical + 4, { align: 'center' });
          doc.text('UNIT PRICE', colRateX + (colRateWidth / 2), yPos + cellPaddingVertical + 4, { align: 'center' });
          doc.text('TOTAL', colAmountX + (colAmountWidth / 2), yPos + cellPaddingVertical + 4, { align: 'center' });
          
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos + headerHeight, pageWidth - margin, yPos + headerHeight);
          doc.setLineWidth(0.4);
          doc.line(colQtyX - (columnSpacing / 2), yPos, colQtyX - (columnSpacing / 2), yPos + headerHeight);
          doc.line(colRateX - (columnSpacing / 2), yPos, colRateX - (columnSpacing / 2), yPos + headerHeight);
          doc.line(colAmountX - (columnSpacing / 2), yPos, colAmountX - (columnSpacing / 2), yPos + headerHeight);
          
          yPos += headerHeight + 3;
        }
        
        const rowStartY = yPos;
        
        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(252, 252, 253);
          doc.rect(margin, rowStartY, contentWidth, 12, 'F');
        }
        
        // Calculate row height
        const productName = doc.splitTextToSize(item.product_name, colItemWidth - (cellPadding * 2));
        const nameHeight = productName.length * 5;
        const rowHeight = Math.max(nameHeight + (cellPaddingVertical * 2), 12);
        
        // Item name
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(productName, colItemX, yPos + cellPaddingVertical + 4);
        
        // Quantity
        doc.setFont('helvetica', 'normal');
        doc.text(item.quantity.toString(), colQtyX + (colQtyWidth / 2), yPos + cellPaddingVertical + 4, { align: 'center' });
        
        // Rate
        const unitPrice = `${item.unit_price.toFixed(2)} ${payment.currency || 'USD'}`;
        doc.text(unitPrice, colRateX + (colRateWidth / 2), yPos + cellPaddingVertical + 4, { align: 'center' });
        
        // Amount
        const total = `${item.total_price.toFixed(2)} ${payment.currency || 'USD'}`;
        doc.text(total, colAmountX + (colAmountWidth / 2), yPos + cellPaddingVertical + 4, { align: 'center' });
        
        subtotal += item.total_price;
        
        // Draw row borders
        doc.setDrawColor(230, 232, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, rowStartY + rowHeight, pageWidth - margin, rowStartY + rowHeight);
        doc.line(colQtyX - (columnSpacing / 2), rowStartY, colQtyX - (columnSpacing / 2), rowStartY + rowHeight);
        doc.line(colRateX - (columnSpacing / 2), rowStartY, colRateX - (columnSpacing / 2), rowStartY + rowHeight);
        doc.line(colAmountX - (columnSpacing / 2), rowStartY, colAmountX - (columnSpacing / 2), rowStartY + rowHeight);
        
        yPos += rowHeight + 2;
      });
      
      // Draw outer table border
      const tableEndY = yPos - 2;
      doc.setDrawColor(200, 205, 210);
      doc.setLineWidth(0.6);
      doc.rect(margin, tableStartY, contentWidth, tableEndY - tableStartY);
      
      yPos += 10;
      
      // Totals section
      const totalsBoxWidth = 90;
      const totalsBoxX = pageWidth - margin - totalsBoxWidth;
      let totalsY = yPos;
      
      // Subtotal
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Subtotal:', totalsBoxX, totalsY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const subtotalFormatted = subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      doc.text(`${subtotalFormatted} ${payment.currency || 'USD'}`, totalsBoxX + totalsBoxWidth, totalsY, { align: 'right' });
      totalsY += 8;
      
      // Total
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Total:', totalsBoxX, totalsY, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const totalFormatted = payment.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      doc.text(`${totalFormatted} ${payment.currency || 'USD'}`, totalsBoxX + totalsBoxWidth, totalsY, { align: 'right' });
      totalsY += 15;
      
      yPos = totalsY;
    } else {
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', pageWidth - margin - 2, yPos, { align: 'right' });
      yPos += 8;
      doc.setFontSize(16);
      doc.text(`${payment.currency || 'USD'} ${payment.amount.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
      yPos += 15;
    }

    // Additional Notes, Payment Terms, Payment Information
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 10;
    
    // Additional notes
    if (payment.payment_notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Additional notes:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitNotes = doc.splitTextToSize(payment.payment_notes, contentWidth);
      doc.text(splitNotes, margin, yPos);
      yPos += splitNotes.length * 5 + 8;
    }
    
    // Payment terms
    let paymentTerms = null;
    if (payment.metadata) {
      try {
        const metadata = typeof payment.metadata === 'string' ? JSON.parse(payment.metadata) : payment.metadata;
        paymentTerms = metadata.payment_terms || metadata.paymentTerms;
      } catch (e) {
        // Ignore
      }
    }
    
    if (paymentTerms) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Payment terms:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitTerms = doc.splitTextToSize(paymentTerms, contentWidth);
      doc.text(splitTerms, margin, yPos);
      yPos += splitTerms.length * 5 + 8;
    }
    
    // Payment Information
    let paymentInfo = null;
    if (payment.metadata) {
      try {
        const metadata = typeof payment.metadata === 'string' ? JSON.parse(payment.metadata) : payment.metadata;
        paymentInfo = metadata.payment_information || metadata.paymentInformation;
      } catch (e) {
        // Ignore
      }
    }
    
    if (paymentInfo || payment.payment_method) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Please send the payment to this address', margin, yPos);
      yPos += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      if (paymentInfo) {
        if (paymentInfo.bankName) {
          doc.text(`Bank: ${paymentInfo.bankName}`, margin, yPos);
          yPos += 5;
        }
        if (paymentInfo.accountName) {
          doc.text(`Account name: ${paymentInfo.accountName}`, margin, yPos);
          yPos += 5;
        }
        if (paymentInfo.accountNumber) {
          doc.text(`Account no: ${paymentInfo.accountNumber}`, margin, yPos);
          yPos += 5;
        }
      } else if (payment.payment_method) {
        doc.text(`Payment Method: ${payment.payment_method}`, margin, yPos);
        yPos += 5;
      }
      yPos += 8;
    }
    
    // Contact Information
    if (companyEmail || companyPhone) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('If you have any questions concerning this invoice, use the following contact information:', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      if (companyEmail) {
        doc.text(companyEmail, margin, yPos);
        yPos += 6;
      }
      if (companyPhone) {
        doc.text(companyPhone, margin, yPos);
        yPos += 6;
      }
    }

    // Footer
    yPos = pageHeight - 15;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('This is an automatically generated invoice.', pageWidth / 2, yPos, { align: 'center' });

    // Generate PDF buffer
    try {
      const pdfOutput = doc.output('arraybuffer');
      
      // Validate PDF was generated
      if (!pdfOutput || pdfOutput.byteLength === 0) {
        throw new Error('PDF generation failed: empty output');
      }
      
      // Convert ArrayBuffer to Buffer
      const pdfBuffer = Buffer.from(pdfOutput);
      
      // Validate buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF buffer conversion failed');
      }

      // Return PDF with proper headers
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${payment.reference_number || payment.id.slice(0, 8)}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (pdfError) {
      console.error('Error in PDF generation:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate invoice',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
