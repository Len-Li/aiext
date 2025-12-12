// background.js (service worker, MV3)

// 全局错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker 错误:', event.error || event.message);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
});

// 缓存机制
let configCache = null;
let pageDataCache = new Map(); // tabId -> { data, timestamp }
const PAGE_DATA_CACHE_TTL = 10000; // 10秒

// 监听存储变化，使配置缓存失效
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.llmProfiles || changes.activeLlmId || changes.apiUrl || changes.apiKey || changes.model)) {
    configCache = null;
    console.log('配置已更新，缓存已清除');
  }
});

/**
 * 标准化 API URL，适配 OpenAI-Compatible 端点。
 * 将用户输入的 URL 转换为完整的 /v1/chat/completions 端点。
 * @param {string} raw - 原始 URL 字符串
 * @returns {string} 标准化后的 URL
 */
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
  const { profiles, activeLlmId } = await getFullConfig();
  
  const active = profiles.find((p) => p.id === activeLlmId) || profiles[0] || null;

  if (!active) {
    return { apiUrl: "", apiKey: "", model: "" };
  }

  return {
    apiUrl: normalizeApiUrl(active.apiUrl),
    apiKey: active.apiKey,
    model: active.model,
  };
}

/**
 * 获取完整的 LLM 配置（支持多配置，带缓存）。
 * 从 chrome.storage.sync 读取配置，并处理旧版本兼容性。
 * @returns {Promise<{profiles: Array, activeLlmId: string|null}>}
 */
async function getFullConfig() {
  // 如果缓存存在，直接返回
  if (configCache) {
    return configCache;
  }

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

  // 没有任何配置时，创建一个占位配置，提醒用户去设置
  if (!profiles.length) {
    profiles = [
      {
        id: "empty",
        name: "未配置，请前往设置",
        apiUrl: "",
        apiKey: "",
        model: "",
      },
    ];
  }

  const result = {
    profiles,
    activeLlmId: data.activeLlmId || profiles[0]?.id || null
  };

  // 存入缓存
  configCache = result;
  return result;
}

/**
 * 调用 LLM API 进行网页内容分析。
 * 使用当前激活的配置，发送包含页面数据的请求，并返回解析后的回答。
 * @param {Object} pageData - 页面数据对象，包含 title、url、text 等字段
 * @returns {Promise<string>} LLM 返回的文本内容
 * @throws {Error} 当配置缺失、网络错误或 API 返回错误时抛出
 */
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorText = "";
      try {
        errorText = await res.text();
      } catch {
        // 忽略解析错误
      }
      throw new Error(`LLM 接口返回错误状态 ${res.status}: ${errorText || '无详细错误信息'}`);
    }

    const data = await res.json();

    // 优先按 OpenAI Chat Completions 规范解析
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      JSON.stringify(data);

    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接或稍后重试。');
    }
    // 重新抛出其他错误
    throw error;
  }
}

