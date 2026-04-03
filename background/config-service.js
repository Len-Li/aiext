let configCache = null;

export function normalizeApiUrl(raw) {
  if (!raw) return "";
  let url = String(raw).trim();
  url = url.replace(/\/+$/, "");

  if (url.includes("bigmodel.cn") || url.includes("zhipu")) {
    return "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions";
  }

  try {
    const parsedUrl = new URL(url);
    const base = parsedUrl.origin;
    let path = parsedUrl.pathname || "";
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
    if (path.startsWith("/v1/chat/completions")) {
      return base + path;
    }

    return base + path;
  } catch {
    return url;
  }
}

export function initConfigService() {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (
      namespace === "sync" &&
      (changes.llmProfiles ||
        changes.activeLlmId ||
        changes.apiUrl ||
        changes.apiKey ||
        changes.model)
    ) {
      configCache = null;
      console.log("配置已更新，缓存已清除");
    }
  });
}

export async function getFullConfig() {
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
    activeLlmId: data.activeLlmId || profiles[0]?.id || null,
  };

  configCache = result;
  return result;
}

export async function getActiveConfig() {
  const { profiles, activeLlmId } = await getFullConfig();
  const active = profiles.find((profile) => profile.id === activeLlmId) || profiles[0] || null;

  if (!active) {
    return { apiUrl: "", apiKey: "", model: "" };
  }

  return {
    apiUrl: normalizeApiUrl(active.apiUrl),
    apiKey: active.apiKey,
    model: active.model,
  };
}
