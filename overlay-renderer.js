(function initOverlayRenderer() {
  if (window.__llm_reader_renderer__) {
    return;
  }

  const librariesLoaded = {
    katex: false,
    highlight: false,
  };

  function encodeLatexSource(text) {
    return encodeURIComponent(text || "");
  }

  function decodeLatexSource(text) {
    try {
      return decodeURIComponent(text || "");
    } catch {
      return text || "";
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rerenderPendingMath(root = document) {
    if (!window.katex) return;

    const pendingNodes = root.querySelectorAll(".llm-reader-math-pending");
    pendingNodes.forEach((node) => {
      const source = decodeLatexSource(node.getAttribute("data-latex-source"));
      const displayMode = node.getAttribute("data-display-mode") === "true";

      try {
        const rendered = window.katex.renderToString(source, {
          displayMode,
          throwOnError: false,
          output: "html",
          strict: "warn",
          trust: false,
          fleqn: false,
          minRuleThickness: 0.06,
          maxSize: Infinity,
          maxExpand: 1000,
          macros: {
            "\\f": "#1f(#2)",
          },
        });

        node.outerHTML = displayMode
          ? `<div class="llm-reader-math-block">${rendered}</div>`
          : `<span class="llm-reader-math-inline">${rendered}</span>`;
      } catch (error) {
        console.warn("延迟渲染 LaTeX 失败:", error, source);
        node.classList.remove("llm-reader-math-pending");
        node.classList.add("latex-error");
        node.textContent = source;
      }
    });
  }

  function ensureLibraries() {
    if (!document.querySelector('link[href*="katex.min.css"]')) {
      const katexCSS = document.createElement("link");
      katexCSS.rel = "stylesheet";
      katexCSS.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(katexCSS);
    }

    if (!document.querySelector('script[src*="katex.min.js"]')) {
      const katexScript = document.createElement("script");
      katexScript.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
      katexScript.onload = () => {
        librariesLoaded.katex = true;
        console.log("KaTeX库加载成功");
        rerenderPendingMath(document);
      };
      katexScript.onerror = () => {
        console.error("KaTeX库加载失败");
      };
      document.head.appendChild(katexScript);
    } else {
      librariesLoaded.katex = true;
      queueMicrotask(() => rerenderPendingMath(document));
    }

    if (!document.querySelector('link[href*="vscode.min.css"]')) {
      const highlightCSS = document.createElement("link");
      highlightCSS.rel = "stylesheet";
      highlightCSS.href =
        "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/vscode.min.css";
      document.head.appendChild(highlightCSS);
    }

    if (!document.querySelector('script[src*="highlight.min.js"]')) {
      const highlightScript = document.createElement("script");
      highlightScript.src =
        "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/common.min.js";
      highlightScript.onload = () => {
        librariesLoaded.highlight = true;
        console.log("highlight.js库加载成功");
      };
      highlightScript.onerror = () => {
        console.error("highlight.js库加载失败");
      };
      document.head.appendChild(highlightScript);
    } else {
      librariesLoaded.highlight = true;
    }
  }

  function renderLatex(text, displayMode = false) {
    const encodedSource = encodeLatexSource(text);
    try {
      if (typeof window.katex !== "undefined" && window.katex) {
        const rendered = window.katex.renderToString(text, {
          displayMode,
          throwOnError: false,
          output: "html",
          strict: "warn",
          trust: false,
          fleqn: false,
          minRuleThickness: 0.06,
          maxSize: Infinity,
          maxExpand: 1000,
          macros: {
            "\\f": "#1f(#2)",
          },
        });

        if (!displayMode) {
          return `<span class="llm-reader-math-inline">${rendered}</span>`;
        }
        return `<div class="llm-reader-math-block">${rendered}</div>`;
      }

      console.warn("KaTeX库未加载，显示原始LaTeX:", text);
      const tagName = displayMode ? "div" : "span";
      const className = displayMode
        ? "llm-reader-math-block llm-reader-math-pending"
        : "llm-reader-math-inline llm-reader-math-pending";
      return `<${tagName} class="${className}" data-latex-source="${encodedSource}" data-display-mode="${displayMode}">${escapeHtml(text)}</${tagName}>`;
    } catch (error) {
      console.warn("LaTeX渲染失败:", error, text);
      const tagName = displayMode ? "div" : "span";
      return `<${tagName} class="latex-error">${escapeHtml(text)}</${tagName}>`;
    }
  }

  function renderCodeBlock(code, language = "") {
    try {
      if (window.hljs) {
        let lang = language.toLowerCase().trim();
        if (!lang || lang === "text" || lang === "plain") {
          const result = window.hljs.highlightAuto(code);
          return `<pre><code class="hljs">${result.value}</code></pre>`;
        }

        try {
          const result = window.hljs.highlight(code, { language: lang });
          return `<pre><code class="hljs language-${lang}">${result.value}</code></pre>`;
        } catch {
          const result = window.hljs.highlightAuto(code);
          return `<pre><code class="hljs">${result.value}</code></pre>`;
        }
      }

      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    } catch (error) {
      console.warn("代码高亮失败:", error);
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  }

  function pushLatexPlaceholder(latexBlocks, content, displayMode = false) {
    const index = latexBlocks.length;
    latexBlocks.push({ content: String(content || "").trim(), displayMode });
    return displayMode ? `__LATEX_BLOCK_${index}__` : `__LATEX_INLINE_${index}__`;
  }

  function replaceBareLatexInline(text, latexBlocks) {
    if (!text || !latexBlocks) return text || "";

    const protectedInlineMath = [];
    let processed = String(text);

    processed = processed.replace(/__LATEX_INLINE_\d+__/g, (match) => {
      const index = protectedInlineMath.length;
      protectedInlineMath.push(match);
      return `__PROTECTED_LATEX_INLINE_${index}__`;
    });

    processed = processed.replace(
      /(^|[^A-Za-z\\])((?:\\[A-Za-z]+)(?:\s*(?:\{[^{}\n]*\}|\[[^\]\n]*\]|_(?:[A-Za-z0-9]+|\{[^{}\n]+\})|\^(?:[A-Za-z0-9]+|\{[^{}\n]+\})))*)(?=$|[\s,.;:!?，。；：！？、)）\]}])/g,
      (match, prefix, latex) => `${prefix}${pushLatexPlaceholder(latexBlocks, latex, false)}`
    );

    processed = processed.replace(
      /(^|[^A-Za-z0-9\\])([A-Za-z](?:(?:\s*_(?:[A-Za-z0-9]+|\{[^{}\n]+\}))|(?:\s*\^(?:[A-Za-z0-9+\-*/=]+|\{[^{}\n]+\})))+)(?=$|[\s,.;:!?，。；：！？、)）\]}])/g,
      (match, prefix, latex) => `${prefix}${pushLatexPlaceholder(latexBlocks, latex, false)}`
    );

    processed = processed.replace(/__PROTECTED_LATEX_INLINE_(\d+)__/g, (match, index) => {
      return protectedInlineMath[parseInt(index, 10)] || match;
    });

    return processed;
  }

  function isBareLatexExpression(text) {
    if (!text || typeof text !== "string") return false;

    const trimmed = text.trim();
    if (!trimmed) return false;

    if (/^\\[A-Za-z]+(?:\s*(?:\{[^{}\n]*\}|\[[^\]\n]*\]|_(?:[A-Za-z0-9]+|\{[^{}\n]+\})|\^(?:[A-Za-z0-9]+|\{[^{}\n]+\})))*$/.test(trimmed)) {
      return true;
    }

    return /^[A-Za-z](?:(?:\s*_(?:[A-Za-z0-9]+|\{[^{}\n]+\}))|(?:\s*\^(?:[A-Za-z0-9+\-*/=]+|\{[^{}\n]+\})))+$/.test(trimmed);
  }

  function isStandaloneLatexLine(text) {
    if (!text || typeof text !== "string") return false;

    const trimmed = text.trim();
    if (!trimmed) return false;
    if (/^\\[\[\(].*[\\\]\)]$/.test(trimmed)) return false;
    if (/[*`#<>\[\]]/.test(trimmed)) return false;
    if (isBareLatexExpression(trimmed)) return true;
    if (!trimmed.includes("\\")) return false;

    return /^[-+*/=(){}[\]\\_^&,%.:;!?\sA-Za-z0-9]+$/.test(trimmed);
  }

  function markdownToHtml(md) {
    if (!md) return "";

    const latexBlocks = [];
    const codeBlocks = [];
    const parts = md.split(/```/);
    let processedMd = "";

    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split("\n");
        let language = "";
        let code = part;

        if (lines.length > 1 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
          language = lines[0].trim();
          code = lines.slice(1).join("\n");
        }

        code = code.replace(/^\s+|\s+$/g, "");
        const codeIndex = codeBlocks.length;
        codeBlocks.push({ code, language });
        processedMd += `__CODE_BLOCK_${codeIndex}__`;
        return;
      }

      let text = part;

      text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
        const indexOfBlock = latexBlocks.length;
        latexBlocks.push({ content: content.trim(), displayMode: true });
        return `__LATEX_BLOCK_${indexOfBlock}__`;
      });

      text = text.replace(/\\\[((?:.|\n)*?)\\\]/g, (match, content) => {
        const indexOfBlock = latexBlocks.length;
        latexBlocks.push({ content: content.trim(), displayMode: true });
        return `__LATEX_BLOCK_${indexOfBlock}__`;
      });

      text = text.replace(/\$([^\$\n]+?)\$/g, (match, content) => {
        const indexOfBlock = latexBlocks.length;
        latexBlocks.push({ content: content.trim(), displayMode: false });
        return `__LATEX_INLINE_${indexOfBlock}__`;
      });

      text = text.replace(/\\\((.+?)\\\)/g, (match, content) => {
        return pushLatexPlaceholder(latexBlocks, content, false);
      });

      text = replaceBareLatexInline(text, latexBlocks);
      processedMd += text;
    });

    function renderInlineMarkdown(text) {
      if (!text) return "";

      let html = escapeHtml(text);
      html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
      html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/(^|[^\*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>");
      html = html.replace(/`([^`]+)`/g, (match, code) => {
        if (code.match(/^__LATEX_INLINE_\d+__$/)) {
          return match;
        }
        return `<code>${code}</code>`;
      });
      html = html.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      return html;
    }

    function renderTextSegment(segment) {
      const lines = segment.split("\n");
      const htmlParts = [];
      let paragraphBuffer = [];
      let listItems = [];
      let listType = null;

      function flushParagraph() {
        if (!paragraphBuffer.length) return;
        htmlParts.push(`<p>${renderInlineMarkdown(paragraphBuffer.join(" "))}</p>`);
        paragraphBuffer = [];
      }

      function flushList() {
        if (!listItems.length || !listType) return;
        const itemsHtml = listItems
          .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
          .join("");
        htmlParts.push(`<${listType}>${itemsHtml}</${listType}>`);
        listItems = [];
        listType = null;
      }

      lines.forEach((rawLine) => {
        const line = rawLine.trimEnd();
        const trimmed = line.trim();

        if (!trimmed) {
          flushParagraph();
          flushList();
          return;
        }

        if (isStandaloneLatexLine(trimmed)) {
          flushParagraph();
          flushList();
          htmlParts.push(renderLatex(trimmed, true));
          return;
        }

        const titleMatch = trimmed.match(/^(#{1,6})\s+(.+?)\s*$/);
        if (titleMatch) {
          flushParagraph();
          flushList();
          const level = titleMatch[1].length;
          htmlParts.push(`<h${level}>${renderInlineMarkdown(titleMatch[2])}</h${level}>`);
          return;
        }

        const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
        if (unorderedMatch) {
          flushParagraph();
          if (listType && listType !== "ul") {
            flushList();
          }
          listType = "ul";
          listItems.push(unorderedMatch[1]);
          return;
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (orderedMatch) {
          flushParagraph();
          if (listType && listType !== "ol") {
            flushList();
          }
          listType = "ol";
          listItems.push(orderedMatch[1]);
          return;
        }

        flushList();
        paragraphBuffer.push(trimmed);
      });

      flushParagraph();
      flushList();

      return htmlParts.join("");
    }

    let html = "";
    const textParts = processedMd.split(
      /(__CODE_BLOCK_\d+__|__LATEX_BLOCK_\d+__)/
    );

    textParts.forEach((part) => {
      if (part.match(/^__(?:CODE_BLOCK|LATEX_BLOCK)_\d+__$/)) {
        html += part;
        return;
      }

      html += renderTextSegment(part);
    });

    html = html.replace(/__LATEX_BLOCK_(\d+)__/g, (match, index) => {
      const latex = latexBlocks[parseInt(index, 10)];
      return renderLatex(latex.content, true);
    });

    html = html.replace(/__LATEX_INLINE_(\d+)__/g, (match, index) => {
      const latex = latexBlocks[parseInt(index, 10)];
      return renderLatex(latex.content, false);
    });

    html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
      const codeBlock = codeBlocks[parseInt(index, 10)];
      return renderCodeBlock(codeBlock.code, codeBlock.language);
    });

    return html;
  }

  ensureLibraries();

  window.__llm_reader_renderer__ = {
    markdownToHtml,
    rerenderPendingMath,
    ensureLibraries,
    librariesLoaded,
  };
})();
