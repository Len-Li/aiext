// options.js
import { applyTranslations, getLanguage, setLanguage, t } from './i18n.js';

const profileSelect = document.getElementById("profile-select");
const profileNameInput = document.getElementById("profile-name");
const apiUrlInput = document.getElementById("api-url");
const apiKeyInput = document.getElementById("api-key");
const modelInput = document.getElementById("model");
const addProfileBtn = document.getElementById("add-profile-btn");
const deleteProfileBtn = document.getElementById("delete-profile-btn");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");
const languageSelect = document.getElementById("language-select");

let profiles = [];
let activeLlmId = null;

function setStatus(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.style.color = isError ? "#f97373" : "#9ca3af";
}

function genId() {
  return "p_" + Date.now().toString(36) + "_" + Math.random().toString(16).slice(2, 8);
}

async function renderProfileSelect() {
  if (!profileSelect) return;
  profileSelect.innerHTML = "";
  const lang = await getLanguage();

  if (!profiles.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = t("name_no_profile", lang) || "暂无配置，请先新增"; // Consider adding this key
    profileSelect.appendChild(opt);
    profileNameInput.value = "";
    apiUrlInput.value = "";
    apiKeyInput.value = "";
    modelInput.value = "";
    return;
  }

  profiles.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name || "(未命名配置)";
    profileSelect.appendChild(opt);
  });

  const active = profiles.find((p) => p.id === activeLlmId) || profiles[0];
  activeLlmId = active.id;
  profileSelect.value = activeLlmId;

  profileNameInput.value = active.name || "";
  apiUrlInput.value = active.apiUrl || "";
  apiKeyInput.value = active.apiKey || "";
  modelInput.value = active.model || "";
}

async function restore() {
  try {
    // 1. 应用语言设置
    await applyTranslations();
    const currentLang = await getLanguage();
    if (languageSelect) {
      languageSelect.value = currentLang;
    }

    // 2. 加载配置
    const response = await chrome.runtime.sendMessage({ type: "GET_FULL_CONFIG" });
    if (!response?.ok) {
      throw new Error(response?.error || "获取配置失败");
    }
    
    let { profiles: configProfiles, activeLlmId: configActiveId } = response.config;
    
    profiles = configProfiles;
    activeLlmId = configActiveId;

    if (!profiles.length) {
      // 没有任何配置时，创建一个空白配置
      const created = {
        id: genId(),
        name: t("name_default_profile", currentLang) || "我的第一个配置", // Consider adding this key
        apiUrl: "",
        apiKey: "",
        model: "",
      };
      profiles = [created];
      activeLlmId = created.id;
      await chrome.storage.sync.set({
        llmProfiles: profiles,
        activeLlmId,
      });
    }

    renderProfileSelect();
  } catch (err) {
    console.error(err);
    setStatus("读取已有配置失败：" + (err?.message || String(err)), true);
  }
}

// 监听语言切换
languageSelect?.addEventListener("change", async () => {
  const newLang = languageSelect.value;
  await setLanguage(newLang);
  await applyTranslations();
  renderProfileSelect(); // 重新渲染下拉框（如果有翻译的内容）
});

profileSelect?.addEventListener("change", () => {
  const id = profileSelect.value;
  const found = profiles.find((p) => p.id === id);
  if (!found) return;
  activeLlmId = id;
  profileNameInput.value = found.name || "";
  apiUrlInput.value = found.apiUrl || "";
  apiKeyInput.value = found.apiKey || "";
  modelInput.value = found.model || "";
  chrome.storage.sync.set({ activeLlmId: id }).catch(() => {});
});

addProfileBtn?.addEventListener("click", async () => {
  const lang = await getLanguage();
  const id = genId();
  const newProfile = {
    id,
    name: t("name_new_profile", lang) || "新配置", // Consider adding this key
    apiUrl: "",
    apiKey: "",
    model: "",
  };
  profiles.push(newProfile);
  activeLlmId = id;
  await chrome.storage.sync.set({ llmProfiles: profiles, activeLlmId });
  renderProfileSelect();
  setStatus(t("status_added_profile", lang) || "已新增一个空白配置。");
  const addProfileTimeout = setTimeout(() => setStatus(""), 1500);
});

deleteProfileBtn?.addEventListener("click", async () => {
  const lang = await getLanguage();
  if (profiles.length <= 1) {
    setStatus(t("status_delete_fail", lang) || "至少需要保留一个配置，无法删除。", true);
    return;
  }
  const id = activeLlmId;
  profiles = profiles.filter((p) => p.id !== id);
  activeLlmId = profiles[0].id;
  await chrome.storage.sync.set({ llmProfiles: profiles, activeLlmId });
  renderProfileSelect();
  setStatus(t("status_deleted_profile", lang) || "已删除当前配置。");
  const deleteProfileTimeout = setTimeout(() => setStatus(""), 1500);
});

saveBtn?.addEventListener("click", async () => {
  const lang = await getLanguage();
  setStatus(t("status_saving", lang) || "正在保存…");
  try {
    if (!activeLlmId) {
      setStatus(t("status_no_profile_to_save", lang) || "当前没有可保存的配置，请先新增。", true);
      return;
    }

    const name = profileNameInput.value.trim() || t("name_unnamed_profile", lang) || "未命名配置";
    const apiUrl = apiUrlInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelInput.value.trim();

    if (!apiUrl || !apiKey || !model) {
      setStatus(t("status_save_fail_empty", lang) || "配置名称、API 地址、API Key、模型名称均不能为空。", true);
      return;
    }

    const idx = profiles.findIndex((p) => p.id === activeLlmId);
    if (idx === -1) {
      profiles.push({
        id: activeLlmId,
        name,
        apiUrl,
        apiKey,
        model,
      });
    } else {
      profiles[idx] = {
        ...profiles[idx],
        name,
        apiUrl,
        apiKey,
        model,
      };
    }

    await chrome.storage.sync.set({
      llmProfiles: profiles,
      activeLlmId,
    });

    renderProfileSelect();
  
    setStatus(t("status_saved", lang) || "保存成功。你可以在聊天窗口中切换使用。");
    const saveSuccessTimeout = setTimeout(() => setStatus(""), 2000);
  } catch (err) {
    console.error(err);
    setStatus((t("status_save_error", lang) || "保存失败：") + (err?.message || String(err)), true);
  }
});

restore();
