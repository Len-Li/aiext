export const translations = {
  "zh-CN": {
    // 页面标题
    "popupTitle": "LLM 网页解读助手",
    "appTitle": "",
    "settingsTitle": "",
    
    // 设置页面
    "section_llm_config": "选择或管理 LLM 配置",
    "btn_add_profile": "新增配置",
    "btn_delete_profile": "删除当前",
    "label_profile_name": "配置名称",
    "placeholder_profile_name": "例如：DeepSeek 正式环境 / OpenAI 个人账号",
    "label_api_url": "API 地址（URL）",
    "placeholder_api_url": "例如：https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "API Key",
    "placeholder_api_key": "你的 LLM API Key",
    "label_model": "模型名称",
    "placeholder_model": "例如：gpt-4.1, qwen-max 等",
    "btn_save": "保存当前配置",
    "tip_title": "说明",
    "tip_content_1": "当前实现默认按照「OpenAI Chat Completions」兼容接口发送请求：",
    "tip_content_2": "如果你的接口格式不同，可以根据需要修改 background.js 中的 callLLM 函数。",
    "label_language": "语言设置 / Language",
    
    // JS 动态文本 - 配置管理
    "name_no_profile": "暂无配置，请先新增",
    "name_default_profile": "我的第一个配置",
    "name_new_profile": "新配置",
    "name_unnamed_profile": "未命名配置",
    "status_added_profile": "已新增一个空白配置。",
    "status_delete_fail": "至少需要保留一个配置，无法删除。",
    "status_deleted_profile": "已删除当前配置。",
    "status_saving": "正在保存…",
    "status_no_profile_to_save": "当前没有可保存的配置，请先新增。",
    "status_save_fail_empty": "配置名称、API 地址、API Key、模型名称均不能为空。",
    "status_saved": "保存成功。你可以在聊天窗口中切换使用。",
    "status_save_error": "保存失败：",

    // Popup 页面
    "btn_open_options": "设置",
    "btn_analyze": "解读当前网页",
    "placeholder_result": "解读结果将在这里显示",
    "status_analyzing": "正在解读中...",
    "status_error": "出错了: ",
    "status_reading_page": "正在读取网页内容并请求 LLM，请稍候…",
    "status_config_missing": "请先在设置中配置 API 地址、API Key 和模型。",
    "status_no_tab": "未找到当前标签页。",
    "status_analyze_done": "解读完成。",
    "status_no_result": "（LLM 无返回结果）",
    "status_analyze_fail": "解读失败，请稍后重试。",
    "status_call_fail": "调用失败：",
    
    // Overlay 悬浮窗
    "overlay_title": "",
    "overlay_analyze_btn": "解读本页",
    "overlay_settings_btn": "设置",
    "overlay_send_btn": "发送",
    "overlay_input_placeholder": "继续就当前网页提问，回车发送…",
    "overlay_decrease_font": "减小文字大小",
    "overlay_increase_font": "增大文字大小",
    "overlay_prev_qa": "上一个问答",
    "overlay_next_qa": "下一个问答",
    "overlay_expand": "展开",
    "overlay_collapse": "收起",
    "overlay_font_size": "文字大小",
    "overlay_reading_page": "正在读取页面内容…",
    "overlay_read_fail": "读取页面内容失败：",
    "overlay_no_config": "尚未配置任何 LLM 接口，请先前往设置里添加。",
    "overlay_no_api_config": "尚未配置 API 地址 / API Key / 模型。",
    "overlay_load_config_fail": "加载配置失败：",
    "overlay_switched_profile": "已切换到配置：",
    "overlay_profile_not_found": "选择的配置不存在",
    "overlay_analyzing": "正在解读当前网页，请稍候…",
    "overlay_analyze_done": "解读完成，可以继续提问。",
    "overlay_thinking": "正在思考，请稍候…",
    "overlay_replied": "已回复，你可以继续提问。",
    "overlay_call_fail": "调用失败：",
    "overlay_ask_analyze": "请帮我解读当前网页内容。",
    
    // Background Prompts
    "prompt_system": "你是一个帮助用户用简体中文解释网页内容的助手，需要用通俗、分点的方式总结重点。",
    "prompt_user_intro": "请你阅读下面网页内容，并完成：",
    "prompt_user_1": "1）用条列的方式概括核心观点与结构",
    "prompt_user_2": "2）指出重要细节与结论",
    "prompt_user_3": "3）最后给一个三行以内的简洁总结",
    "prompt_page_title": "网页标题：",
    "prompt_page_link": "网页链接：",
    "prompt_content_start": "正文内容如下：",
    "prompt_no_content": "（无正文内容）",
    "prompt_no_title": "（无标题）",
    "prompt_no_link": "（无链接）"
  },
  "en-US": {
    // Page titles
    "popupTitle": "LLM Web Reader",
    "appTitle": "",
    "settingsTitle": "",
    
    // Settings page
    "section_llm_config": "Manage LLM Profiles",
    "btn_add_profile": "New Profile",
    "btn_delete_profile": "Delete Current",
    "label_profile_name": "Profile Name",
    "placeholder_profile_name": "e.g., DeepSeek Prod / OpenAI Personal",
    "label_api_url": "API URL",
    "placeholder_api_url": "e.g., https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "API Key",
    "placeholder_api_key": "Your LLM API Key",
    "label_model": "Model Name",
    "placeholder_model": "e.g., gpt-4, claude-3-opus",
    "btn_save": "Save Configuration",
    "tip_title": "Instructions",
    "tip_content_1": "Default implementation uses 'OpenAI Chat Completions' compatible format:",
    "tip_content_2": "If your API format differs, modify the callLLM function in background.js.",
    "label_language": "Language / 语言设置",

    // JS dynamic texts - Profile management
    "name_no_profile": "No profile, please add one",
    "name_default_profile": "My First Profile",
    "name_new_profile": "New Profile",
    "name_unnamed_profile": "Unnamed Profile",
    "status_added_profile": "Added a new empty profile.",
    "status_delete_fail": "Cannot delete the last profile.",
    "status_deleted_profile": "Current profile deleted.",
    "status_saving": "Saving...",
    "status_no_profile_to_save": "No profile to save, please add one first.",
    "status_save_fail_empty": "Profile Name, API URL, API Key, and Model cannot be empty.",
    "status_saved": "Saved successfully. You can switch profiles in the chat window.",
    "status_save_error": "Save failed: ",

    // Popup page
    "btn_open_options": "Settings",
    "btn_analyze": "Summarize Page",
    "placeholder_result": "Summary will appear here...",
    "status_analyzing": "Analyzing...",
    "status_error": "Error: ",
    "status_reading_page": "Reading page content and calling LLM, please wait...",
    "status_config_missing": "Please configure API URL, API Key and Model in settings first.",
    "status_no_tab": "Current tab not found.",
    "status_analyze_done": "Analysis complete.",
    "status_no_result": "(No result from LLM)",
    "status_analyze_fail": "Analysis failed, please try again later.",
    "status_call_fail": "Call failed: ",

    // Overlay floating window
    "overlay_title": "",
    "overlay_analyze_btn": "Analyze Page",
    "overlay_settings_btn": "Settings",
    "overlay_send_btn": "Send",
    "overlay_input_placeholder": "Ask about this page, press Enter to send...",
    "overlay_decrease_font": "Decrease font size",
    "overlay_increase_font": "Increase font size",
    "overlay_prev_qa": "Previous Q&A",
    "overlay_next_qa": "Next Q&A",
    "overlay_expand": "Expand",
    "overlay_collapse": "Collapse",
    "overlay_font_size": "Font size",
    "overlay_reading_page": "Reading page content...",
    "overlay_read_fail": "Failed to read page content: ",
    "overlay_no_config": "No LLM profile configured. Please add one in settings.",
    "overlay_no_api_config": "API URL / API Key / Model not configured.",
    "overlay_load_config_fail": "Failed to load config: ",
    "overlay_switched_profile": "Switched to profile: ",
    "overlay_profile_not_found": "Selected profile not found",
    "overlay_analyzing": "Analyzing current page, please wait...",
    "overlay_analyze_done": "Analysis complete. You can continue asking questions.",
    "overlay_thinking": "Thinking, please wait...",
    "overlay_replied": "Replied. You can continue asking questions.",
    "overlay_call_fail": "Call failed: ",
    "overlay_ask_analyze": "Please help me understand this page.",

    // Background Prompts
    "prompt_system": "You are a helpful assistant that summarizes web content in English. Please be concise and use bullet points.",
    "prompt_user_intro": "Please read the following web content and:",
    "prompt_user_1": "1) Summarize key points and structure using bullet points",
    "prompt_user_2": "2) Highlight important details and conclusions",
    "prompt_user_3": "3) Provide a concise summary in under 3 lines",
    "prompt_page_title": "Page Title: ",
    "prompt_page_link": "Page Link: ",
    "prompt_content_start": "Content:",
    "prompt_no_content": "(No content)",
    "prompt_no_title": "(No title)",
    "prompt_no_link": "(No link)"
  }
};

