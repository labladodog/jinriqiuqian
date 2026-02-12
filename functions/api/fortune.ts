import { GoogleGenAI, Type } from "@google/genai";

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
    
    // 初始化 AI 客户端。密钥必须从 process.env.API_KEY 读取。
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const profileContext = `缘主姓名：${profile.name}，生辰：${profile.birthDate} ${profile.birthTime}。性别：${profile.gender === 'male' ? '乾/男' : '坤/女'}。`;
    
    let parts: any[] = [];

    if (method === 'image' && base64Image) {
      parts = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        },
        { text: `${profileContext} 用户上传了瞬时面相照片。请结合生辰八字（娱乐化解析）与面相气色，推演今日运势。请务必使用中文返回 JSON。` }
      ];
    } else if (method === 'alignment') {
      parts = [{ text: `
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
      parts = [{ text: `
        ${profileContext}
        当前行为：${methodDesc}。
        请以周易玄学结合现代心理学，推演今日运势。
        请务必使用中文返回符合 Schema 的 JSON。
      ` }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "综合评分 1-5" },
            summary: { type: Type.STRING, description: "今日总述" },
            categories: {
              type: Type.OBJECT,
              properties: {
                wealth: { type: Type.INTEGER },
                career: { type: Type.INTEGER },
                love: { type: Type.INTEGER },
                health: { type: Type.INTEGER },
              },
              required: ["wealth", "career", "love", "health"]
            },
            advice: { type: Type.STRING, description: "仙人指路" },
            luckyColor: { type: Type.STRING },
            luckyNumber: { type: Type.STRING },
            luckyDirection: { type: Type.STRING },
            poem: { type: Type.STRING, description: "判词或小诗" },
            auraColor: { type: Type.STRING, description: "十六进制颜色值，如 #ef4444" },
            vibeTag: { type: Type.STRING, description: "今日气场标签，如：紫气东来" },
            alignmentScore: { type: Type.INTEGER, description: "契合度评分" }
          },
          required: ["overallScore", "summary", "categories", "advice", "luckyColor", "luckyNumber", "luckyDirection", "poem", "vibeTag"]
        },
      },
    });

    const resText = response.text;
    const res = JSON.parse(resText);
    if (method === 'alignment') {
      res.alignmentFigure = input;
    }

    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Cloudflare Function Error:", error);
    return new Response(JSON.stringify({ error: "灵境感应中断，请检查 API 配置。" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};