import { GoogleGenAI } from "@google/genai";
import { FormData, Channel } from '../types';
import { CHANNEL_OPTIONS, PRODUCT_SIZE_OPTIONS } from '../constants';

// Initialize the API client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates the text prompt using Gemini 2.5 Flash
 * Handles multimodal input (Product Images + Model Image + Background/Reference + Text)
 */
export const generateCreativePrompt = async (data: FormData): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    당신은 전자상거래·디지털 광고용 합성 이미지를 제작하기 위한 "상업용 이미지 프롬프트 크리에이터"입니다.  
    사용자가 업로드한 제품 이미지, 모델 이미지, 배경 이미지, 레퍼런스 이미지를 참고하여  
    실제 촬영처럼 자연스럽고 고품질의 광고용 이미지를 생성할 수 있도록 ‘영어 한 문단 프롬프트’를 작성합니다.

    =====================
    [초기화 및 데이터 무결성 규칙 (최우선 적용)]
    =====================
    1. **독립적 처리**: 각 요청은 완전히 독립적입니다. 현재 입력된 데이터만 사용하십시오.
    2. **모델 이미지 미제공 시 (No Upload)**: 프롬프트에 사람, 모델, 신체 일부(손 등)를 절대 묘사하지 마십시오. 오직 제품 중심(Product-centric) 구도로 작성해야 합니다.
    3. **배경 이미지 미제공 시 (No Upload)**: "업로드된 배경을 참고했다"는 표현을 절대 쓰지 마십시오. 분위기(Mood)에 맞는 배경을 텍스트로만 묘사하십시오.
    4. **허구 생성 금지**: 제공되지 않은 이미지(모델/배경/레퍼런스)에 대해 "Based on the uploaded image..."라고 서술하면 안 됩니다.

    =====================
    [핵심 역할]
    =====================
    1) 제품 이미지(단일 또는 복수)는 형태·라벨·용기·색상·디자인을 절대 변경하지 않고 그대로 유지합니다.

    2) 모델 이미지가 업로드된 경우(Yes):
       - 모델 이미지를 ‘직접 복제하거나 동일한 인물로 재현하지 않고’,  
         **모델의 특징을 참고해 새로운 인물로 재해석해야 합니다.**
       - "A new model loosely based on..." 등으로 시작하십시오.
       - 모델이 제품을 들고 있거나 함께 있는 자연스러운 합성을 묘사하십시오.

    3) 배경 이미지가 제공된 경우(Yes):
       - 해당 색감·그라데이션·조명을 참고하여 광고용 배경을 재구성합니다.

    4) 레퍼런스 이미지가 제공된 경우(Yes):
       - 톤·조명·화보 스타일·레이아웃만 참고하며 절대 그대로 재현하거나 복제하지 않습니다.

    =====================
    [초상권 보호 / 비식별화 규칙]
    =====================
    - 업로드된 모델 이미지의 얼굴, 피부 질감, 헤어스타일, 윤곽 등을 일부 변경해  
      **새로운 인물처럼 보이도록 해야 합니다.**
    - 동일 인물로 인식될 수 있는 세부 특징은 재현 금지.
    - 묘사는 반드시 “inspired by the uploaded model image” 또는  
      “a new model loosely based on the uploaded model” 형태로 표현합니다.

    =====================
    [출력 규칙]
    =====================
    - 반드시 영어 한 문단으로 출력.
    - 제품 이미지가 여러 개라면 세트 구성 설명 포함.
    - 모델 합성 시 “natural composite”, “consistent lighting”, “commercial photoshoot style” 포함.
    - 제품은 절대 변형하지 않는다는 문구 포함.
    - **마지막에 반드시 Aspect Ratio(종횡비) 정보를 포함해야 합니다.**
      - 일반 채널: "– aspect ratio X:Y"
      - 네이버 GFA(커스텀): "– size WxHpx, aspect ratio W:H"
  `;

  // Construct parts for multimodal input
  const parts: any[] = [];
  
  // Handle multiple product images
  // Important: These are the first N images in the parts list.
  if (data.productImages && data.productImages.length > 0) {
    data.productImages.forEach((img, index) => {
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

  // Construct size instructions
  let sizeInstructions = "";
  if (data.productImages && data.productImages.length > 0) {
    sizeInstructions = data.productImages.map((_, index) => {
      const sizeValue = data.productSizes?.[index] || 'Medium';
      const sizeOption = PRODUCT_SIZE_OPTIONS.find(opt => opt.value === sizeValue) || PRODUCT_SIZE_OPTIONS[1];
      return `- Product #${index + 1}: ${sizeOption.prompt}`;
    }).join('\n    ');
  }

  // Determine Final Aspect Ratio or Size String
  let aspectRatioString = "";
  const channelOption = CHANNEL_OPTIONS.find(opt => opt.value === data.channel);
  
  if (data.channel === Channel.NAVER_GFA_CUSTOM) {
     const w = data.gfaCustomWidth || "1200";
     const h = data.gfaCustomHeight || "628";
     aspectRatioString = `– size ${w}x${h}px, aspect ratio ${w}:${h}`;
  } else {
     const ratio = channelOption ? channelOption.aspectRatio : '1:1';
     aspectRatioString = `– aspect ratio ${ratio}`;
  }

  const textPrompt = `
    아래 정보를 기반으로 광고용 이미지 생성 모델에 바로 사용할 수 있는
    "영어 한 문단 프롬프트"를 작성해 주세요.

    [제품 정보]
    제품명: ${data.productName}
    카테고리: (이미지 기반 자동 분석)
    주요 소구점: ${data.additionalInfo || 'N/A'}
    
    [이미지 매핑 및 크기 규칙]
    제품 이미지 개수: ${data.productImages.length}
    (처음 ${data.productImages.length}개의 이미지가 제품 이미지입니다.)
    사용자가 지정한 제품별 크기/비중:
    ${sizeInstructions}
    (Do not change label, shape, or design. Adjust only display size/scale.)

    [광고 정보]
    사용 채널/목적: ${data.channel}
    타겟: ${data.targetAudience || 'General Audience'}
    분위기: ${data.tone}
    
    [업로드 데이터 현황]
    - 모델 이미지 제공: ${data.modelImage ? "Yes" : "No"}
    - 배경 이미지 제공: ${data.backgroundImage ? "Yes" : "No"}
    - 레퍼런스 이미지 제공: ${data.referenceImage ? "Yes" : "No"}

    [텍스트 정보 (Text Overlay Planning)]
    *실제 텍스트를 생성하지 말고, 아래 위치에 문구가 들어갈 '공간(Negative Space)'을 확보하거나 배치를 설명하세요.*
    메인 카피: ${data.headlineText ? `"${data.headlineText}"` : "(비어있음)"}
    보조 카피: ${data.subText ? `"${data.subText}"` : "(비어있음)"}
    CTA: ${data.ctaText ? `"${data.ctaText}"` : "(비어있음)"}
    
    메인 카피 위치: ${data.headlinePosition || 'N/A'}
    보조 카피 위치: ${data.subPosition || 'N/A'}
    CTA 위치: ${data.ctaPosition || 'N/A'}

    [네이버 GFA 커스텀 사이즈 정보]
    ${data.channel === Channel.NAVER_GFA_CUSTOM ? `가로: ${data.gfaCustomWidth}px, 세로: ${data.gfaCustomHeight}px` : "해당 없음"}

    [요청 사항]
    - 사용 채널에 맞는 레이아웃과 텍스트 배치를 설계하세요.
    - 텍스트는 "Korean headline text", "Korean sub text", "Korean CTA text"로 지칭하며, 각 위치에 따라 배치만 설명해 주세요.
    - 네이버 GFA – 커스텀이며 width/height가 제공된 경우, 해당 픽셀 사이즈와 비율을 최우선으로 사용해 배너 구도를 설계하세요.
    - 모델 이미지가 없다면 제품 중심 구도로, 있다면 비식별화된 가상 모델로 합성하세요.
    
    [출력 조건]
    - 영어 한 문단으로 작성
    - 마지막에 항상 aspect ratio 표기: "${aspectRatioString}"
  `;

  parts.push({ text: textPrompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate prompt.";
  } catch (error) {
    console.error("Text generation error:", error);
    throw new Error("Failed to generate creative prompt. Please try again.");
  }
};

