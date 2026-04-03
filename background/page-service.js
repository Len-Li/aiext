const pageDataCache = new Map();
const PAGE_DATA_CACHE_TTL = 10000;

export async function getPageData(tabId) {
  const cached = pageDataCache.get(tabId);
  const now = Date.now();

  if (cached && now - cached.timestamp < PAGE_DATA_CACHE_TTL) {
    console.log("使用缓存的页面数据");
    return cached.data;
  }

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

  pageDataCache.set(tabId, { data: pageData, timestamp: now });
  return pageData;
}
