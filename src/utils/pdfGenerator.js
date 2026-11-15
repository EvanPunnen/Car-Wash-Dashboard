import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Builds standardized vehicle filename:
 * e.g. KL-05-BE-6091_Toyota-Hyrider_2026-03-07.pdf
 */
export function getVehicleFileName(bill, extension = 'pdf') {
  const veh = (bill.vehicleNumber || 'Vehicle').trim().replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
  const make = (bill.vehicleMake || 'Car').trim().replace(/[^a-zA-Z0-9]/g, '-');
  const dateStr = (bill.date || new Date().toISOString().split('T')[0]).replace(/[^0-9-]/g, '');
  return `${veh}_${make}_${dateStr}.${extension}`;
}

/**
 * Captures clean unscaled A4 canvas from invoice element without CSS transform distortion or scrolling offset
 */
async function captureInvoiceCanvas(elementId) {
  const source = document.getElementById(elementId) || document.getElementById('invoice-to-print');
  if (!source) {
    throw new Error('Invoice preview element not found.');
  }

  // Clone source into an isolated offscreen container with NO transforms and top:0
  const clone = source.cloneNode(true);
  clone.id = 'invoice-pdf-clone-active';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.width = '794px'; // standard 96dpi A4 width in px
  clone.style.minHeight = '1123px';
  clone.style.position = 'fixed';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.zIndex = '999999';
  clone.style.backgroundColor = '#ffffff';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.overflow = 'visible';

  document.body.appendChild(clone);

  // Wait for fonts and images to load
  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise(r => setTimeout(r, 60));

  const cloneHeight = Math.max(1123, clone.scrollHeight);

  const canvas = await html2canvas(clone, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 794,
    height: cloneHeight,
    windowWidth: 794,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0
  });

  document.body.removeChild(clone);
  return canvas;
}

/**
 * Generates and downloads a pristine, pixel-perfect A4 PDF matching the exact DODO invoice format
 */
export async function downloadInvoicePDF(elementId, bill) {
  const fileName = getVehicleFileName(bill, 'pdf');
  const canvas = await captureInvoiceCanvas(elementId);
  const imgData = canvas.toDataURL('image/png', 1.0);

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
  } else {
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(fileName);
  return fileName;
}

/**
 * Saves directly to Phone/PC File Manager using the File System Access API
 */
export async function saveToFileManager(elementId, bill) {
  const fileName = getVehicleFileName(bill, 'pdf');

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'A4 PDF Invoice',
          accept: { 'application/pdf': ['.pdf'] }
        }]
      });

      const canvas = await captureInvoiceCanvas(elementId);
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * 210) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, 210, Math.min(297, imgHeight), undefined, 'FAST');
      const blob = pdf.output('blob');

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { success: true, fileName };
    } catch (err) {
      if (err.name === 'AbortError') return { canceled: true };
      console.warn('File picker canceled or unsupported, falling back to download', err);
    }
  }

  // Fallback to standard download
  await downloadInvoicePDF(elementId, bill);
  return { success: true, fileName };
}

/**
 * Triggers native system print dialog (configured for A4)
 */
export function printInvoice() {
  window.print();
}

/**
 * Opens Google Drive upload page or search for mrdododetailers@gmail.com
 */
export function openGoogleDrive(account = 'mrdododetailers@gmail.com') {
  const url = `https://drive.google.com/drive/u/0/my-drive`;
  window.open(url, '_blank');
}

/**
 * Shares invoice details to WhatsApp with pre-filled message
 */
export function shareInvoiceWhatsApp(bill, settings) {
  const customerName = `${bill.titlePrefix || 'Mr:'} ${bill.customerName || 'Valued Customer'}`.trim();
  const phone = (bill.customerPhone || '').replace(/[^0-9]/g, '');
  const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

  const itemsList = (bill.items || [])
    .map((item, idx) => `${idx + 1}. ${item.description}: ₹${Number(item.amount || 0).toLocaleString('en-IN')}`)
    .join('\n');

  const subtotal = (bill.items || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const discount = Number(bill.discount) || 0;
  const total = subtotal - discount;

  const text = `*${settings?.shopName || 'Mr. DODO'}* - ${settings?.shopSubtitle || 'PREMIUM DETAILING & CAR WASH'}
📍 ${settings?.address || 'Manarcad - Thiruvanchoor Bypass Road, Kottayam'}
📞 ${settings?.phones || '8138037450, 9947885856'}
✉️ ${settings?.email || 'mrdododetailers@gmail.com'}
──────────────────
*INVOICE: ${bill.invoiceNumber || 'BILL'}*
📅 *Date:* ${bill.displayDate || bill.date}

👤 *Customer:* ${customerName}
🚗 *Vehicle No:* ${bill.vehicleNumber || 'N/A'}
🚘 *Make / Model:* ${bill.vehicleMake || 'N/A'}
${bill.managerName ? `👨‍💼 *Billed By:* ${bill.managerName}\n` : ''}──────────────────
*Services Rendered:*
${itemsList}

*Subtotal:* ₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
${discount > 0 ? `*Discount:* -₹${discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` : ''}*TOTAL AMOUNT:* ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
──────────────────
${bill.warrantyNote ? `📌 *Warranty:* ${bill.warrantyNote}\n──────────────────\n` : ''}*${settings?.footerThankYou || 'Thank You'}*
${settings?.footerTeam || 'Team MR DODO'}`;

  const encodedText = encodeURIComponent(text);
  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank');
}
