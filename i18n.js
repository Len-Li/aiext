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
  },
  "ja-JP": {
    // ページタイトル
    "popupTitle": "LLM ウェブ読み取りアシスタント",
    "appTitle": "",
    "settingsTitle": "",
    
    // 設定ページ
    "section_llm_config": "LLM設定の選択・管理",
    "btn_add_profile": "新規設定",
    "btn_delete_profile": "現在の設定を削除",
    "label_profile_name": "設定名",
    "placeholder_profile_name": "例：DeepSeek 本番環境 / OpenAI 個人アカウント",
    "label_api_url": "API URL",
    "placeholder_api_url": "例：https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "API Key",
    "placeholder_api_key": "あなたの LLM API Key",
    "label_model": "モデル名",
    "placeholder_model": "例：gpt-4.1, qwen-max など",
    "btn_save": "現在の設定を保存",
    "tip_title": "説明",
    "tip_content_1": "現在の実装はデフォルトで「OpenAI Chat Completions」互換インターフェースを使用してリクエストを送信します：",
    "tip_content_2": "インターフェース形式が異なる場合は、background.js の callLLM 関数を必要に応じて変更してください。",
    "label_language": "言語設定 / Language / 语言设置",
    
    // JS動的テキスト - 設定管理
    "name_no_profile": "設定がありません。新規追加してください。",
    "name_default_profile": "最初の設定",
    "name_new_profile": "新規設定",
    "name_unnamed_profile": "無名の設定",
    "status_added_profile": "新しい空の設定を追加しました。",
    "status_delete_fail": "少なくとも1つの設定を残す必要があります。削除できません。",
    "status_deleted_profile": "現在の設定を削除しました。",
    "status_saving": "保存中…",
    "status_no_profile_to_save": "保存できる設定がありません。新規追加してください。",
    "status_save_fail_empty": "設定名、API URL、API Key、モデル名はすべて必須です。",
    "status_saved": "保存しました。チャットウィンドウで切り替えて使用できます。",
    "status_save_error": "保存失敗：",

    // ポップアップページ
    "btn_open_options": "設定",
    "btn_analyze": "現在のページを解説",
    "placeholder_result": "解説結果がここに表示されます",
    "status_analyzing": "解説中...",
    "status_error": "エラー: ",
    "status_reading_page": "ページ内容を読み取りLLMにリクエスト中、お待ちください…",
    "status_config_missing": "まず設定でAPI URL、API Key、モデルを設定してください。",
    "status_no_tab": "現在のタブが見つかりません。",
    "status_analyze_done": "解説完了。",
    "status_no_result": "（LLMからの結果なし）",
    "status_analyze_fail": "解説失敗。後でもう一度お試しください。",
    "status_call_fail": "呼び出し失敗：",
    
    // オーバーレイフローティングウィンドウ
    "overlay_title": "",
    "overlay_analyze_btn": "このページを解説",
    "overlay_settings_btn": "設定",
    "overlay_send_btn": "送信",
    "overlay_input_placeholder": "現在のページについて質問、Enterで送信…",
    "overlay_decrease_font": "文字サイズを小さく",
    "overlay_increase_font": "文字サイズを大きく",
    "overlay_prev_qa": "前のQ&A",
    "overlay_next_qa": "次のQ&A",
    "overlay_expand": "展開",
    "overlay_collapse": "折りたたみ",
    "overlay_font_size": "文字サイズ",
    "overlay_reading_page": "ページ内容を読み取り中…",
    "overlay_read_fail": "ページ内容の読み取り失敗：",
    "overlay_no_config": "LLMインターフェースが設定されていません。まず設定で追加してください。",
    "overlay_no_api_config": "API URL / API Key / モデルが設定されていません。",
    "overlay_load_config_fail": "設定の読み込み失敗：",
    "overlay_switched_profile": "設定に切り替え：",
    "overlay_profile_not_found": "選択された設定が見つかりません",
    "overlay_analyzing": "現在のページを解説中、お待ちください…",
    "overlay_analyze_done": "解説完了。質問を続けられます。",
    "overlay_thinking": "思考中、お待ちください…",
    "overlay_replied": "返信しました。質問を続けられます。",
    "overlay_call_fail": "呼び出し失敗：",
    "overlay_ask_analyze": "現在のページ内容を解説してください。",
    
    // バックグラウンドプロンプト
    "prompt_system": "あなたは日本語でウェブコンテンツを説明するアシスタントです。分かりやすく、箇条書きで要点をまとめてください。",
    "prompt_user_intro": "以下のウェブコンテンツを読んで、以下を実行してください：",
    "prompt_user_1": "1）箇条書きで核心的なポイントと構造を概括",
    "prompt_user_2": "2）重要な詳細と結論を指摘",
    "prompt_user_3": "3）最後に3行以内の簡潔な要約を提供",
    "prompt_page_title": "ページタイトル：",
    "prompt_page_link": "ページリンク：",
    "prompt_content_start": "本文内容：",
    "prompt_no_content": "（本文なし）",
    "prompt_no_title": "（タイトルなし）",
    "prompt_no_link": "（リンクなし）"
  },
  "de-DE": {
    // Page titles
    "popupTitle": "LLM Web-Leser",
    "appTitle": "",
    "settingsTitle": "",
    
    // Settings page
    "section_llm_config": "LLM-Profile verwalten",
    "btn_add_profile": "Neues Profil",
    "btn_delete_profile": "Aktuelles löschen",
    "label_profile_name": "Profilname",
    "placeholder_profile_name": "z.B., DeepSeek Produktion / OpenAI Persönlich",
    "label_api_url": "API-URL",
    "placeholder_api_url": "z.B., https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "API-Schlüssel",
    "placeholder_api_key": "Ihr LLM API-Schlüssel",
    "label_model": "Modellname",
    "placeholder_model": "z.B., gpt-4, claude-3-opus",
    "btn_save": "Konfiguration speichern",
    "tip_title": "Anleitung",
    "tip_content_1": "Standardimplementierung verwendet das 'OpenAI Chat Completions'-kompatible Format:",
    "tip_content_2": "Wenn Ihr API-Format abweicht, passen Sie die callLLM-Funktion in background.js an.",
    "label_language": "Sprache",

    // JS dynamic texts - Profile management
    "name_no_profile": "Kein Profil, bitte hinzufügen",
    "name_default_profile": "Mein erstes Profil",
    "name_new_profile": "Neues Profil",
    "name_unnamed_profile": "Unbenanntes Profil",
    "status_added_profile": "Ein neues leeres Profil hinzugefügt.",
    "status_delete_fail": "Das letzte Profil kann nicht gelöscht werden.",
    "status_deleted_profile": "Aktuelles Profil gelöscht.",
    "status_saving": "Speichern...",
    "status_no_profile_to_save": "Kein Profil zum Speichern, bitte zuerst hinzufügen.",
    "status_save_fail_empty": "Profilname, API-URL, API-Schlüssel und Modell dürfen nicht leer sein.",
    "status_saved": "Erfolgreich gespeichert. Sie können Profile im Chat-Fenster wechseln.",
    "status_save_error": "Speichern fehlgeschlagen: ",

    // Popup page
    "btn_open_options": "Einstellungen",
    "btn_analyze": "Seite zusammenfassen",
    "placeholder_result": "Zusammenfassung erscheint hier...",
    "status_analyzing": "Analysiere...",
    "status_error": "Fehler: ",
    "status_reading_page": "Lese Seiteninhalt und rufe LLM auf, bitte warten...",
    "status_config_missing": "Bitte konfigurieren Sie zuerst API-URL, API-Schlüssel und Modell in den Einstellungen.",
    "status_no_tab": "Aktueller Tab nicht gefunden.",
    "status_analyze_done": "Analyse abgeschlossen.",
    "status_no_result": "(Kein Ergebnis vom LLM)",
    "status_analyze_fail": "Analyse fehlgeschlagen, bitte später erneut versuchen.",
    "status_call_fail": "Aufruf fehlgeschlagen: ",

    // Overlay floating window
    "overlay_title": "",
    "overlay_analyze_btn": "Seite analysieren",
    "overlay_settings_btn": "Einstellungen",
    "overlay_send_btn": "Senden",
    "overlay_input_placeholder": "Frage zu dieser Seite, Enter zum Senden...",
    "overlay_decrease_font": "Schriftgröße verkleinern",
    "overlay_increase_font": "Schriftgröße vergrößern",
    "overlay_prev_qa": "Vorherige Q&A",
    "overlay_next_qa": "Nächste Q&A",
    "overlay_expand": "Erweitern",
    "overlay_collapse": "Zusammenklappen",
    "overlay_font_size": "Schriftgröße",
    "overlay_reading_page": "Lese Seiteninhalt...",
    "overlay_read_fail": "Fehler beim Lesen des Seiteninhalts: ",
    "overlay_no_config": "Kein LLM-Profil konfiguriert. Bitte in den Einstellungen hinzufügen.",
    "overlay_no_api_config": "API-URL / API-Schlüssel / Modell nicht konfiguriert.",
    "overlay_load_config_fail": "Fehler beim Laden der Konfiguration: ",
    "overlay_switched_profile": "Zu Profil gewechselt: ",
    "overlay_profile_not_found": "Ausgewähltes Profil nicht gefunden",
    "overlay_analyzing": "Analysiere aktuelle Seite, bitte warten...",
    "overlay_analyze_done": "Analyse abgeschlossen. Sie können weiter Fragen stellen.",
    "overlay_thinking": "Denke nach, bitte warten...",
    "overlay_replied": "Beantwortet. Sie können weiter Fragen stellen.",
    "overlay_call_fail": "Aufruf fehlgeschlagen: ",
    "overlay_ask_analyze": "Bitte helfen Sie mir, diese Seite zu verstehen.",

    // Background Prompts
    "prompt_system": "Sie sind ein hilfreicher Assistent, der Webinhalte auf Deutsch zusammenfasst. Bitte fassen Sie prägnant und mit Aufzählungspunkten zusammen.",
    "prompt_user_intro": "Bitte lesen Sie den folgenden Webinhalt und:",
    "prompt_user_1": "1) Fassen Sie die Kernpunkte und Struktur mit Aufzählungspunkten zusammen",
    "prompt_user_2": "2) Heben Sie wichtige Details und Schlussfolgerungen hervor",
    "prompt_user_3": "3) Geben Sie eine prägnante Zusammenfassung in maximal 3 Zeilen",
    "prompt_page_title": "Seitentitel: ",
    "prompt_page_link": "Seitenlink: ",
    "prompt_content_start": "Inhalt:",
    "prompt_no_content": "(Kein Inhalt)",
    "prompt_no_title": "(Kein Titel)",
    "prompt_no_link": "(Kein Link)"
  },
  "fr-FR": {
    // Page titles
    "popupTitle": "Assistant de lecture Web LLM",
    "appTitle": "",
    "settingsTitle": "",
    
    // Settings page
    "section_llm_config": "Gérer les profils LLM",
    "btn_add_profile": "Nouveau profil",
    "btn_delete_profile": "Supprimer le courant",
    "label_profile_name": "Nom du profil",
    "placeholder_profile_name": "ex., DeepSeek Production / OpenAI Personnel",
    "label_api_url": "URL de l'API",
    "placeholder_api_url": "ex., https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "Clé API",
    "placeholder_api_key": "Votre clé API LLM",
    "label_model": "Nom du modèle",
    "placeholder_model": "ex., gpt-4, claude-3-opus",
    "btn_save": "Enregistrer la configuration",
    "tip_title": "Instructions",
    "tip_content_1": "L'implémentation par défaut utilise le format compatible 'OpenAI Chat Completions' :",
    "tip_content_2": "Si votre format d'API diffère, modifiez la fonction callLLM dans background.js.",
    "label_language": "Langue",

    // JS dynamic texts - Profile management
    "name_no_profile": "Aucun profil, veuillez en ajouter un",
    "name_default_profile": "Mon premier profil",
    "name_new_profile": "Nouveau profil",
    "name_unnamed_profile": "Profil sans nom",
    "status_added_profile": "Un nouveau profil vide a été ajouté.",
    "status_delete_fail": "Impossible de supprimer le dernier profil.",
    "status_deleted_profile": "Profil courant supprimé.",
    "status_saving": "Enregistrement...",
    "status_no_profile_to_save": "Aucun profil à enregistrer, veuillez d'abord en ajouter un.",
    "status_save_fail_empty": "Le nom du profil, l'URL de l'API, la clé API et le modèle ne peuvent pas être vides.",
    "status_saved": "Enregistrement réussi. Vous pouvez changer de profil dans la fenêtre de chat.",
    "status_save_error": "Échec de l'enregistrement : ",

    // Popup page
    "btn_open_options": "Paramètres",
    "btn_analyze": "Résumer la page",
    "placeholder_result": "Le résumé apparaîtra ici...",
    "status_analyzing": "Analyse en cours...",
    "status_error": "Erreur : ",
    "status_reading_page": "Lecture du contenu de la page et appel du LLM, veuillez patienter...",
    "status_config_missing": "Veuillez d'abord configurer l'URL de l'API, la clé API et le modèle dans les paramètres.",
    "status_no_tab": "Onglet courant introuvable.",
    "status_analyze_done": "Analyse terminée.",
    "status_no_result": "(Aucun résultat du LLM)",
    "status_analyze_fail": "Échec de l'analyse, veuillez réessayer plus tard.",
    "status_call_fail": "Échec de l'appel : ",

    // Overlay floating window
    "overlay_title": "",
    "overlay_analyze_btn": "Analyser la page",
    "overlay_settings_btn": "Paramètres",
    "overlay_send_btn": "Envoyer",
    "overlay_input_placeholder": "Posez une question sur cette page, appuyez sur Entrée pour envoyer...",
    "overlay_decrease_font": "Réduire la taille de police",
    "overlay_increase_font": "Augmenter la taille de police",
    "overlay_prev_qa": "Q&A précédent",
    "overlay_next_qa": "Q&A suivant",
    "overlay_expand": "Développer",
    "overlay_collapse": "Réduire",
    "overlay_font_size": "Taille de police",
    "overlay_reading_page": "Lecture du contenu de la page...",
    "overlay_read_fail": "Échec de la lecture du contenu de la page : ",
    "overlay_no_config": "Aucun profil LLM configuré. Veuillez en ajouter un dans les paramètres.",
    "overlay_no_api_config": "URL API / Clé API / Modèle non configuré.",
    "overlay_load_config_fail": "Échec du chargement de la configuration : ",
    "overlay_switched_profile": "Passé au profil : ",
    "overlay_profile_not_found": "Profil sélectionné introuvable",
    "overlay_analyzing": "Analyse de la page en cours, veuillez patienter...",
    "overlay_analyze_done": "Analyse terminée. Vous pouvez continuer à poser des questions.",
    "overlay_thinking": "Réflexion en cours, veuillez patienter...",
    "overlay_replied": "Répondu. Vous pouvez continuer à poser des questions.",
    "overlay_call_fail": "Échec de l'appel : ",
    "overlay_ask_analyze": "Veuillez m'aider à comprendre cette page.",

    // Background Prompts
    "prompt_system": "Vous êtes un assistant utile qui résume le contenu Web en français. Veuillez être concis et utiliser des puces.",
    "prompt_user_intro": "Veuillez lire le contenu Web suivant et :",
    "prompt_user_1": "1) Résumer les points clés et la structure à l'aide de puces",
    "prompt_user_2": "2) Mettre en évidence les détails et conclusions importants",
    "prompt_user_3": "3) Fournir un résumé concis en moins de 3 lignes",
    "prompt_page_title": "Titre de la page : ",
    "prompt_page_link": "Lien de la page : ",
    "prompt_content_start": "Contenu :",
    "prompt_no_content": "(Aucun contenu)",
    "prompt_no_title": "(Aucun titre)",
    "prompt_no_link": "(Aucun lien)"
  },
  "es-ES": {
    // Títulos de página
    "popupTitle": "Asistente de Lectura Web LLM",
    "appTitle": "",
    "settingsTitle": "",
    
    // Página de configuración
    "section_llm_config": "Gestionar Perfiles LLM",
    "btn_add_profile": "Nuevo Perfil",
    "btn_delete_profile": "Eliminar Actual",
    "label_profile_name": "Nombre del Perfil",
    "placeholder_profile_name": "ej., DeepSeek Producción / OpenAI Personal",
    "label_api_url": "URL de API",
    "placeholder_api_url": "ej., https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "Clave API",
    "placeholder_api_key": "Tu Clave API LLM",
    "label_model": "Nombre del Modelo",
    "placeholder_model": "ej., gpt-4, claude-3-opus",
    "btn_save": "Guardar Configuración",
    "tip_title": "Instrucciones",
    "tip_content_1": "La implementación predeterminada usa el formato compatible 'OpenAI Chat Completions':",
    "tip_content_2": "Si tu formato de API es diferente, modifica la función callLLM en background.js.",
    "label_language": "Idioma / Language",

    // Textos dinámicos JS - Gestión de perfiles
    "name_no_profile": "Sin perfil, por favor añade uno",
    "name_default_profile": "Mi Primer Perfil",
    "name_new_profile": "Nuevo Perfil",
    "name_unnamed_profile": "Perfil Sin Nombre",
    "status_added_profile": "Se añadió un nuevo perfil vacío.",
    "status_delete_fail": "No se puede eliminar el último perfil.",
    "status_deleted_profile": "Perfil actual eliminado.",
    "status_saving": "Guardando...",
    "status_no_profile_to_save": "Sin perfil para guardar, por favor añade uno primero.",
    "status_save_fail_empty": "El Nombre del Perfil, URL de API, Clave API y Modelo no pueden estar vacíos.",
    "status_saved": "Guardado exitosamente. Puedes cambiar perfiles en la ventana de chat.",
    "status_save_error": "Error al guardar: ",

    // Página emergente
    "btn_open_options": "Configuración",
    "btn_analyze": "Resumir Página",
    "placeholder_result": "El resumen aparecerá aquí...",
    "status_analyzing": "Analizando...",
    "status_error": "Error: ",
    "status_reading_page": "Leyendo contenido de la página y llamando al LLM, por favor espera...",
    "status_config_missing": "Por favor configura primero la URL de API, Clave API y Modelo en la configuración.",
    "status_no_tab": "Pestaña actual no encontrada.",
    "status_analyze_done": "Análisis completo.",
    "status_no_result": "(Sin resultado del LLM)",
    "status_analyze_fail": "Análisis fallido, por favor intenta más tarde.",
    "status_call_fail": "Llamada fallida: ",

    // Ventana flotante superpuesta
    "overlay_title": "",
    "overlay_analyze_btn": "Analizar Página",
    "overlay_settings_btn": "Configuración",
    "overlay_send_btn": "Enviar",
    "overlay_input_placeholder": "Pregunta sobre esta página, presiona Enter para enviar...",
    "overlay_decrease_font": "Disminuir tamaño de fuente",
    "overlay_increase_font": "Aumentar tamaño de fuente",
    "overlay_prev_qa": "P&A Anterior",
    "overlay_next_qa": "P&A Siguiente",
    "overlay_expand": "Expandir",
    "overlay_collapse": "Contraer",
    "overlay_font_size": "Tamaño de fuente",
    "overlay_reading_page": "Leyendo contenido de la página...",
    "overlay_read_fail": "Error al leer contenido de la página: ",
    "overlay_no_config": "Sin perfil LLM configurado. Por favor añade uno en la configuración.",
    "overlay_no_api_config": "URL de API / Clave API / Modelo no configurado.",
    "overlay_load_config_fail": "Error al cargar configuración: ",
    "overlay_switched_profile": "Cambiado al perfil: ",
    "overlay_profile_not_found": "Perfil seleccionado no encontrado",
    "overlay_analyzing": "Analizando página actual, por favor espera...",
    "overlay_analyze_done": "Análisis completo. Puedes continuar haciendo preguntas.",
    "overlay_thinking": "Pensando, por favor espera...",
    "overlay_replied": "Respondido. Puedes continuar haciendo preguntas.",
    "overlay_call_fail": "Llamada fallida: ",
    "overlay_ask_analyze": "Por favor ayúdame a entender esta página.",

    // Prompts de fondo
    "prompt_system": "Eres un asistente útil que resume contenido web en español. Por favor sé conciso y usa viñetas.",
    "prompt_user_intro": "Por favor lee el siguiente contenido web y:",
    "prompt_user_1": "1) Resume los puntos clave y estructura usando viñetas",
    "prompt_user_2": "2) Destalla detalles importantes y conclusiones",
    "prompt_user_3": "3) Proporciona un resumen conciso en menos de 3 líneas",
    "prompt_page_title": "Título de la Página: ",
    "prompt_page_link": "Enlace de la Página: ",
    "prompt_content_start": "Contenido:",
    "prompt_no_content": "(Sin contenido)",
    "prompt_no_title": "(Sin título)",
    "prompt_no_link": "(Sin enlace)"
  },
  "ru-RU": {
    // Page titles
    "popupTitle": "LLM Веб-читатель",
    "appTitle": "",
    "settingsTitle": "",
    
    // Settings page
    "section_llm_config": "Управление профилями LLM",
    "btn_add_profile": "Новый профиль",
    "btn_delete_profile": "Удалить текущий",
    "label_profile_name": "Имя профиля",
    "placeholder_profile_name": "например, DeepSeek Prod / OpenAI Personal",
    "label_api_url": "URL API",
    "placeholder_api_url": "например, https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "Ключ API",
    "placeholder_api_key": "Ваш ключ API LLM",
    "label_model": "Имя модели",
    "placeholder_model": "например, gpt-4, claude-3-opus",
    "btn_save": "Сохранить конфигурацию",
    "tip_title": "Инструкции",
    "tip_content_1": "Реализация по умолчанию использует формат, совместимый с 'OpenAI Chat Completions':",
    "tip_content_2": "Если ваш формат API отличается, измените функцию callLLM в background.js.",
    "label_language": "Язык",
    
    // JS dynamic texts - Profile management
    "name_no_profile": "Нет профиля, пожалуйста, добавьте",
    "name_default_profile": "Мой первый профиль",
    "name_new_profile": "Новый профиль",
    "name_unnamed_profile": "Безымянный профиль",
    "status_added_profile": "Добавлен новый пустой профиль.",
    "status_delete_fail": "Нельзя удалить последний профиль.",
    "status_deleted_profile": "Текущий профиль удален.",
    "status_saving": "Сохранение...",
    "status_no_profile_to_save": "Нет профиля для сохранения, сначала добавьте.",
    "status_save_fail_empty": "Имя профиля, URL API, Ключ API и Модель не могут быть пустыми.",
    "status_saved": "Успешно сохранено. Вы можете переключать профили в окне чата.",
    "status_save_error": "Ошибка сохранения: ",
    
    // Popup page
    "btn_open_options": "Настройки",
    "btn_analyze": "Анализировать страницу",
    "placeholder_result": "Результат анализа появится здесь...",
    "status_analyzing": "Анализ...",
    "status_error": "Ошибка: ",
    "status_reading_page": "Чтение содержимого страницы и вызов LLM, пожалуйста, подождите...",
    "status_config_missing": "Сначала настройте URL API, Ключ API и Модель в настройках.",
    "status_no_tab": "Текущая вкладка не найдена.",
    "status_analyze_done": "Анализ завершен.",
    "status_no_result": "(Нет результата от LLM)",
    "status_analyze_fail": "Анализ не удался, попробуйте позже.",
    "status_call_fail": "Ошибка вызова: ",
    
    // Overlay floating window
    "overlay_title": "",
    "overlay_analyze_btn": "Анализировать страницу",
    "overlay_settings_btn": "Настройки",
    "overlay_send_btn": "Отправить",
    "overlay_input_placeholder": "Задайте вопрос об этой странице, нажмите Enter для отправки...",
    "overlay_decrease_font": "Уменьшить размер шрифта",
    "overlay_increase_font": "Увеличить размер шрифта",
    "overlay_prev_qa": "Предыдущий Q&A",
    "overlay_next_qa": "Следующий Q&A",
    "overlay_expand": "Развернуть",
    "overlay_collapse": "Свернуть",
    "overlay_font_size": "Размер шрифта",
    "overlay_reading_page": "Чтение содержимого страницы...",
    "overlay_read_fail": "Ошибка чтения содержимого страницы: ",
    "overlay_no_config": "Профиль LLM не настроен. Добавьте его в настройках.",
    "overlay_no_api_config": "URL API / Ключ API / Модель не настроены.",
    "overlay_load_config_fail": "Ошибка загрузки конфигурации: ",
    "overlay_switched_profile": "Переключено на профиль: ",
    "overlay_profile_not_found": "Выбранный профиль не найден",
    "overlay_analyzing": "Анализ текущей страницы, пожалуйста, подождите...",
    "overlay_analyze_done": "Анализ завершен. Вы можете продолжать задавать вопросы.",
    "overlay_thinking": "Размышляю, пожалуйста, подождите...",
    "overlay_replied": "Ответ отправлен. Вы можете продолжать задавать вопросы.",
    "overlay_call_fail": "Ошибка вызова: ",
    "overlay_ask_analyze": "Помогите мне понять эту страницу.",
    
    // Background Prompts
    "prompt_system": "Вы полезный помощник, который суммирует веб-контент на русском языке. Будьте кратки и используйте маркированные списки.",
    "prompt_user_intro": "Пожалуйста, прочитайте следующий веб-контент и:",
    "prompt_user_1": "1) Обобщите ключевые моменты и структуру с помощью маркированных списков",
    "prompt_user_2": "2) Выделите важные детали и выводы",
    "prompt_user_3": "3) Предоставьте краткое изложение в трех строках или меньше",
    "prompt_page_title": "Заголовок страницы: ",
    "prompt_page_link": "Ссылка на страницу: ",
    "prompt_content_start": "Содержание:",
    "prompt_no_content": "(Нет содержимого)",
    "prompt_no_title": "(Нет заголовка)",
    "prompt_no_link": "(Нет ссылки)"
  },
  "ko-KR": {
    // 페이지 제목
    "popupTitle": "LLM 웹 페이지 읽기 도우미",
    "appTitle": "",
    "settingsTitle": "",
    
    // 설정 페이지
    "section_llm_config": "LLM 설정 선택 또는 관리",
    "btn_add_profile": "새 설정 추가",
    "btn_delete_profile": "현재 설정 삭제",
    "label_profile_name": "설정 이름",
    "placeholder_profile_name": "예: DeepSeek 프로덕션 / OpenAI 개인 계정",
    "label_api_url": "API URL",
    "placeholder_api_url": "예: https://api.your-llm.com/v1/chat/completions",
    "label_api_key": "API 키",
    "placeholder_api_key": "당신의 LLM API 키",
    "label_model": "모델 이름",
    "placeholder_model": "예: gpt-4.1, qwen-max 등",
    "btn_save": "현재 설정 저장",
    "tip_title": "설명",
    "tip_content_1": "현재 구현은 기본적으로 'OpenAI Chat Completions' 호환 인터페이스를 사용하여 요청을 보냅니다:",
    "tip_content_2": "인터페이스 형식이 다른 경우, 필요에 따라 background.js의 callLLM 함수를 수정하세요.",
    "label_language": "언어 설정 / Language / 语言设置",
    
    // JS 동적 텍스트 - 설정 관리
    "name_no_profile": "설정이 없습니다. 먼저 추가해주세요.",
    "name_default_profile": "내 첫 번째 설정",
    "name_new_profile": "새 설정",
    "name_unnamed_profile": "이름 없는 설정",
    "status_added_profile": "새 빈 설정이 추가되었습니다.",
    "status_delete_fail": "최소 하나의 설정은 유지해야 하므로 삭제할 수 없습니다.",
    "status_deleted_profile": "현재 설정이 삭제되었습니다.",
    "status_saving": "저장 중...",
    "status_no_profile_to_save": "저장할 설정이 없습니다. 먼저 추가해주세요.",
    "status_save_fail_empty": "설정 이름, API URL, API 키, 모델 이름은 모두 필수 항목입니다.",
    "status_saved": "저장되었습니다. 채팅 창에서 전환하여 사용할 수 있습니다.",
    "status_save_error": "저장 실패: ",
    
    // 팝업 페이지
    "btn_open_options": "설정",
    "btn_analyze": "현재 페이지 해석",
    "placeholder_result": "해석 결과가 여기에 표시됩니다",
    "status_analyzing": "해석 중...",
    "status_error": "오류: ",
    "status_reading_page": "페이지 내용을 읽고 LLM에 요청 중입니다. 잠시 기다려주세요...",
    "status_config_missing": "먼저 설정에서 API URL, API 키, 모델을 구성해주세요.",
    "status_no_tab": "현재 탭을 찾을 수 없습니다.",
    "status_analyze_done": "해석 완료.",
    "status_no_result": "(LLM에서 반환된 결과 없음)",
    "status_analyze_fail": "해석 실패. 나중에 다시 시도해주세요.",
    "status_call_fail": "호출 실패: ",
    
    // 오버레이 플로팅 창
    "overlay_title": "",
    "overlay_analyze_btn": "페이지 해석",
    "overlay_settings_btn": "설정",
    "overlay_send_btn": "전송",
    "overlay_input_placeholder": "현재 페이지에 대해 질문하기, Enter로 전송...",
    "overlay_decrease_font": "글자 크기 줄이기",
    "overlay_increase_font": "글자 크기 키우기",
    "overlay_prev_qa": "이전 Q&A",
    "overlay_next_qa": "다음 Q&A",
    "overlay_expand": "확장",
    "overlay_collapse": "축소",
    "overlay_font_size": "글자 크기",
    "overlay_reading_page": "페이지 내용 읽는 중...",
    "overlay_read_fail": "페이지 내용 읽기 실패: ",
    "overlay_no_config": "LLM 인터페이스가 구성되지 않았습니다. 먼저 설정에서 추가해주세요.",
    "overlay_no_api_config": "API URL / API 키 / 모델이 구성되지 않았습니다.",
    "overlay_load_config_fail": "설정 로드 실패: ",
    "overlay_switched_profile": "설정으로 전환: ",
    "overlay_profile_not_found": "선택된 설정을 찾을 수 없습니다",
    "overlay_analyzing": "현재 페이지 해석 중, 잠시 기다려주세요...",
    "overlay_analyze_done": "해석 완료. 질문을 계속할 수 있습니다.",
    "overlay_thinking": "생각 중, 잠시 기다려주세요...",
    "overlay_replied": "답변 완료. 질문을 계속할 수 있습니다.",
    "overlay_call_fail": "호출 실패: ",
    "overlay_ask_analyze": "현재 페이지 내용을 해석해주세요.",
    
    // 백그라운드 프롬프트
    "prompt_system": "당신은 웹 콘텐츠를 한국어로 설명하는 도우미입니다. 알기 쉽게, 목록 형식으로 요점을 정리해주세요.",
    "prompt_user_intro": "다음 웹 콘텐츠를 읽고 다음을 수행해주세요:",
    "prompt_user_1": "1) 목록 형식으로 핵심 포인트와 구조 요약",
    "prompt_user_2": "2) 중요한 세부 사항과 결론 지적",
    "prompt_user_3": "3) 마지막으로 세 줄 이내의 간결한 요약 제공",
    "prompt_page_title": "페이지 제목: ",
    "prompt_page_link": "페이지 링크: ",
    "prompt_content_start": "본문 내용:",
    "prompt_no_content": "(본문 내용 없음)",
    "prompt_no_title": "(제목 없음)",
    "prompt_no_link": "(링크 없음)"
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
