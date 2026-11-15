import React from 'react';
import { LOGO_ICON_BASE64, LOGO_TEXT_BASE64 } from '../assets/logoData';
import { formatCurrency } from '../utils/storage';

/**
 * InvoiceSheet: Exact 1:1 reproduction of Mr. DODO Car Wash & Detailing Invoice
 * Styled to standard A4 (210mm x 297mm).
 */
export default function InvoiceSheet({ bill, settings, id = "invoice-to-print" }) {
  const currentSettings = settings || {};
  const items = bill?.items || [];

  // Financial calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const discount = Number(bill?.discount) || 0;
  const total = Math.max(0, subtotal - discount);

  // Title prefix (e.g. Mr:, Mrs:, Dr:, Rev Fr:)
  let displayPrefix = bill?.titlePrefix || 'Mr:';
  let cleanCustomerName = (bill?.customerName || '').trim();

  // Smart deduplication: avoid printing "Mr: Rev Fr. A V Varghese"
  if (/^Rev\s*Fr[.:]/i.test(cleanCustomerName)) {
    displayPrefix = 'Rev Fr:';
    cleanCustomerName = cleanCustomerName.replace(/^Rev\s*Fr[.:]\s*/i, '').trim();
  } else if (/^Mr[.:]/i.test(cleanCustomerName)) {
    displayPrefix = 'Mr:';
    cleanCustomerName = cleanCustomerName.replace(/^Mr[.:]\s*/i, '').trim();
  } else if (/^Mrs[.:]/i.test(cleanCustomerName)) {
    displayPrefix = 'Mrs:';
    cleanCustomerName = cleanCustomerName.replace(/^Mrs[.:]\s*/i, '').trim();
  } else if (/^Dr[.:]/i.test(cleanCustomerName)) {
    displayPrefix = 'Dr:';
    cleanCustomerName = cleanCustomerName.replace(/^Dr[.:]\s*/i, '').trim();
  }

  const emailId = currentSettings.email || "mrdododetailers@gmail.com";

  return (
    <div className="print-page-wrapper flex justify-center bg-transparent">
      <div
        id={id}
        className="invoice-a4-sheet bg-white text-black relative shadow-2xl transition-all duration-300 select-none flex flex-col justify-between"
        style={{
          width: '210mm',
          height: '297mm',
          maxHeight: '297mm',
          padding: '14mm 18mm 12mm 18mm',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          letterSpacing: '0px',
          wordSpacing: 'normal'
        }}
      >
        {/* UPPER & MIDDLE BODY CONTAINER */}
        <div className="flex-1 flex flex-col">
          {/* 1. HEADER: BRAND LOGO & CONTACT INFO */}
          <div className="flex flex-col items-center justify-center text-center pt-1">
            {/* Geometric Emblem Logo */}
            <div className="mb-2">
              <img
                src={LOGO_ICON_BASE64}
                alt="Mr. DODO Emblem"
                className="w-auto object-contain mx-auto"
                style={{ height: '54px', maxHeight: '58px' }}
              />
            </div>

            {/* Typography / Wordmark */}
            <div className="mb-3.5">
              <img
                src={LOGO_TEXT_BASE64}
                alt="Mr. DODO PREMIUM DETAILING & CAR WASH"
                className="w-auto object-contain mx-auto"
                style={{ height: '32px', maxHeight: '34px' }}
              />
            </div>

            {/* Address Line */}
            <p className="text-[12.5px] leading-relaxed text-neutral-800 font-normal">
              {currentSettings.address || "Manarcad - Thiruvanchoor Bypass Road, Manarcad, Kottayam"}
            </p>

            {/* Phones & Business Email Line */}
            <p className="text-[12.5px] leading-relaxed text-neutral-800 font-normal mt-0.5">
              <span>{currentSettings.phones || "Phno: 8138037450, 9947885856"}</span>
              <span className="mx-2 text-neutral-400">|</span>
              <span className="font-medium">Email:&nbsp;{emailId}</span>
            </p>
          </div>

          {/* 2. DATE (Right Aligned) */}
          <div className="flex justify-end mt-3.5">
            <p className="text-[14px] text-neutral-800 font-normal">
              Date:&nbsp;{bill?.displayDate || bill?.date || '7 March 2026'}
            </p>
          </div>

          {/* 3. INVOICE TITLE (Centered Bold) */}
          <div className="text-center my-4">
            <h1 className="text-[26px] font-extrabold tracking-wide text-black uppercase">
              {currentSettings.invoiceTitle || "INVOICE"}
            </h1>
          </div>

          {/* 4. CUSTOMER & VEHICLE DETAILS (Natural spacing matching official bill) */}
          <div className="flex justify-between items-start text-[14.5px] text-neutral-900 mb-4">
            {/* Left Column: Customer Details */}
            <div className="space-y-1.5">
              <div className="flex items-baseline">
                <span className="font-bold text-black">{displayPrefix}&nbsp;</span>
                <span className="font-normal text-neutral-900">{cleanCustomerName}</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-black">Phno:&nbsp;</span>
                <span className="font-normal text-neutral-900 font-mono">{bill?.customerPhone || ''}</span>
              </div>
            </div>

            {/* Right Column: Vehicle Details - clean natural spacing */}
            <div className="space-y-1.5 min-w-[220px]">
              <div className="flex items-baseline">
                <span className="font-bold text-black whitespace-nowrap">Vehicle Number:&nbsp;</span>
                <span className="font-normal text-neutral-900 uppercase tracking-wider font-mono">{bill?.vehicleNumber || ''}</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-black whitespace-nowrap">Make:&nbsp;</span>
                <span className="font-normal text-neutral-900">{bill?.vehicleMake || ''}</span>
              </div>
            </div>
          </div>

          {/* 5. SERVICES TABLE */}
          <div className="w-full">
            {/* Table Header: Only line ABOVE Description, NO line below Description */}
            <div className="border-t-[1.6px] border-neutral-900 pt-2.5 pb-2 px-3 flex justify-between items-center text-[14.5px] font-semibold text-neutral-900">
              <span>Description</span>
              <span>Amount</span>
            </div>

            {/* Table Rows - Clean list directly under Description with bottom border */}
            <div className="border-b-[1.6px] border-neutral-900 pb-2.5">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="py-2.5 px-3 flex justify-between items-baseline text-[14px]"
                >
                  <div
                    className="text-neutral-800 font-normal pr-4 flex-1 leading-normal"
                    style={{ wordSpacing: '2px' }}
                  >
                    <span>{index + 1}.&nbsp;&nbsp;</span>
                    <span>{item.description}</span>
                  </div>
                  <div className="text-neutral-900 font-semibold whitespace-nowrap text-right">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="py-6 text-center text-neutral-400 italic text-xs">
                  No services added
                </div>
              )}
            </div>
          </div>

          {/* 6. FINANCIALS SUMMARY - Directly below table line with NO gap */}
          <div className="pt-1.5 space-y-1 text-[14.5px]">
            {/* Subtotal */}
            <div className="flex justify-between items-center px-1 font-semibold text-neutral-900">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount (shown when applicable) */}
            {discount > 0 && (
              <div className="flex justify-between items-center px-1 font-semibold text-neutral-900">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            {/* Total Amount */}
            <div className="flex justify-between items-center px-1 pt-1.5 text-[21px] font-bold text-black">
              <span>Total Amount</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* 7. WARRANTY / OFFER NOTE BOX */}
          {(bill?.warrantyNote || currentSettings.defaultWarrantyNote) && (
            <div className="mt-5 border border-neutral-300 rounded-[3px] p-3 bg-white">
              <p
                className="italic text-[12.5px] text-neutral-800 leading-normal"
                style={{ wordSpacing: '2px' }}
              >
                {bill?.warrantyNote || currentSettings.defaultWarrantyNote}
              </p>
            </div>
          )}
        </div>

        {/* 8. FOOTER: THANK YOU & TEAM */}
        <div className="pt-6 pb-2 text-center space-y-1">
          <h3 className="text-[16px] font-bold text-black tracking-tight">
            {currentSettings.footerThankYou || "Thank You"}
          </h3>
          <p className="text-[13px] font-medium text-neutral-800 uppercase tracking-wide">
            {currentSettings.footerTeam || "Team MR DODO"}
          </p>
        </div>
      </div>
    </div>
  );
}
