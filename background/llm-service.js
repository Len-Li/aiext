import { getActiveConfig } from "./config-service.js";

export async function callLLM(pageData) {
  const { apiUrl, apiKey, model } = await getActiveConfig();

  if (!apiUrl || !apiKey || !model) {
    throw new Error("尚未配置 API 地址 / API Key / 模型。");
  }

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
    max_tokens: 1024,
    stream: false,
  };

  if (apiUrl.includes("bigmodel.cn") || model.toLowerCase().startsWith("glm")) {
    body.thinking = {
      type: "disabled",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        // ignore response parse failures
      }
      throw new Error(
        `LLM 接口返回错误状态 ${response.status}: ${errorText || "无详细错误信息"}`
      );
    }

    const data = await response.json();
    return (
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      JSON.stringify(data)
    );
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("请求超时，请检查网络连接或稍后重试。");
    }
    throw error;
  }
}
