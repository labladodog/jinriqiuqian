// 定义 Cloudflare Pages Function 接口类型
interface PagesFunction<Env = any> {
  (context: {
    request: Request;
    env: Env;
    params: Record<string, string>;
    data: Record<string, any>;
  }): Promise<Response> | Response;
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { profile, method, input, base64Image } = await context.request.json() as any;

    // 初始化 API Key
    const apiKey = (context.env as any).API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set");
    }

    const profileContext = `缘主姓名：${profile.name}，生辰：${profile.birthDate} ${profile.birthTime}。性别：${profile.gender === 'male' ? '乾/男' : '坤/女'}。`;

    let parts: any[] = [];

    if (method === 'image' && base64Image) {
      parts = [
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        },
        { text: `${profileContext} 用户上传了瞬时面相照片。请结合生辰八字（娱乐化解析）与面相气色，推演今日运势。请务必使用中文返回 JSON。` }
      ];
    } else if (method === 'alignment') {
      parts = [{
        text: `
        ${profileContext} 
        当前行为：尝试与古代名士 "${input}" 进行命理契合。
        请分析缘主今日磁场与该名士历史性格/命理的契合度（0-100）。
        并以此契合度为引子，给出今日运势解析。
        请务必使用中文返回符合 Schema 的 JSON。
      ` }];
    } else {
      const methodDesc = method === 'stick'
        ? `求得灵签：${input}`
        : `写下感悟： "${input}"`;
      parts = [{
        text: `
        ${profileContext}
        当前行为：${methodDesc}。
        请以周易玄学结合现代心理学，推演今日运势。
        请务必使用中文返回符合 Schema 的 JSON。
      ` }];
    }

    // Google Gemini REST API Endpoint
    // 使用 gemini-1.5-flash 模型 (兼容性最好且速度快)
    // 如果用户确实有 gemini-3-flash-preview 权限，可以改回去，但默认不推荐使用未发布模型名
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: {
          type: "OBJECT",
          properties: {
            overallScore: { type: "INTEGER", description: "综合评分 1-5" },
            summary: { type: "STRING", description: "今日总述" },
            categories: {
              type: "OBJECT",
              properties: {
                wealth: { type: "INTEGER" },
                career: { type: "INTEGER" },
                love: { type: "INTEGER" },
                health: { type: "INTEGER" },
              },
              required: ["wealth", "career", "love", "health"]
            },
            advice: { type: "STRING", description: "仙人指路" },
            luckyColor: { type: "STRING" },
            luckyNumber: { type: "STRING" },
            luckyDirection: { type: "STRING" },
            poem: { type: "STRING", description: "判词或小诗" },
            auraColor: { type: "STRING", description: "十六进制颜色值，如 #ef4444" },
            vibeTag: { type: "STRING", description: "今日气场标签，如：紫气东来" },
            alignmentScore: { type: "INTEGER", description: "契合度评分" }
          },
          required: ["overallScore", "summary", "categories", "advice", "luckyColor", "luckyNumber", "luckyDirection", "poem", "vibeTag"]
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    // 解析 REST API 响应结构
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      throw new Error("No content generated from Gemini API");
    }

    const res = JSON.parse(textResult);
    if (method === 'alignment') {
      res.alignmentFigure = input;
    }

    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Cloudflare Function Error:", error);
    // 返回具体的错误信息以便调试 (生产环境可隐藏)
    return new Response(JSON.stringify({ error: error.message || "灵境感应中断，请检查 API 配置。" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};