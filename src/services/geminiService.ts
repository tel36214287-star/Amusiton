
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedVerse {
  chord: string;
  line1: string;
  line2: string;
}

export type MusicStyle = 'Rock' | 'Pop' | 'MPB' | 'Rap';

export async function generateImprovisation(style: MusicStyle): Promise<GeneratedVerse[]> {
  const styleDescriptions: Record<MusicStyle, string> = {
    'Rock': 'Rock clássico em português. Fale sobre liberdade, estrada e guitarras. Acordes como E, A, D, G, Am.',
    'Pop': 'Pop moderno e cativante em português. Fale sobre relacionamentos, cores e sentimentos urbanos. Acordes como C, G, Am, F, Dm7.',
    'MPB': 'Música Popular Brasileira (MPB) sofisticada. Fale sobre poesia, mar, cotidiano e brasilidade. Acordes com sétimas e nonas (Cmaj7, Dm7, G7, Am9).',
    'Rap': 'Rap rítmico e direto em português com batidas verbais. Fale sobre a realidade das ruas, superação e reflexão. Acordes mais simples ou tensos (Bm, F#m, C#m, Em).'
  };

  const prompt = `Gere uma música no estilo ${style} (${styleDescriptions[style]}) com exatamente 12 conjuntos de versos. 
  Cada conjunto deve ter um acorde musical apropriado para o estilo ${style} e dois versos curtos e impactantes.
  Retorne um array JSON de objetos, onde cada objeto tem:
  - "chord": o nome do acorde.
  - "line1": o primeiro verso.
  - "line2": o segundo verso.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            chord: { type: Type.STRING },
            line1: { type: Type.STRING },
            line2: { type: Type.STRING },
          },
          required: ["chord", "line1", "line2"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Falha ao gerar a música. Tente novamente.");
  }
}
