// content_script.js
// 在页面上下文中提取可读文本内容，返回给 background 使用。

const MAX_TEXT_LEN = 8000000;
const PDF_PAGE_LIMIT = 120;
const PDF_TEXT_SOFT_LIMIT = 1200000;
const PDF_YIELD_EVERY_PAGES = 5;

function cleanExtractedText(text) {
  let normalized = String(text || "");
  normalized = normalized.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (normalized.length > MAX_TEXT_LEN) {
    normalized = normalized.slice(0, MAX_TEXT_LEN) + "\n\n[内容过长，已截断部分文本]";
  }

  return normalized;
}

function getDomText() {
  return document.body ? document.body.innerText || "" : "";
}

function isProbablyPdfPage() {
  const href = location.href || "";
  const pathname = location.pathname || "";
  const contentType = document.contentType || "";

  if (contentType === "application/pdf") {
    return true;
  }
  if (pathname.toLowerCase().endsWith(".pdf") || href.toLowerCase().includes(".pdf")) {
    return true;
  }

  return !!document.querySelector(
    'embed[type="application/pdf"], object[type="application/pdf"], iframe[src*=".pdf"]'
  );
}

function resolvePdfUrl() {
  const candidates = [
    location.href,
    document.querySelector('embed[type="application/pdf"]')?.src,
    document.querySelector('object[type="application/pdf"]')?.data,
    document.querySelector('iframe[src*=".pdf"]')?.src,
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return new URL(candidate, location.href).href;
    } catch {
      // ignore invalid candidate URLs
    }
  }

  return location.href;
}

function readMetadataTitle(metadata) {
  if (!metadata) return "";

  const infoTitle = metadata.info?.Title;
  if (typeof infoTitle === "string" && infoTitle.trim()) {
    return infoTitle.trim();
  }

  const metadataTitle = metadata.metadata?.get?.("dc:title");
  if (typeof metadataTitle === "string" && metadataTitle.trim()) {
    return metadataTitle.trim();
  }

  return "";
}

function normalizePdfTextItems(items) {
  const lines = [];
  let currentLine = "";
  let lastY = null;
  let lastX = null;

  for (const item of items) {
    const rawText = typeof item?.str === "string" ? item.str : "";
    if (!rawText) {
      if (item?.hasEOL && currentLine.trim()) {
        lines.push(currentLine.trim());
        currentLine = "";
        lastY = null;
        lastX = null;
      }
      continue;
    }

    const text = rawText.replace(/\s+/g, " ").trim();
    if (!text) {
      continue;
    }

    const transform = Array.isArray(item.transform) ? item.transform : null;
    const x = transform ? transform[4] : null;
    const y = transform ? transform[5] : null;
    const width = typeof item.width === "number" ? item.width : null;

    const shouldBreakLine =
      currentLine &&
      y !== null &&
      lastY !== null &&
      Math.abs(y - lastY) > 4;

    if (shouldBreakLine) {
      lines.push(currentLine.trim());
      currentLine = "";
      lastX = null;
    }

    const needsSpace =
      currentLine &&
      !/[\s\-\/(（[]$/.test(currentLine) &&
      !/^[,.;:!?%)}\]，。；：！？、]/.test(text) &&
      x !== null &&
      lastX !== null &&
      x - lastX > 2;

    currentLine += (needsSpace ? " " : "") + text;
    lastY = y;
    lastX = x !== null && width !== null ? x + width : x;

    if (item?.hasEOL) {
      lines.push(currentLine.trim());
      currentLine = "";
      lastY = null;
      lastX = null;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n").trim();
}

async function extractPdfText(pdfUrl) {
  const pdfjs = await import(chrome.runtime.getURL("vendor/pdfjs/package/build/pdf.mjs"));
  pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
    "vendor/pdfjs/package/build/pdf.worker.mjs"
  );

  const loadingTask = pdfjs.getDocument({
    url: pdfUrl,
    withCredentials: true,
    cMapUrl: chrome.runtime.getURL("vendor/pdfjs/package/cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: chrome.runtime.getURL("vendor/pdfjs/package/standard_fonts/"),
    useWorkerFetch: true,
    isEvalSupported: false,
  });

  const pdfDocument = await loadingTask.promise;

  try {
    const metadata = await pdfDocument.getMetadata().catch(() => null);
    const extractedPages = Math.min(pdfDocument.numPages, PDF_PAGE_LIMIT);
    const pageTexts = [];
    let reachedSoftLimit = false;
    let accumulatedLength = 0;

    for (let pageNumber = 1; pageNumber <= extractedPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      try {
        const textContent = await page.getTextContent();
        const pageText = normalizePdfTextItems(textContent.items);

        if (pageText) {
          const pageChunk = `[第 ${pageNumber} 页]\n${pageText}`;
          pageTexts.push(pageChunk);
          accumulatedLength += pageChunk.length;

          if (accumulatedLength >= PDF_TEXT_SOFT_LIMIT) {
            reachedSoftLimit = true;
            break;
          }
        }
      } finally {
        page.cleanup();
      }

      if (pageNumber % PDF_YIELD_EVERY_PAGES === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    let text = pageTexts.join("\n\n");
    if (reachedSoftLimit) {
      text += `\n\n[PDF 文本较长，已在约 ${PDF_TEXT_SOFT_LIMIT.toLocaleString()} 字后提前停止提取]`;
    } else if (pdfDocument.numPages > extractedPages) {
      text += `\n\n[PDF 共 ${pdfDocument.numPages} 页，仅提取前 ${extractedPages} 页内容]`;
    }

    return {
      title: readMetadataTitle(metadata) || document.title || "",
      url: pdfUrl,
      text,
      pageCount: pdfDocument.numPages,
      sourceType: "pdf",
    };
  } finally {
    await pdfDocument.destroy();
    await loadingTask.destroy();
  }
}

async function getPageText() {
  try {
    if (isProbablyPdfPage()) {
      try {
        const pdfData = await extractPdfText(resolvePdfUrl());
        return {
          title: pdfData.title || document.title || "",
          url: pdfData.url || location.href,
          text: cleanExtractedText(pdfData.text),
          pageCount: pdfData.pageCount,
          sourceType: pdfData.sourceType,
        };
      } catch (pdfError) {
        const domFallbackText = cleanExtractedText(getDomText());
        if (domFallbackText) {
          return {
            title: document.title || "",
            url: location.href,
            text: domFallbackText,
            sourceType: "pdf-dom-fallback",
            warning: "PDF 解析失败，已回退为页面文本提取。",
          };
        }
        throw pdfError;
      }
    }

    return {
      title: document.title || "",
      url: location.href,
      text: cleanExtractedText(getDomText()),
    };
  } catch (e) {
    return {
      title: document.title || "",
      url: location.href,
      text: "",
      error: e?.message || String(e),
    };
  }
}

// 作为 executeScript 的返回值
getPageText();