/**
 * Generates the actual image using Gemini 2.5 Flash Image
 * Pass all product images AND model image to the model to guide generation/editing.
 */
export const generateCreativeImage = async (
  prompt: string, 
  channel: Channel, 
  productImages: string[] = [],
  modelImage?: string
): Promise<string | undefined> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash-image";

  // Determine aspect ratio config based on channel
  const channelOption = CHANNEL_OPTIONS.find(opt => opt.value === channel);
  // Default to 1:1 if unknown, but Gemini API usually expects specific enum strings.
  // Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
  let aspectRatio = channelOption ? channelOption.aspectRatio : '1:1';

  // Fallback for custom GFA: Use 1:1 or closest standard ratio since API doesn't support custom pixel size generation directly
  if (channel === Channel.NAVER_GFA_CUSTOM) {
     aspectRatio = '1:1'; 
  }

  try {
    const parts: any[] = [];

    // Add all product images as context
    if (productImages && productImages.length > 0) {
      productImages.forEach((img) => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1];
        parts.push({ inlineData: { mimeType, data: base64Data } });
      });
    }

    // Add model image if exists
    if (modelImage) {
      const base64Data = modelImage.split(',')[1];
      const mimeType = modelImage.split(';')[0].split(':')[1];
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }

    // Add the text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, 
        }
      }
    });

    // Extract image
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
    throw new Error("Failed to generate image visual. The prompt was generated, but the image creation failed.");
  }
};