
import { GoogleGenAI } from "@google/genai";
import { FormData, Channel } from '../types';
import { CHANNEL_OPTIONS } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCreativePrompt = async (data: FormData): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  // Determine aspect ratio
  let targetAspectRatio = '1:1';
  if (data.channel === Channel.NAVER_GFA_CUSTOM && data.customRatioWidth && data.customRatioHeight) {
    targetAspectRatio = `${data.customRatioWidth}:${data.customRatioHeight}`;
  } else {
    const channelOption = CHANNEL_OPTIONS.find(opt => opt.value === data.channel);
    targetAspectRatio = channelOption ? channelOption.aspectRatio : '1:1';
  }

  // Construct Text Space Prompt Logic
  let textSpaceInstruction = "";
  if (data.textBlockMainPosition === 'None' || data.textBlockMainSize === 'None') {
    textSpaceInstruction = "LAYOUT: Full-frame composition with NO specific reserved empty space. Fill the entire canvas with the product and background elements evenly.";
  } else {
    textSpaceInstruction = `LAYOUT PRIORITY: You MUST reserve a clear, clean NEGATIVE SPACE at the ${data.textBlockMainPosition}. 
    - Purpose: This area is strictly for future text placement.
    - Size: This empty area must be ${data.textBlockMainSize} in size.
    - Constraint: Do not place the main product or complex details in this ${data.textBlockMainPosition} area. Keep it empty.`;
  }

  const systemInstruction = `
    You are a professional commercial image composition assistant.
    Create a SINGLE-PARAGRAPH image generation prompt based on the user's inputs.

    [PRIORITY ORDER]
    1. USER MODIFICATION REQUESTS (Highest Priority) - If the user asks for specific changes, override standard rules.
    2. REFERENCE IMAGE (High Priority) - If provided, follow its style/composition closely.
    3. NO MODEL RULE (High Priority) - If no model image is uploaded, NEVER generate a person.

    [ABSOLUTE RULES]
    1. NEVER generate text/typography. Leave clean negative space.
    2. Products: Keep packaging/label/color EXACT. Adjust display size by role.
    3. Model: 
       - If usage rule is "No Model" OR no image uploaded: DO NOT generate a person.
       - If usage rule is "Use Model" AND image uploaded: Create a NEW fictional person inspired by the uploaded image (change identity).
    4. Aspect Ratio: End with “– aspect ratio W:H”.

    [DESIGN RULES]
    - Design Style: ${data.designStyle}
    - Background: ${data.backgroundStyle} (Primary: ${data.primaryColor}, Secondary: ${data.secondaryColor})
    - Decorations: ${data.useDecorativeElements ? `${data.decorativeDensity} density of ${data.decorativeStyle} elements` : 'None'}
    - Text Space: ${textSpaceInstruction}
  `;

  const parts: any[] = [];
  
  if (data.productImages && data.productImages.length > 0) {
    data.productImages.forEach((img) => {
      const base64Data = img.split(',')[1];
      const mimeType = img.split(';')[0].split(':')[1];
      parts.push({ inlineData: { mimeType, data: base64Data } });
    });
  }
  if (data.modelImage) {
    const base64Data = data.modelImage.split(',')[1];
    const mimeType = data.modelImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }
  if (data.backgroundImage) {
    const base64Data = data.backgroundImage.split(',')[1];
    const mimeType = data.backgroundImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }
  if (data.referenceImage) {
    const base64Data = data.referenceImage.split(',')[1];
    const mimeType = data.referenceImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }

  let productLines = "No product images.";
  if (data.productImages?.length > 0) {
    productLines = data.productImages.map((_, index) => {
      const sizeValue = data.productSizes?.[index] || 'Medium';
      return `Product #${index + 1}: role ${sizeValue}`;
    }).join('\n');
  }

  const textPrompt = `
    Create a commercial advertisement image using the following data:

    [URGENT: USER MODIFICATION REQUEST]
    ${data.modificationRequest ? `"${data.modificationRequest}"\n*** INSTRUCTION: This request overrides all other conflicting rules. ***` : "None."}

    [REFERENCE IMAGE PRIORITY]
    ${data.referenceImage ? "PRIMARY STYLE SOURCE: Use the uploaded Reference Image as the MAIN guide for lighting, composition, and mood. Mimic the layout." : "No reference provided."}

    [MODEL CONSTRAINT]
    ${(!data.modelImage) 
      ? "CRITICAL: NO MODEL IMAGE UPLOADED. DO NOT GENERATE ANY PEOPLE, HANDS, OR HUMAN FIGURES. Focus purely on the product." 
      : `Model Uploaded: Yes. Rule: ${data.modelUsageRule}. Create a new fictional model loosely inspired by the upload.`}

    [Products]
    ${productLines}

    [Design Settings]
    Style: ${data.designStyle}
    Background: ${data.backgroundStyle}
    Colors: ${data.primaryColor}, ${data.secondaryColor}
    Decorations: ${data.useDecorativeElements ? "Yes" : "No"} (${data.decorativeStyle}, ${data.decorativeDensity})
    
    [Layout & Text Space]
    ${textSpaceInstruction}
    Channel: ${data.channel}

    [Product Info]
    Name: ${data.productName}
    Key Points: ${data.additionalInfo}
    Mood: ${data.tone}
    Target: ${data.targetAudience}

    GENERATE A SINGLE PARAGRAPH PROMPT describing the scene, lighting, and composition.
    Ensure strict adherence to the Aspect Ratio: ${targetAspectRatio}.
    End with: “– aspect ratio ${targetAspectRatio}”
  `;

  parts.push({ text: textPrompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "Failed to generate prompt.";
  } catch (error) {
    console.error("Text generation error:", error);
    throw new Error("Failed to generate creative prompt.");
  }
};

export const generateCreativeImage = async (
  prompt: string, 
  channel: Channel, 
  productImages: string[] = [],
  modelImage?: string
): Promise<string | undefined> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash-image";

  const channelOption = CHANNEL_OPTIONS.find(opt => opt.value === channel);
  // Default to 1:1 if custom or unknown
  let apiAspectRatio = '1:1';
  if (channelOption && 'apiAspectRatio' in channelOption) {
    apiAspectRatio = (channelOption as any).apiAspectRatio;
  }

  try {
    const parts: any[] = [];
    if (productImages?.length > 0) {
      productImages.forEach((img) => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1];
        parts.push({ inlineData: { mimeType, data: base64Data } });
      });
    }
    if (modelImage) {
      const base64Data = modelImage.split(',')[1];
      const mimeType = modelImage.split(';')[0].split(':')[1];
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: { imageConfig: { aspectRatio: apiAspectRatio as any } }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("Failed to generate image.");
  }
};
