/**
 * generateAnalyticsPDF — Standalone PDF report generator.
 *
 * Uses jsPDF + jspdf-autotable to produce a professionally styled
 * analytics report for Barangay Connect.
 *
 * Usage:
 *   import { generateAnalyticsPDF } from '../lib/generateAnalyticsPDF';
 *   await generateAnalyticsPDF(data);
 *
 * @param {Object} data — analytics data object
 * @param {Object} data.summary — { total, resolved, inProgress, pending, rate }
 * @param {string} data.period — 'weekly' | 'monthly' | 'quarterly'
 * @param {Array}  data.monthlyTrends — [{ month, tickets, resolved }]
 * @param {Array}  data.categoryBreakdown — [{ name, value, color }]
 * @param {Array}  data.resolutionData — [{ dept, avg }]
 * @param {Array}  data.deptWorkload — [{ name, liveTickets, capacity }]
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  navy:       [26,  26,  46],   // #1A1A2E
  indigo:     [79,  70,  229],  // #4F46E5
  emerald:    [16,  185, 129],  // #10B981
  red:        [239, 68,  68],   // #EF4444
  amber:      [245, 158, 11],   // #F59E0B
  white:      [255, 255, 255],
  surface:    [248, 249, 251],  // #F8F9FB
  tableHead:  [238, 242, 255],  // #EEF2FF
  border:     [229, 231, 235],  // #E5E7EB
  text:       [55,  65,  81],   // #374151
  muted:      [107, 114, 128],  // #6B7280
  lightGray:  [243, 244, 246],  // #F3F4F6
};

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n) => (n == null || n === '') ? '—' : Number(n).toLocaleString();
const fmtPct = (n) => (n == null || n === '') ? '—' : `${Number(n).toFixed(1)}%`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
const today = () => new Date().toISOString().slice(0, 10);
const nowStr = () => new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

// ── Section heading helper ────────────────────────────────────────────────
function sectionHeading(doc, text, y) {
  // Left accent bar
  doc.setFillColor(...C.indigo);
  doc.rect(14, y, 3, 7, 'F');
  // Heading text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.navy);
  doc.text(text, 20, y + 5.5);
  return y + 14;
}

// ── KPI card helper ───────────────────────────────────────────────────────
function kpiCard(doc, x, y, w, h, label, value, delta, color) {
  // Card background
  doc.setFillColor(...C.surface);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  // Card border
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');
  // Label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text(label.toUpperCase(), x + 6, y + 8);
  // Value
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...color);
  doc.text(String(value), x + 6, y + 22);
  // Delta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(delta, x + 6, y + 30);
}

// ── Footer on every page ──────────────────────────────────────────────────
function addFooters(doc, reportDate) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    // Top border
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(14, ph - 14, pw - 14, ph - 14);
    // Left: report name + date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(`Barangay Connect — Analytics Report · ${reportDate}`, 14, ph - 8);
    // Right: page number
    doc.text(`Page ${i} of ${pageCount}`, pw - 14, ph - 8, { align: 'right' });
  }
}

// ── Main export function ──────────────────────────────────────────────────
export async function generateAnalyticsPDF(data) {
  const {
    summary = {},
    period  = 'monthly',
    monthlyTrends    = [],
    categoryBreakdown = [],
    resolutionData   = [],
    deptWorkload     = [],
  } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();   // 210
  const reportDate = fmtDate(new Date());
  let y = 0;

  // ══════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER / HEADER
  // ══════════════════════════════════════════════════════════════════════

  // Header background band
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, pw, 52, 'F');

  // Accent stripe
  doc.setFillColor(...C.indigo);
  doc.rect(0, 48, pw, 4, 'F');

  // App name wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('BARANGAY CONNECT', 14, 16);

  // Report title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Analytics Report', 14, 30);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 230);
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
  doc.text(`${periodLabel} Overview  ·  Generated ${nowStr()}`, 14, 42);

  y = 64;

  // ══════════════════════════════════════════════════════════════════════
  // EXECUTIVE SUMMARY — KPI CARDS
  // ══════════════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.navy);
  doc.text('Executive Summary', 14, y);
  y += 6;

  const cardW = (pw - 28 - 9) / 4;  // 4 cards with 3 gaps of 3mm
  const cardH = 36;
  const cards = [
    { label: 'Total Tickets',  value: fmt(summary.total),      delta: '+12.5% vs last month', color: C.indigo  },
    { label: 'Resolved',       value: fmt(summary.resolved),   delta: `${fmtPct(summary.rate)} resolution rate`, color: C.emerald },
    { label: 'In Progress',    value: fmt(summary.inProgress), delta: 'Active now',            color: [245,158,11] },
    { label: 'Pending Review', value: fmt(summary.pending),    delta: 'Needs action',          color: C.red     },
  ];

  cards.forEach((c, i) => {
    kpiCard(doc, 14 + i * (cardW + 3), y, cardW, cardH, c.label, c.value, c.delta, c.color);
  });
  y += cardH + 14;

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 1 — TICKET VOLUME TABLE
  // ══════════════════════════════════════════════════════════════════════
  y = sectionHeading(doc, 'Ticket Volume — Monthly Trends', y);

  if (monthlyTrends.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text('No data available for this period.', 14, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Month', 'Submitted', 'Resolved', 'Resolution Rate']],
      body: monthlyTrends.map((m) => [
        m.month,
        fmt(m.tickets),
        fmt(m.resolved),
        m.tickets > 0 ? fmtPct((m.resolved / m.tickets) * 100) : '—',
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        textColor: C.text,
        lineColor: C.border,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: C.tableHead,
        textColor: C.indigo,
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
      },
      alternateRowStyles: { fillColor: C.lightGray },
      columnStyles: {
        0: { halign: 'left',   fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: C.border,
      tableLineWidth: 0.3,
    });
    y = doc.lastAutoTable.finalY + 14;
  }

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 2 — CATEGORY BREAKDOWN TABLE
  // ══════════════════════════════════════════════════════════════════════
  // Check if we need a new page
  if (y > 220) { doc.addPage(); y = 20; }

  y = sectionHeading(doc, 'Tickets by Category', y);

  if (categoryBreakdown.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text('No data available for this period.', 14, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Share (%)', 'Visual']],
      body: categoryBreakdown.map((c) => [
        c.name,
        fmtPct(c.value),
        '',  // bar drawn below
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        textColor: C.text,
        lineColor: C.border,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: C.tableHead,
        textColor: C.indigo,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: C.lightGray },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'left', cellWidth: 'auto' },
      },
      // Draw mini bar in the Visual column
      didDrawCell(hookData) {
        if (hookData.section === 'body' && hookData.column.index === 2) {
          const row = categoryBreakdown[hookData.row.index];
          if (!row) return;
          const barMaxW = hookData.cell.width - 8;
          const barW    = (row.value / 100) * barMaxW;
          const barH    = 4;
          const bx      = hookData.cell.x + 4;
          const by      = hookData.cell.y + (hookData.cell.height - barH) / 2;
          // Background track
          doc.setFillColor(...C.lightGray);
          doc.roundedRect(bx, by, barMaxW, barH, 1, 1, 'F');
          // Filled bar — parse hex color from data
          const hex = row.color || '#4F46E5';
          const r   = parseInt(hex.slice(1, 3), 16);
          const g   = parseInt(hex.slice(3, 5), 16);
          const b   = parseInt(hex.slice(5, 7), 16);
          doc.setFillColor(r, g, b);
          doc.roundedRect(bx, by, barW, barH, 1, 1, 'F');
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 14;
  }

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 3 — RESOLUTION TIME TABLE
  // ══════════════════════════════════════════════════════════════════════
  if (y > 220) { doc.addPage(); y = 20; }

  y = sectionHeading(doc, 'Avg. Resolution Time by Department', y);

  if (resolutionData.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text('No data available for this period.', 14, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Department', 'Avg. Hours', 'Performance']],
      body: resolutionData.map((r) => {
        const perf = r.avg <= 10 ? '✓ Excellent' : r.avg <= 16 ? '~ Good' : '↓ Needs Improvement';
        return [r.dept, `${r.avg}h`, perf];
      }),
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        textColor: C.text,
        lineColor: C.border,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: C.tableHead,
        textColor: C.indigo,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: C.lightGray },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'left' },
      },
      // Color-code performance column
      didParseCell(hookData) {
        if (hookData.section === 'body' && hookData.column.index === 2) {
          const val = hookData.cell.raw || '';
          if (val.startsWith('✓')) hookData.cell.styles.textColor = C.emerald;
          else if (val.startsWith('↓')) hookData.cell.styles.textColor = C.red;
          else hookData.cell.styles.textColor = [245, 158, 11];
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 14;
  }

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 4 — DEPARTMENT WORKLOAD TABLE
  // ══════════════════════════════════════════════════════════════════════
  if (y > 200) { doc.addPage(); y = 20; }

  y = sectionHeading(doc, 'Department Workload', y);

  if (deptWorkload.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text('No data available for this period.', 14, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Department', 'Active Tickets', 'Capacity %', 'Status']],
      body: deptWorkload.map((d) => {
        const status = d.capacity >= 90 ? '⚠ Critical' : d.capacity >= 70 ? '~ High' : '✓ Normal';
        return [d.name, fmt(d.liveTickets ?? d.tickets), fmtPct(d.capacity), status];
      }),
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        textColor: C.text,
        lineColor: C.border,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: C.tableHead,
        textColor: C.indigo,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: C.lightGray },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'left' },
      },
      didParseCell(hookData) {
        if (hookData.section === 'body' && hookData.column.index === 3) {
          const val = hookData.cell.raw || '';
          if (val.startsWith('⚠')) hookData.cell.styles.textColor = C.red;
          else if (val.startsWith('~')) hookData.cell.styles.textColor = [245, 158, 11];
          else hookData.cell.styles.textColor = C.emerald;
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 14;
  }

  // ══════════════════════════════════════════════════════════════════════
  // FOOTERS — added last so page count is accurate
  // ══════════════════════════════════════════════════════════════════════
  addFooters(doc, reportDate);

  // ══════════════════════════════════════════════════════════════════════
  // SAVE
  // ══════════════════════════════════════════════════════════════════════
  const filename = `analytics-report-${today()}.pdf`;
  doc.save(filename);
  return filename;
}
