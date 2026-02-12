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
    // 在 Cloudflare 控制台设置环境变量后，process.env 将自动可用。
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const profileContext = `缘主姓名：${profile.name}，乾坤卦位：${profile.gender === 'male' ? '乾/男' : '坤/女'}。生辰：${profile.birthDate} ${profile.birthTime}。`;
    
    let userPrompt = "";
    let imagePart = null;

    if (method === 'image' && base64Image) {
      imagePart = { 
        inlineData: { 
          mimeType: "image/jpeg", 
          data: base64Image.split(',')[1] || base64Image 
        } 
      };
      userPrompt = `${profileContext}\n缘主刚通过灵境自拍，请结合其生辰八字与面相气色，推演今日运势。`;
    } else if (method === 'alignment') {
      userPrompt = `${profileContext} 正在同步名士 "${input}" 的磁场，请分析契合度并返回中文 JSON。`;
    } else {
      userPrompt = `${profileContext}\n缘主今日行为：${method === 'stick' ? '求得一签' : '写下感悟'}，内容为 "${input}"。请据此推演天机。`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: imagePart ? { parts: [imagePart, { text: userPrompt }] } : userPrompt,
      config: {
        systemInstruction: "你是一位精通周易、命理与心理学的当代仙师。你的职责是为缘主指点迷津。判词要典雅古朴（如四言、五言诗），建议要落地且富有智慧。务必使用中文并严格按照提供的 JSON Schema 返回数据。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "1-5星级" },
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
            advice: { type: Type.STRING, description: "具体的建议" },
            luckyColor: { type: Type.STRING },
            luckyNumber: { type: Type.STRING },
            luckyDirection: { type: Type.STRING },
            poem: { type: Type.STRING, description: "古风判词" },
            auraColor: { type: Type.STRING, description: "建议的背景颜色码" },
            vibeTag: { type: Type.STRING, description: "简短的气场标签" },
            alignmentScore: { type: Type.INTEGER, description: "名士契合百分比" }
          },
          required: ["overallScore", "summary", "categories", "advice", "luckyColor", "luckyNumber", "luckyDirection", "poem", "vibeTag"]
        },
      },
    });

    // 直接返回生成的文本（JSON 字符串）
    return new Response(response.text, {
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