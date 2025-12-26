
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, GeneratedContent } from "../chinasource-types";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    hero: {
      type: Type.OBJECT,
      properties: {
        tagline: { type: Type.STRING },
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        ctaPrimary: { 
          type: Type.OBJECT,
          properties: { text: { type: Type.STRING }, href: { type: Type.STRING } },
          required: ["text", "href"]
        },
        backgroundImage: { type: Type.STRING }
      },
      required: ["tagline", "headline", "subheadline", "ctaPrimary", "backgroundImage"],
    },
    solutions: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING },
            },
            required: ["title", "description", "icon"],
          },
        },
      },
      required: ["title", "description", "items"],
    },
    howItWorks: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING },
            },
            required: ["title", "description", "icon"],
          },
        },
      },
      required: ["title", "steps"],
    },
    about: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        image: { type: Type.STRING },
        trustMetrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              suffix: { type: Type.STRING },
            },
            required: ["label", "value"],
          }
        }
      },
      required: ["title", "description", "image", "trustMetrics"],
    },
    contact: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        address: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        wechat: { type: Type.STRING },
        whatsapp: { type: Type.STRING },
      },
      required: ["title", "address", "email", "phone", "wechat", "whatsapp"],
    },
    socials: {
      type: Type.OBJECT,
      properties: {
        facebook: { type: Type.STRING },
        instagram: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        twitter: { type: Type.STRING },
      },
      required: ["facebook", "instagram", "linkedin", "twitter"],
    }
  },
  required: ["hero", "solutions", "howItWorks", "about", "contact", "socials"],
};

export const generateLandingPageContent = async (formData: FormData): Promise<GeneratedContent> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate premium, high-converting copy for a one-page China sourcing agency called "${formData.companyName}".
    
    Context:
    - User Services: ${formData.services}
    - Targeted Markets: ${formData.countries}
    
    Requirements:
    - Tone: Exclusive, high-authority, transparent, and results-driven.
    - Hero: Avoid generic phrases. Use punchy, professional headlines about supply chain dominance or effortless manufacturing.
    - Solutions: Provide 3 distinct, comprehensive service modules.
    - How It Works: Define a 3-step elite process (e.g., Audit -> Sourcing -> Logistics).
    - About: Focus on the "China Boots on the Ground" advantage.
    - Trust Metrics: Generate 3 specific stats (e.g., "500+ Verified Factories", "99.8% QC Pass Rate", "12h Response Time").
    - Background Image: Use a high-quality Unsplash URL related to modern cargo ships, futuristic factories, or high-tech supply chain nodes.
    - Icons: Choose from ["search", "truck", "shield", "handshake", "globe", "box", "users", "credit-card", "trending-up", "award", "clock", "check"].
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as GeneratedContent;
  }
  throw new Error("Empty response from AI engine");
};