// 仅获取当前页面内容，用于前端聊天窗口构造上下文（带缓存）
async function getPageData(tabId) {
  // 检查缓存
  const cached = pageDataCache.get(tabId);
  const now = Date.now();
  if (cached && (now - cached.timestamp) < PAGE_DATA_CACHE_TTL) {
    console.log('使用缓存的页面数据');
    return cached.data;
  }

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

  // 存入缓存
  pageDataCache.set(tabId, { data: pageData, timestamp: now });
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

  if (message?.type === "NORMALIZE_API_URL") {
    sendResponse({ url: normalizeApiUrl(message.url) });
  }

  if (message?.type === "GET_FULL_CONFIG") {
    (async () => {
      try {
        const config = await getFullConfig();
        sendResponse({ ok: true, config });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true; // 异步响应
  }

  // 历史记录相关消息
  if (message?.type === "SAVE_CONVERSATION_HISTORY") {
    (async () => {
      try {
        const conversationId = await saveConversationHistory(
          message.pageData,
          message.messages,
          message.profileId
        );
        sendResponse({ ok: true, conversationId });
      } catch (err) {
        console.error("保存对话历史失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();
    return true;
  }

  if (message?.type === "GET_CONVERSATION_HISTORY") {
    (async () => {
      try {
        const history = await getConversationHistory();
        sendResponse({ ok: true, history });
      } catch (err) {
        console.error("获取对话历史失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();
    return true;
  }

  if (message?.type === "SEARCH_CONVERSATION_HISTORY") {
    (async () => {
      try {
        const results = await searchConversationHistory(message.query);
        sendResponse({ ok: true, results });
      } catch (err) {
        console.error("搜索对话历史失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();
    return true;
  }

  if (message?.type === "DELETE_CONVERSATION") {
    (async () => {
      try {
        const success = await deleteConversation(message.conversationId);
        sendResponse({ ok: success });
      } catch (err) {
        console.error("删除对话记录失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();
    return true;
  }

  if (message?.type === "CLEAR_ALL_HISTORY") {
    (async () => {
      try {
        const success = await clearAllHistory();
        sendResponse({ ok: success });
      } catch (err) {
        console.error("清空对话历史失败:", err);
        sendResponse({
          ok: false,
          error: err?.message || String(err),
        });
      }
    })();
    return true;
  }
});

// 对话历史管理功能
const HISTORY_STORAGE_KEY = 'llm_conversation_history';
const MAX_HISTORY_COUNT = 100; // 最大保存历史记录数量
const MAX_HISTORY_AGE_DAYS = 30; // 历史记录保存天数

// 保存对话历史
async function saveConversationHistory(pageData, messages, profileId) {
  try {
    const history = await getConversationHistory();
    const now = new Date();
    
    const conversation = {
      id: generateConversationId(),
      title: generateConversationTitle(pageData, messages),
      url: pageData.url || '',
      page_title: pageData.title || '',
      profile_id: profileId || '',
      messages: messages || [],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      message_count: messages ? messages.length : 0
    };
    
    // 添加到历史记录开头
    history.unshift(conversation);
    
    // 清理过期和超量的记录
    await cleanupHistory(history);
    
    // 保存到存储
    await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: history });
    
    return conversation.id;
  } catch (error) {
    console.error('保存对话历史失败:', error);
    throw error;
  }
}

// 获取对话历史
async function getConversationHistory() {
  try {
    const data = await chrome.storage.local.get(HISTORY_STORAGE_KEY);
    return data[HISTORY_STORAGE_KEY] || [];
  } catch (error) {
    console.error('获取对话历史失败:', error);
    return [];
  }
}

// 获取单个对话记录
async function getConversationById(conversationId) {
  try {
    const history = await getConversationHistory();
    return history.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('获取对话记录失败:', error);
    return null;
  }
}

// 删除对话记录
async function deleteConversation(conversationId) {
  try {
    const history = await getConversationHistory();
    const filteredHistory = history.filter(conv => conv.id !== conversationId);
    await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: filteredHistory });
    return true;
  } catch (error) {
    console.error('删除对话记录失败:', error);
    return false;
  }
}

// 清空所有对话历史
async function clearAllHistory() {
  try {
    await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: [] });
    return true;
  } catch (error) {
    console.error('清空对话历史失败:', error);
    return false;
  }
}

// 搜索对话历史
async function searchConversationHistory(query) {
  try {
    const history = await getConversationHistory();
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
      return history;
    }
    
    return history.filter(conv => {
      // 搜索标题
      if (conv.title.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // 搜索页面标题
      if (conv.page_title && conv.page_title.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // 搜索URL
      if (conv.url && conv.url.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // 搜索消息内容
      return conv.messages.some(msg => {
        if (msg.content && msg.content.toLowerCase().includes(searchQuery)) {
          return true;
        }
        return false;
      });
    });
  } catch (error) {
    console.error('搜索对话历史失败:', error);
    return [];
  }
}

// 生成对话ID
function generateConversationId() {
  return 'conv_' + Date.now().toString(36) + '_' + Math.random().toString(16).slice(2, 8);
}

// 生成对话标题
function generateConversationTitle(pageData, messages) {
  // 优先使用页面标题
  if (pageData && pageData.title) {
    return pageData.title.length > 50 ? pageData.title.substring(0, 50) + '...' : pageData.title;
  }
  
  // 使用第一条用户消息作为标题
  const userMessage = messages.find(msg => msg.role === 'user');
  if (userMessage && userMessage.content) {
    const content = userMessage.content.replace(/\n/g, ' ').trim();
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }
  
  // 默认标题
  return '对话 ' + new Date().toLocaleString();
}

// 清理过期和超量的历史记录
async function cleanupHistory(history) {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - MAX_HISTORY_AGE_DAYS * 24 * 60 * 60 * 1000);
  
  // 移除过期记录
  const validHistory = history.filter(conv => {
    const convDate = new Date(conv.created_at);
    return convDate > cutoffDate;
  });
  
  // 如果仍然超过最大数量，保留最新的记录
  if (validHistory.length > MAX_HISTORY_COUNT) {
    return validHistory.slice(0, MAX_HISTORY_COUNT);
  }
  return validHistory;
}

// 点击扩展图标时触发分析
chrome.action.onClicked.addListener(async (tab) => {
  // 向当前标签页发送消息，触发分析
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ANALYSIS" });
  } catch (error) {
    // 如果内容脚本未注入（例如页面未加载），则忽略错误
    console.warn("无法向标签页发送消息，内容脚本可能未注入:", error);
  }
});


