
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, FortuneResult } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const getFortune = async (
  profile: UserProfile, 
  method: 'stick' | 'thought' | 'image' | 'alignment', 
  input: string,
  base64Image?: string
): Promise<FortuneResult> => {
  const ai = getAIClient();
  
  let parts: any[] = [];

  const profileContext = `缘主姓名：${profile.name}，生辰：${profile.birthDate} ${profile.birthTime}。性别：${profile.gender === 'male' ? '乾/男' : '坤/女'}。`;

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

  const res = JSON.parse(response.text) as FortuneResult;
  if (method === 'alignment') {
    res.alignmentFigure = input;
  }
  return res;
};

export const getAudioBlessing = async (text: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `请用慈祥、庄严、略带仙风道骨的口吻诵读：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  } catch (err) {
    console.error("TTS Error", err);
    return '';
  }
};
