import { UserProfile, FortuneResult } from "../types";

export const getFortune = async (
  profile: UserProfile,
  method: 'stick' | 'thought' | 'image' | 'alignment',
  input: string,
  base64Image?: string
): Promise<FortuneResult> => {
  const response = await fetch('/api/fortune', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile,
      method,
      input,
      base64Image
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const res = await response.json() as FortuneResult;
  // The alignmentFigure (input) is already handled on the server side in my previous edit to fortune.ts, 
  // but to be safe and consistent with previous client data structures:
  if (method === 'alignment') {
    res.alignmentFigure = input;
  }
  return res;
};

export const getAudioBlessing = async (text: string): Promise<string> => {
  try {
    const response = await fetch('/api/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const data = await response.json() as { data: string };
    return data.data || '';
  } catch (err) {
    console.error("TTS Error", err);
    return '';
  }
};
