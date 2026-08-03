/**
 * exportPdf - client-side PDF export via native print
 * opens a new window with formatted HTML (prototype screenshot + PRD + annotations)
 * triggers browser print dialog (user can save as PDF)
 */
import type { PageEntry } from '@/host/router/pageRegistry'
import type { AnnotationData } from '@/host/api'

interface ExportOptions {
  page: PageEntry
  prdContent: string
  annotations: AnnotationData | null
  versionKey: string
}

export function exportPdf({ page, prdContent, annotations, versionKey }: ExportOptions) {
  const { meta } = page
  const versionLabel = versionKey === 'default' ? '' : ` (${versionKey})`

  const annotationHtml = annotations?.annotations?.length
    ? `
      <h2>文档注解 (${annotations.annotations.length})</h2>
      ${annotations.annotations
        .map(
          (a) => `
        <div class="annotation">
          <div class="anchor">"${escapeHtml(a.anchorText.length > 100 ? a.anchorText.slice(0, 100) + '...' : a.anchorText)}"</div>
          <div class="comment">${escapeHtml(a.comment)}</div>
          <div class="meta">${escapeHtml(a.author)} - ${new Date(a.createdAt).toLocaleString('zh-CN')}</div>
        </div>
      `,
        )
        .join('')}
    `
    : '<p class="empty">暂无注解</p>'

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(meta.title)}${versionLabel} - 原型文档</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin: 24px 0 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
    .header { margin-bottom: 24px; }
    .header .meta { font-size: 12px; color: #666; }
    .header .badge {
      display: inline-block;
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 8px;
    }
    .prd-content { white-space: pre-wrap; font-size: 14px; }
    .prd-content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    .prd-content th, .prd-content td { border: 1px solid #e0e0e0; padding: 6px 10px; text-align: left; font-size: 13px; }
    .prd-content th { background: #f5f5f5; }
    .prd-content code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-size: 13px; }
    .annotation {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 8px;
    }
    .annotation .anchor {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      margin-bottom: 6px;
      display: inline-block;
    }
    .annotation .comment { font-size: 14px; margin-bottom: 4px; }
    .annotation .meta { font-size: 12px; color: #666; }
    .empty { color: #999; font-style: italic; }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      font-size: 11px;
      color: #999;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(meta.title)}${escapeHtml(versionLabel)}</h1>
    <div class="meta">
      <span class="badge">${escapeHtml(meta.module)}</span>
      ${meta.tags?.map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('') || ''}
      <br>
      导出时间: ${new Date().toLocaleString('zh-CN')}
    </div>
  </div>

  <h2>PRD 需求文档</h2>
  <div class="prd-content">${renderMarkdownLite(prdContent)}</div>

  <h2>文档注解</h2>
  ${annotationHtml}

  <div class="footer">
    原型协作平台 - ${escapeHtml(meta.module)} / ${escapeHtml(meta.title)}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    }
  </script>
</body>
</html>`

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('请允许弹出窗口以导出 PDF')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
}

/** escape HTML special chars */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * lightweight markdown to HTML renderer
 * handles headings, bold, tables, code, lists, paragraphs
 */
function renderMarkdownLite(md: string): string {
  const lines = md.split('\n')
  let html = ''
  let inTable = false
  let inList = false
  let tableHeader: string[] = []

  const closeList = () => {
    if (inList) {
      html += '</ul>'
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList()
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim())

      // skip separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) continue

      if (!inTable) {
        inTable = true
        tableHeader = cells
        html += '<table><thead><tr>'
        html += tableHeader.map((c) => `<th>${escapeHtml(c)}</th>`).join('')
        html += '</tr></thead><tbody>'
      } else {
        html += '<tr>'
        html += cells.map((c) => `<td>${escapeHtml(c)}</td>`).join('')
        html += '</tr>'
      }
      continue
    } else if (inTable) {
      html += '</tbody></table>'
      inTable = false
    }

    // headings
    if (line.startsWith('### ')) {
      closeList()
      html += `<h3>${escapeHtml(line.slice(4))}</h3>`
    } else if (line.startsWith('## ')) {
      closeList()
      html += `<h2>${escapeHtml(line.slice(3))}</h2>`
    } else if (line.startsWith('# ')) {
      closeList()
      html += `<h1>${escapeHtml(line.slice(2))}</h1>`
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += '<ul>'
        inList = true
      }
      html += `<li>${escapeHtml(line.slice(2))}</li>`
    } else if (line.trim() === '') {
      closeList()
    } else {
      closeList()
      // inline: bold and code
      let processed = escapeHtml(line)
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      processed = processed.replace(/`(.+?)`/g, '<code>$1</code>')
      html += `<p>${processed}</p>`
    }
  }

  if (inTable) html += '</tbody></table>'
  closeList()

  return html
}
