const HISTORY_STORAGE_KEY = "llm_conversation_history";
const LEGACY_HISTORY_STORAGE_KEY = "chatHistory";
const MAX_HISTORY_COUNT = 100;
const MAX_HISTORY_AGE_DAYS = 30;

function generateConversationId() {
  return "conv_" + Date.now().toString(36) + "_" + Math.random().toString(16).slice(2, 8);
}

function generateConversationTitle(pageData, messages) {
  if (pageData && pageData.title) {
    return pageData.title.length > 50 ? pageData.title.substring(0, 50) + "..." : pageData.title;
  }

  const userMessage = messages.find((message) => message.role === "user");
  if (userMessage && userMessage.content) {
    const content = userMessage.content.replace(/\n/g, " ").trim();
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  }

  return "对话 " + new Date().toLocaleString();
}

function toConversationRecord(legacyItem) {
  const timestamp = legacyItem.timestamp || Date.now();
  const createdAt = legacyItem.iso_string || new Date(timestamp).toISOString();
  const messages = Array.isArray(legacyItem.messages) ? legacyItem.messages : [];

  return {
    id: legacyItem.id || generateConversationId(),
    title:
      legacyItem.title ||
      generateConversationTitle(
        { title: legacyItem.title || "", url: legacyItem.url || "" },
        messages
      ),
    url: legacyItem.url || "",
    page_title: legacyItem.title || "",
    profile_id: legacyItem.profile_id || "",
    messages,
    created_at: createdAt,
    updated_at: createdAt,
    message_count: messages.length,
  };
}

async function cleanupHistory(history) {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - MAX_HISTORY_AGE_DAYS * 24 * 60 * 60 * 1000);

  const validHistory = history.filter((conversation) => {
    const conversationDate = new Date(conversation.created_at);
    return conversationDate > cutoffDate;
  });

  if (validHistory.length > MAX_HISTORY_COUNT) {
    return validHistory.slice(0, MAX_HISTORY_COUNT);
  }

  return validHistory;
}

async function readLegacyHistory() {
  const data = await chrome.storage.local.get(LEGACY_HISTORY_STORAGE_KEY);
  const legacyHistory = data[LEGACY_HISTORY_STORAGE_KEY];
  return Array.isArray(legacyHistory) ? legacyHistory : [];
}

export async function getConversationHistory() {
  try {
    const data = await chrome.storage.local.get(HISTORY_STORAGE_KEY);
    const currentHistory = Array.isArray(data[HISTORY_STORAGE_KEY]) ? data[HISTORY_STORAGE_KEY] : [];

    if (currentHistory.length > 0) {
      return currentHistory;
    }

    const legacyHistory = await readLegacyHistory();
    if (!legacyHistory.length) {
      return [];
    }

    const migratedHistory = await cleanupHistory(legacyHistory.map(toConversationRecord));
    await chrome.storage.local.set({
      [HISTORY_STORAGE_KEY]: migratedHistory,
      [LEGACY_HISTORY_STORAGE_KEY]: [],
    });
    return migratedHistory;
  } catch (error) {
    console.error("获取对话历史失败:", error);
    return [];
  }
}

export async function saveConversationHistory(pageData, messages, profileId) {
  try {
    const history = await getConversationHistory();
    const now = new Date().toISOString();
    const conversationId = typeof pageData?.conversationId === "string" ? pageData.conversationId : "";
    const existingConversation = conversationId
      ? history.find((conversation) => conversation.id === conversationId)
      : null;
    const conversation = {
      id: existingConversation?.id || generateConversationId(),
      title: generateConversationTitle(pageData, messages),
      url: pageData?.url || existingConversation?.url || "",
      page_title: pageData?.title || existingConversation?.page_title || "",
      profile_id: profileId || existingConversation?.profile_id || "",
      messages: Array.isArray(messages) ? messages : [],
      created_at: existingConversation?.created_at || now,
      updated_at: now,
      message_count: Array.isArray(messages) ? messages.length : 0,
    };

    const restHistory = existingConversation
      ? history.filter((item) => item.id !== existingConversation.id)
      : history;
    const nextHistory = [conversation, ...restHistory];
    const cleanedHistory = await cleanupHistory(nextHistory);

    await chrome.storage.local.set({
      [HISTORY_STORAGE_KEY]: cleanedHistory,
      [LEGACY_HISTORY_STORAGE_KEY]: [],
    });

    return conversation.id;
  } catch (error) {
    console.error("保存对话历史失败:", error);
    throw error;
  }
}

export async function deleteConversation(conversationId) {
  try {
    const history = await getConversationHistory();
    const filteredHistory = history.filter((conversation) => conversation.id !== conversationId);
    await chrome.storage.local.set({
      [HISTORY_STORAGE_KEY]: filteredHistory,
      [LEGACY_HISTORY_STORAGE_KEY]: [],
    });
    return true;
  } catch (error) {
    console.error("删除对话记录失败:", error);
    return false;
  }
}

export async function clearAllHistory() {
  try {
    await chrome.storage.local.set({
      [HISTORY_STORAGE_KEY]: [],
      [LEGACY_HISTORY_STORAGE_KEY]: [],
    });
    return true;
  } catch (error) {
    console.error("清空对话历史失败:", error);
    return false;
  }
}

export async function searchConversationHistory(query) {
  try {
    const history = await getConversationHistory();
    const searchQuery = query.toLowerCase().trim();

    if (!searchQuery) {
      return history;
    }

    return history.filter((conversation) => {
      if (conversation.title.toLowerCase().includes(searchQuery)) {
        return true;
      }
      if (conversation.page_title && conversation.page_title.toLowerCase().includes(searchQuery)) {
        return true;
      }
      if (conversation.url && conversation.url.toLowerCase().includes(searchQuery)) {
        return true;
      }

      return conversation.messages.some((message) => {
        return message.content && message.content.toLowerCase().includes(searchQuery);
      });
    });
  } catch (error) {
    console.error("搜索对话历史失败:", error);
    return [];
  }
}
