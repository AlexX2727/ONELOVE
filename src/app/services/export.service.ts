import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Download data as Excel (.xlsx) */
  exportExcel(data: Record<string, unknown>[], filename: string): void {
    if (!data || !data.length) return;
    
    // Format dates to locale string before exporting
    const formattedData = data.map(row => {
      const newRow: Record<string, unknown> = {};
      for (const key in row) {
        newRow[key] = row[key] instanceof Date 
          ? (row[key] as Date).toLocaleDateString('es-EC') 
          : row[key];
      }
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /** Generate and download a PDF report with tables */
  exportPDF(title: string, data: Record<string, unknown>[], filename: string): void {
    if (!data || !data.length) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(26, 26, 46); // Brand primary
    doc.text(`ONE LOVE — ${title}`, 14, 22);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-EC')} a las ${new Date().toLocaleTimeString('es-EC')}`, 14, 30);

    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => {
        const val = row[h];
        return val instanceof Date ? val.toLocaleDateString('es-EC') : String(val ?? '');
      })
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 38,
      theme: 'grid',
      headStyles: { fillColor: [26, 26, 46], textColor: 255 }, // Brand colors
      alternateRowStyles: { fillColor: [248, 248, 248] },
      styles: { fontSize: 8 }
    });

    doc.save(`${filename}.pdf`);
  }

  /** Export specific custom report for Dashboard/KPIs (replaces the HTML one) */
  exportCustomPDF(title: string, sections: {title: string, data: Record<string, unknown>[]}[], filename: string): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(26, 26, 46);
    doc.text(`ONE LOVE — ${title}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-EC')}`, 14, 30);

    let startY = 40;

    for (const sec of sections) {
      if (!sec.data || !sec.data.length) continue;
      
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 46);
      doc.text(sec.title, 14, startY);
      
      const headers = Object.keys(sec.data[0]);
      const rows = sec.data.map(row => 
        headers.map(h => String(row[h] ?? ''))
      );

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: startY + 5,
        theme: 'grid',
        headStyles: { fillColor: [26, 26, 46], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { bottom: 20 }
      });

      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    doc.save(`${filename}.pdf`);
  }
}
