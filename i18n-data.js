// i18n-data.js - 供 content script 使用的翻译数据（非模块化版本）
// 这个文件会在 overlay.js 之前加载

window.__llm_reader_translations__ = {
  "zh-CN": {
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
    
    // Settings panel
    "settings_title": "设置",
    "settings_language": "语言设置 Language Setting",
    "settings_llm_config": "LLM 配置",
    "settings_profile_name": "配置名称",
    "settings_api_url": "API 地址",
    "settings_api_key": "API Key",
    "settings_model": "模型名称",
    "settings_add_profile": "新增",
    "settings_delete_profile": "删除",
    "settings_save": "保存",
    "settings_close": "关闭",
    "settings_saved": "保存成功",
    "settings_save_fail": "保存失败",
    "settings_deleted": "已删除配置",
    "settings_added": "已新增配置",
    "settings_at_least_one": "至少需要保留一个配置",
    "settings_fill_all": "请填写所有必填项",
    "settings_placeholder_name": "例如：DeepSeek 正式环境",
    "settings_placeholder_url": "例如：https://api.openai.com/v1",
    "settings_placeholder_key": "你的 API Key",
    "settings_placeholder_model": "例如：gpt-4, qwen-max",
    
    // Prompts
    "prompt_system": "你是一个帮助用户用简体中文解释网页内容的助手，需要用通俗、分点的方式总结重点。",
    "prompt_user_intro": "请你阅读下面网页内容，并完成：\n1）用条列的方式概括核心观点与结构\n2）指出重要细节与结论\n3）最后给一个三行以内的简洁总结",
    "prompt_page_title": "网页标题：",
    "prompt_page_link": "网页链接：",
    "prompt_content_start": "正文内容如下：",
    "prompt_no_content": "（无正文内容）",
    "prompt_no_title": "（无标题）",
    "prompt_no_link": "（无链接）"
  },
  "en-US": {
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
    
    // Settings panel
    "settings_title": "Settings",
    "settings_language": "Language",
    "settings_llm_config": "LLM Configuration",
    "settings_profile_name": "Profile Name",
    "settings_api_url": "API URL",
    "settings_api_key": "API Key",
    "settings_model": "Model Name",
    "settings_add_profile": "Add",
    "settings_delete_profile": "Delete",
    "settings_save": "Save",
    "settings_close": "Close",
    "settings_saved": "Saved successfully",
    "settings_save_fail": "Save failed",
    "settings_deleted": "Profile deleted",
    "settings_added": "Profile added",
    "settings_at_least_one": "At least one profile is required",
    "settings_fill_all": "Please fill in all required fields",
    "settings_placeholder_name": "e.g., DeepSeek Production",
    "settings_placeholder_url": "e.g., https://api.openai.com/v1",
    "settings_placeholder_key": "Your API Key",
    "settings_placeholder_model": "e.g., gpt-4, qwen-max",
    
    // Prompts
    "prompt_system": "You are a helpful assistant that summarizes web content in English. Please be concise and use bullet points.",
    "prompt_user_intro": "Please read the following web content and:\n1) Summarize key points and structure using bullet points\n2) Highlight important details and conclusions\n3) Provide a concise summary in under 3 lines",
    "prompt_page_title": "Page Title: ",
    "prompt_page_link": "Page Link: ",
    "prompt_content_start": "Content:",
    "prompt_no_content": "(No content)",
    "prompt_no_title": "(No title)",
    "prompt_no_link": "(No link)"
  }
};

window.__llm_reader_default_lang__ = "zh-CN";

/**
 * 获取翻译文本
 * @param {string} key 
 * @param {string} lang 
 * @returns {string}
 */
window.__llm_reader_t__ = function(key, lang) {
  const defaultLang = window.__llm_reader_default_lang__;
  const translations = window.__llm_reader_translations__;
  return translations[lang]?.[key] || translations[defaultLang]?.[key] || key;
};

