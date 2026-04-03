import {
  getFullConfig,
  initConfigService,
  normalizeApiUrl,
} from "./background/config-service.js";
import { clearAllHistory, deleteConversation, getConversationHistory, saveConversationHistory, searchConversationHistory } from "./background/history-service.js";
import { callLLM } from "./background/llm-service.js";
import { getPageData } from "./background/page-service.js";

self.addEventListener("error", (event) => {
  console.error("Service Worker 错误:", event.error || event.message);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的 Promise 拒绝:", event.reason);
});

initConfigService();

async function analyzeCurrentPage(tabId) {
  const pageData = await getPageData(tabId);
  return callLLM(pageData);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      } catch (error) {
        console.error("获取页面内容失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
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
      } catch (error) {
        console.error("分析页面失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();

    return true;
  }

  if (message?.type === "OPEN_OPTIONS") {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
    return false;
  }

  if (message?.type === "NORMALIZE_API_URL") {
    sendResponse({ url: normalizeApiUrl(message.url) });
    return false;
  }

  if (message?.type === "GET_FULL_CONFIG") {
    (async () => {
      try {
        const config = await getFullConfig();
        sendResponse({ ok: true, config });
      } catch (error) {
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();
    return true;
  }

  if (message?.type === "SAVE_CONVERSATION_HISTORY") {
    (async () => {
      try {
        const conversationId = await saveConversationHistory(
          message.pageData,
          message.messages,
          message.profileId
        );
        sendResponse({ ok: true, conversationId });
      } catch (error) {
        console.error("保存对话历史失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();
    return true;
  }

  if (message?.type === "GET_CONVERSATION_HISTORY") {
    (async () => {
      try {
        const history = await getConversationHistory();
        sendResponse({ ok: true, history });
      } catch (error) {
        console.error("获取对话历史失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();
    return true;
  }

  if (message?.type === "SEARCH_CONVERSATION_HISTORY") {
    (async () => {
      try {
        const results = await searchConversationHistory(message.query || "");
        sendResponse({ ok: true, results });
      } catch (error) {
        console.error("搜索对话历史失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();
    return true;
  }

  if (message?.type === "DELETE_CONVERSATION") {
    (async () => {
      try {
        const ok = await deleteConversation(message.conversationId);
        sendResponse({ ok });
      } catch (error) {
        console.error("删除对话记录失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();
    return true;
  }

  if (message?.type === "CLEAR_ALL_HISTORY") {
    (async () => {
      try {
        const ok = await clearAllHistory();
        sendResponse({ ok });
      } catch (error) {
        console.error("清空对话历史失败:", error);
        sendResponse({ ok: false, error: error?.message || String(error) });
      }
    })();
    return true;
  }

  return false;
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ANALYSIS" });
  } catch (error) {
    console.warn("无法向标签页发送消息，内容脚本可能未注入:", error);
  }
});
