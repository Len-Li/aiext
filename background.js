// background.js (service worker, MV3)

function normalizeApiUrl(raw) {
  if (!raw) return "";
  let url = String(raw).trim();

  // 去掉末尾多余的斜杠，便于后续判断
  url = url.replace(/\/+$/, "");

  // 尝试用 URL 解析，做通用 OpenAI-Compatible 规则：
  // - 只填到主机： https://api.xxx.com         → https://api.xxx.com/v1/chat/completions
  // - 填到 /v1：   https://api.xxx.com/v1      → https://api.xxx.com/v1/chat/completions
  try {
    const u = new URL(url);
    const base = u.origin;
    let path = u.pathname || "";
    path = path.replace(/\/+$/, "");

    if (!path || path === "/") {
      return base + "/v1/chat/completions";
    }
    if (path === "/v1") {
      return base + "/v1/chat/completions";
    }
    if (path === "/v1/chat" || path === "/v1/chat/") {
      return base + "/v1/chat/completions";
    }
    if (path === "/v1/completions") {
      return base + "/v1/chat/completions";
    }
    // 已经是 /v1/chat/completions 或更具体路径，直接返回
    if (path.startsWith("/v1/chat/completions")) {
      return base + path;
    }

    // 其他自定义 path 保持原样（适配非标准兼容实现）
    return base + path;
  } catch {
    // 不是合法 URL，就按原样返回
    return url;
  }
}

// 统一从 storage 中读取当前激活的 LLM 配置，支持多配置
async function getConfig() {
  const data = await chrome.storage.sync.get([
    "llmProfiles",
    "activeLlmId",
    "apiUrl",
    "apiKey",
    "model",
  ]);

  let profiles = Array.isArray(data.llmProfiles) ? data.llmProfiles : [];

  // 兼容旧版本：只有单一 apiUrl/apiKey/model 时，自动迁移为一个默认配置
  if (!profiles.length && (data.apiUrl || data.apiKey || data.model)) {
    const legacyProfile = {
      id: "default",
      name: "默认配置",
      apiUrl: data.apiUrl || "",
      apiKey: data.apiKey || "",
      model: data.model || "",
    };
    profiles = [legacyProfile];
    await chrome.storage.sync.set({
      llmProfiles: profiles,
      activeLlmId: legacyProfile.id,
    });
  }

  const active =
    profiles.find((p) => p.id === data.activeLlmId) || profiles[0] || null;

  if (!active) {
    return { apiUrl: "", apiKey: "", model: "" };
  }

  return {
    apiUrl: normalizeApiUrl(active.apiUrl),
    apiKey: active.apiKey,
    model: active.model,
  };
}

async function callLLM(pageData) {
  const { apiUrl, apiKey, model } = await getConfig();

  if (!apiUrl || !apiKey || !model) {
    throw new Error("尚未配置 API 地址 / API Key / 模型。");
  }

  // 按 OpenAI Compatible Chat Completions 格式组织请求体
  // 适配 /v1/chat/completions 风格的 API（如 OpenAI、硅基流动兼容端点等）
  const body = {
    model,
    messages: [
      {
        role: "system",
        content:
          "你是一个帮助用户用简体中文解释网页内容的助手，需要用通俗、分点的方式总结重点。",
      },
      {
        role: "user",
        content: `请你阅读下面网页内容，并完成：
1）用条列的方式概括核心观点与结构
2）指出重要细节与结论
3）最后给一个三行以内的简洁总结

网页标题：${pageData.title || "（无标题）"}
网页链接：${pageData.url || "（无链接）"}

正文内容如下：
${pageData.text || "（无正文内容）"}`,
      },
    ],
    // 你可以视情况调整
    max_tokens: 1024,
    // 保持兼容性：有些 OpenAI-Compatible 服务要求显式指定
    stream: false,
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM 接口返回错误状态 ${res.status}: ${text}`);
  }

  const data = await res.json();

  // 优先按 OpenAI Chat Completions 规范解析
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    JSON.stringify(data);

  return content;
}

// 仅获取当前页面内容，用于前端聊天窗口构造上下文
async function getPageData(tabId) {
  // 在目标 tab 中执行 content_script.js，获取页面内容
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content_script.js"],
  });

  if (!results || !results.length) {
    throw new Error("无法从页面获取内容。");
  }

  const pageData = results[0].result;
  if (!pageData) {
    throw new Error("内容脚本未返回数据。");
  }

  if (pageData.error) {
    throw new Error("读取页面内容失败：" + pageData.error);
  }

  return pageData;
}

// 旧逻辑：直接在后台调用 LLM，暂时保留以兼容旧消息类型
async function analyzeCurrentPage(tabId) {
  const pageData = await getPageData(tabId);
  const llmResult = await callLLM(pageData);
  return llmResult;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 新接口：仅返回当前页面内容，供 overlay.js 里做流式对话使用
  if (message?.type === "GET_PAGE_DATA") {
    const tabId = message.tabId || sender.tab?.id;
    if (!tabId) {
      sendResponse({ ok: false, error: "未获取到 tabId。" });
      return true;
    }

    (async () => {
      try {
        const pageData = await getPageData(tabId);
        sendResponse({ ok: true, pageData });
      } catch (err) {
        console.error("获取页面内容失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();

    return true;
  }

  if (message?.type === "ANALYZE_CURRENT_PAGE" || message?.type === "ANALYZE_FROM_CONTENT") {
    const tabId = message.tabId || sender.tab?.id;
    if (!tabId) {
      sendResponse({ ok: false, error: "未获取到 tabId。" });
      return true;
    }

    (async () => {
      try {
        const result = await analyzeCurrentPage(tabId);
        sendResponse({ ok: true, result });
      } catch (err) {
        console.error("分析页面失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();

    // 异步响应
    return true;
  }

  if (message?.type === "OPEN_OPTIONS") {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
    // 不需要异步响应
  }
});

