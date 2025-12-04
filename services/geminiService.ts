import { GoogleGenAI } from "@google/genai";
import { FormData, Channel } from '../types';
import { CHANNEL_OPTIONS } from '../constants';

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
    - 마지막에 “– aspect ratio …” 포함.
  `;

  // Determine aspect ratio for the instruction
  const channelOption = CHANNEL_OPTIONS.find(opt => opt.value === data.channel);
  const targetAspectRatio = channelOption ? channelOption.aspectRatio : '1:1';

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

  const textPrompt = `
    아래 정보를 기반으로 이미지 생성 모델용 영어 한 문단 프롬프트를 만들어 주세요.

    [입력 데이터 현황]
    - 제품 이미지 개수: ${data.productImages.length}
    - 모델 이미지 제공 여부: ${data.modelImage ? "Yes" : "No"}
    - 배경 이미지 제공 여부: ${data.backgroundImage ? "Yes" : "No"}
    - 레퍼런스 이미지 제공 여부: ${data.referenceImage ? "Yes" : "No"}

    [이미지 매핑 가이드 (Image Mapping Guide)]
    이 요청에 첨부된 처음 ${data.productImages.length}개의 이미지는 순서대로 "제품 #1", "제품 #2", ... 입니다.
    사용자가 "제품 #1"을 특정 위치에 두라고 요청하면, 첫 번째 이미지를 의미합니다.

    [제품 정보]
    제품명: ${data.productName}
    카테고리: (이미지 기반 자동 분석)
    소구점(추가 요청사항): ${data.additionalInfo || 'N/A'}
    (사용자가 특정 번호(예: #1, #2)를 언급했다면 위 매핑 가이드를 따라 정확히 배치하십시오.)

    [광고 목적]
    사용 목적: ${data.channel}
    분위기: ${data.tone}
    타겟: ${data.targetAudience || 'General Audience'}

    [작성 규칙 - 데이터 유무에 따른 분기]
    1. **모델 이미지 ${data.modelImage ? "있음(Yes)" : "없음(No)"}**:
       ${data.modelImage 
         ? "- 모델을 참고하되 비식별화하여 새로운 가상 모델 생성. 제품과 자연스럽게 합성." 
         : "- **모델 묘사 절대 금지**. 사람 없이 오직 제품 단독 샷(Product-only)으로 구성."}
    
    2. **배경 이미지 ${data.backgroundImage ? "있음(Yes)" : "없음(No)"}**:
       ${data.backgroundImage 
         ? "- 업로드된 배경의 톤앤매너를 참고하여 배경 재구성." 
         : "- '분위기' 항목에 맞춰 어울리는 배경을 텍스트로 창작. 업로드된 배경 언급 금지."}

    3. **레퍼런스 이미지 ${data.referenceImage ? "있음(Yes)" : "없음(No)"}**:
       ${data.referenceImage 
         ? "- 레퍼런스의 조명/구도 스타일만 참고(복제 금지)." 
         : "- 상업용 광고 표준 조명/구도 적용."}

    4. **제품 변형 금지**: 제품의 형태, 비율, 디자인은 원본 그대로 유지.

    [출력 포맷]
    - 영어 한 문단
    - natural composite / commercial photography / studio lighting 표현 포함
    - 마지막에 aspect ratio ${targetAspectRatio} 포함
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
  const aspectRatio = channelOption ? channelOption.aspectRatio : '1:1';

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