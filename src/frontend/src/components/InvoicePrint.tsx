import type { T__1 } from "../backend.d";
import {
  formatDateTime,
  formatINR,
  generateInvoiceNumber,
} from "../utils/format";

interface InvoicePrintProps {
  invoice: T__1;
  invoiceNumber: string;
}

export default function InvoicePrint({
  invoice,
  invoiceNumber,
}: InvoicePrintProps) {
  const subtotal = invoice.framePrice + invoice.lensPrice;

  return (
    <div
      id="print-invoice"
      className="print-invoice-container bg-white text-black p-8 max-w-2xl mx-auto"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "14px" }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-3xl font-bold tracking-widest text-gray-900 mb-1">
          OptiShop
        </h1>
        <p className="text-sm text-gray-600">Optical & Vision Care</p>
        <p className="text-xs text-gray-500 mt-1">
          Quality Eyewear | Expert Eye Care
        </p>
      </div>

      {/* Invoice Meta */}
      <div className="flex justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Tax Invoice
          </p>
          <p className="text-lg font-bold text-gray-900">{invoiceNumber}</p>
          <p className="text-xs text-gray-600">
            Date: {formatDateTime(invoice.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Billed To
          </p>
          <p className="text-lg font-bold text-gray-900">
            {invoice.customerName}
          </p>
          <p className="text-sm text-gray-600">📞 {invoice.mobileNumber}</p>
        </div>
      </div>

      {/* Prescription Table */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-2 border-b border-gray-300 pb-1">
          Prescription Details
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                Eye
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                Sphere
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                Cylinder
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                Axis
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                Addition
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">
                Left (OS)
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {invoice.leftEye.sphere > 0 ? "+" : ""}
                {invoice.leftEye.sphere.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {invoice.leftEye.cylinder > 0 ? "+" : ""}
                {invoice.leftEye.cylinder.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {Number(invoice.leftEye.axis)}°
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {invoice.leftEye.addition > 0 ? "+" : ""}
                {invoice.leftEye.addition.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 font-medium">
                Right (OD)
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {invoice.rightEye.sphere > 0 ? "+" : ""}
                {invoice.rightEye.sphere.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {invoice.rightEye.cylinder > 0 ? "+" : ""}
                {invoice.rightEye.cylinder.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {Number(invoice.rightEye.axis)}°
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {invoice.rightEye.addition > 0 ? "+" : ""}
                {invoice.rightEye.addition.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-2 border-b border-gray-300 pb-1">
          Order Details
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                Item
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">
                Frame{invoice.frameNumber ? ` — #${invoice.frameNumber}` : ""}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatINR(invoice.framePrice)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Lens</td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatINR(invoice.lensPrice)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 text-gray-600">
                Subtotal
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-600">
                {formatINR(subtotal)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2 text-gray-600">
                GST (5%)
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right text-gray-600">
                {formatINR(invoice.gst)}
              </td>
            </tr>
            <tr className="bg-gray-900 text-white">
              <td className="border border-gray-700 px-3 py-3 font-bold text-base">
                Grand Total
              </td>
              <td className="border border-gray-700 px-3 py-3 text-right font-bold text-base">
                {formatINR(invoice.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-gray-800 pt-4">
        <p className="text-base font-semibold text-gray-800">
          Thank you for your visit!
        </p>
        <p className="text-xs text-gray-500 mt-1">
          OptiShop — Optical & Vision Care
        </p>
        <p className="text-xs text-gray-400 mt-1">
          This is a computer-generated invoice.
        </p>
      </div>
    </div>
  );
}

export function printInvoice(invoice: T__1, invoiceNumber: string) {
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) return;

  const subtotal = invoice.framePrice + invoice.lensPrice;

  const signFmt = (n: number) => (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 14px; color: #111; background: #fff; }
    .container { max-width: 680px; margin: 0 auto; padding: 32px; }
    .header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #1a1a2e; margin-bottom: 4px; }
    .header p { font-size: 12px; color: #666; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .meta-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
    .meta-value { font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .meta-sub { font-size: 12px; color: #555; margin-top: 2px; }
    .meta-right { text-align: right; }
    h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; 
         border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 10px; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f0f0f0; border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-weight: 600; }
    th.center, td.center { text-align: center; }
    th.right, td.right { text-align: right; }
    td { border: 1px solid #ccc; padding: 8px 10px; }
    .grand-row td { background: #1a1a2e; color: #fff; font-weight: 700; font-size: 15px; border-color: #333; }
    .footer { text-align: center; border-top: 2px solid #1a1a2e; padding-top: 16px; margin-top: 24px; }
    .footer p { font-size: 13px; font-weight: 600; color: #333; }
    .footer small { font-size: 11px; color: #999; display: block; margin-top: 4px; }
    @media print {
      body { margin: 0; }
      .container { padding: 20px; }
    }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>OptiShop</h1>
    <p>Optical &amp; Vision Care</p>
    <p style="font-size:11px;color:#aaa;margin-top:2px;">Quality Eyewear | Expert Eye Care</p>
  </div>

  <div class="meta">
    <div>
      <div class="meta-label">Tax Invoice</div>
      <div class="meta-value">${invoiceNumber}</div>
      <div class="meta-sub">Date: ${new Date(Number(invoice.createdAt / BigInt(1_000_000))).toLocaleString("en-IN")}</div>
    </div>
    <div class="meta-right">
      <div class="meta-label">Billed To</div>
      <div class="meta-value">${invoice.customerName}</div>
      <div class="meta-sub">📞 ${invoice.mobileNumber}</div>
    </div>
  </div>

  <h3>Prescription Details</h3>
  <table>
    <thead>
      <tr>
        <th>Eye</th>
        <th class="center">Sphere</th>
        <th class="center">Cylinder</th>
        <th class="center">Axis</th>
        <th class="center">Addition</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Left (OS)</strong></td>
        <td class="center">${signFmt(invoice.leftEye.sphere)}</td>
        <td class="center">${signFmt(invoice.leftEye.cylinder)}</td>
        <td class="center">${Number(invoice.leftEye.axis)}°</td>
        <td class="center">${signFmt(invoice.leftEye.addition)}</td>
      </tr>
      <tr>
        <td><strong>Right (OD)</strong></td>
        <td class="center">${signFmt(invoice.rightEye.sphere)}</td>
        <td class="center">${signFmt(invoice.rightEye.cylinder)}</td>
        <td class="center">${Number(invoice.rightEye.axis)}°</td>
        <td class="center">${signFmt(invoice.rightEye.addition)}</td>
      </tr>
    </tbody>
  </table>

  <h3>Order Details</h3>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Frame${invoice.frameNumber ? ` — #${invoice.frameNumber}` : ""}</td>
        <td class="right">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.framePrice)}</td>
      </tr>
      <tr>
        <td>Lens</td>
        <td class="right">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.lensPrice)}</td>
      </tr>
      <tr>
        <td style="color:#666;">Subtotal</td>
        <td class="right" style="color:#666;">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subtotal)}</td>
      </tr>
      <tr>
        <td style="color:#666;">GST (5%)</td>
        <td class="right" style="color:#666;">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.gst)}</td>
      </tr>
      <tr class="grand-row">
        <td>Grand Total</td>
        <td class="right">${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.grandTotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Thank you for your visit!</p>
    <small>OptiShop — Optical &amp; Vision Care</small>
    <small>This is a computer-generated invoice.</small>
  </div>
</div>
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
