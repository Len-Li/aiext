// content_script.js
// 在页面上下文中提取可读文本内容，返回给 background 使用。

function getPageText() {
  try {
    let text = document.body ? document.body.innerText || "" : "";
    // 简单清洗：去掉多余空白并截断长度，防止请求体过大
    text = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    const MAX_LEN = 8000;
    if (text.length > MAX_LEN) {
      text = text.slice(0, MAX_LEN) + "\n\n[内容过长，已截断部分文本]";
    }

    return {
      title: document.title || "",
      url: location.href,
      text,
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


