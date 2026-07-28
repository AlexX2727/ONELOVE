import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Download data as CSV */
  exportCSV(data: Record<string, unknown>[], filename: string): void {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h] ?? '';
          const str = val instanceof Date
            ? val.toLocaleDateString('es-EC')
            : String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
    ];
    this.download(csvRows.join('\n'), `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /** Download data as formatted JSON */
  exportJSON(data: unknown, filename: string): void {
    this.download(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
  }

  /** Generate and download a simple HTML report as a print-ready page */
  exportHTMLReport(title: string, html: string, filename: string): void {
    const page = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #222; }
  h1 { font-size: 20px; margin-bottom: 4px; color: #1a1a2e; }
  .subtitle { color: #666; margin-bottom: 20px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #1a1a2e; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 11px; }
  tr:nth-child(even) td { background: #f8f8f8; }
  .badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; }
  .badge-success { background: #e8f5e9; color: #2e7d32; }
  .badge-warning { background: #fff8e1; color: #f57f17; }
  .badge-danger { background: #fce4ec; color: #c62828; }
  .footer { margin-top: 20px; font-size: 10px; color: #999; text-align: right; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <h1>ONE LOVE — ${title}</h1>
  <p class="subtitle">Generado el ${new Date().toLocaleDateString('es-EC', { dateStyle: 'full' })} a las ${new Date().toLocaleTimeString('es-EC')}</p>
  ${html}
  <div class="footer">ONE LOVE Sistema de Gestión · Ecuador 🇪🇨</div>
  <script>setTimeout(() => window.print(), 500);</script>
</body>
</html>`;
    this.download(page, `${filename}.html`, 'text/html;charset=utf-8;');
  }

  private download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\ufeff' + content], { type: mimeType }); // BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
