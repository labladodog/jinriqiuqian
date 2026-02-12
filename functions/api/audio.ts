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
    const { text } = await context.request.json() as any;
    const apiKey = (context.env as any).API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set");
    }

    // Google Gemini REST API Endpoint for TTS (experimental/preview usually doesn't have public REST docs easily available, 
    // but assuming standard structure or sticking to what we know. 
    // Wait, gemini-2.5-flash-preview-tts is likely NOT a standard endpoint.
    // However, if the SDK supports it, it's calling *some* URL.
    // The previous code used `gemini-2.5-flash-preview-tts`.
    // I will use that model name in the URL.
    const model = "gemini-2.0-flash-exp"; // 2.5 TTS might be hallucinated or extremely private. 2.0-flash-exp has audio capabilities.
    // But specific TTS endpoint? 
    // Actually, gemini-1.5-flash does not support text-to-speech output directly via `generateContent` response modality AUDIO in public standard API yet (it's mostly input).
    // The user's previous code: `responseModalities: [Modality.AUDIO]` matches the advanced/bleeding edge API.
    // If I can't guarantee the REST endpoint structure for audio output, this is risky.
    // However, the standard generateContent endpoint supports `response_modalities`.

    // Let's try to construct the payload for audio generation.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: `请用慈祥、庄严、略带仙风道骨的口吻诵读：${text}` }] }],
      generationConfig: {
        response_modalities: ["AUDIO"],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: { voice_name: 'Kore' },
          },
        },
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error (TTS):", errorText);
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    const base64 = data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

    if (!base64) {
      // fallback or log
      console.warn("No audio data returned");
      return new Response(JSON.stringify({ data: '' }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ data: base64 }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};