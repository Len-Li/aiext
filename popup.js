// popup.js

const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const openOptionsBtn = document.getElementById("open-options");

// 使用通用的状态设置函数
const setStatus = (function(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.style.color = isError ? "#f97373" : "#9ca3af";
});

openOptionsBtn?.addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});

analyzeBtn?.addEventListener("click", async () => {
  setStatus("正在读取网页内容并请求 LLM，请稍候…");
  resultEl.value = "";

  try {
    // 从 storage 获取配置
    const { apiKey, apiUrl, model } = await chrome.storage.sync.get([
      "apiKey",
      "apiUrl",
      "model",
    ]);

    if (!apiKey || !apiUrl || !model) {
      setStatus("请先在设置中配置 API 地址、API Key 和模型。", true);
      return;
    }

    // 获取当前 tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus("未找到当前标签页。", true);
      return;
    }

    // 发送消息给 background，让它调用 content script 抓取内容并请求 LLM
    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE_CURRENT_PAGE",
      tabId: tab.id,
    });

    if (response?.ok) {
      setStatus("解读完成。");
      resultEl.value = response.result || "（LLM 无返回结果）";
    } else {
      setStatus(response?.error || "解读失败，请稍后重试。", true);
    }
  } catch (err) {
    console.error(err);
    setStatus("调用失败：" + (err?.message || String(err)), true);
  }
});