export const DEFAULT_LANG = "zh-CN";

/**
 * 获取当前语言设置
 * @returns {Promise<string>}
 */
export async function getLanguage() {
  const data = await chrome.storage.sync.get("language");
  return data.language || DEFAULT_LANG;
}

/**
 * 设置语言
 * @param {string} lang 
 */
export async function setLanguage(lang) {
  await chrome.storage.sync.set({ language: lang });
}

/**
 * 获取指定 Key 的翻译
 * @param {string} key 
 * @param {string} lang 
 * @returns {string}
 */
export function t(key, lang = DEFAULT_LANG) {
  return translations[lang]?.[key] || translations[DEFAULT_LANG]?.[key] || key;
}

/**
 * 自动翻译页面上带有 data-i18n 属性的元素
 */
export async function applyTranslations() {
  const lang = await getLanguage();
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key, lang);
    
    // 如果是 input/textarea，通常是设置 placeholder
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', t('placeholder_' + key.replace('label_', ''), lang) || text);
      }
    } else {
      el.textContent = text;
    }
    
    // 特殊处理 placeholder 属性
    const placeholderKey = el.getAttribute('data-i18n-placeholder');
    if (placeholderKey) {
      el.setAttribute('placeholder', t(placeholderKey, lang));
    }
  });

  // 更新 html lang 属性
  document.documentElement.lang = lang;
}

