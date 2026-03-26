import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMotherMessage(category: string, motherName?: string) {
  const prompt = motherName 
    ? `Crie uma mensagem curta, ÚNICA e emocionante de Dia das Mães para uma mãe chamada "${motherName}" na categoria "${category}". Use palavras diferentes do comum, seja criativo e evite clichês. A mensagem deve ser carinhosa e pronta para enviar por WhatsApp. IMPORTANTE: Retorne APENAS o texto da mensagem, sem introduções como "Aqui está sua mensagem" ou conclusões.`
    : `Crie uma mensagem curta, ÚNICA e emocionante de Dia das Mães na categoria "${category}". Use palavras diferentes do comum, seja criativo e evite clichês. A mensagem deve ser carinhosa e pronta para enviar por WhatsApp. IMPORTANTE: Retorne APENAS o texto da mensagem, sem introduções como "Aqui está sua mensagem" ou conclusões.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}

export async function generateCaricature(base64Image: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/png",
          },
        },
        {
          text: 'Transforme esta pessoa em uma caricatura artística e doce para o Dia das Mães. Use um estilo de aquarela suave, traços gentis e cores pastéis (especialmente tons de rosa e rose). O resultado deve ser uma imagem única e emocionante.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Não foi possível gerar a caricatura.");
}

export async function generatePremiumMessage(customDetails: string) {
  const prompt = `Crie uma mensagem de Dia das Mães extremamente especial e personalizada baseada nestes detalhes: "${customDetails}". A mensagem deve ser poética, profunda e inesquecível. IMPORTANTE: Retorne APENAS o texto da mensagem, sem introduções ou comentários adicionais.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}
