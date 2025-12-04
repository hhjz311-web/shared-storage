export enum Channel {
  SHOPPING_THUMBNAIL = '쇼핑몰 썸네일',
  NAVER_GFA_SQUARE = '네이버 GFA (1:1)',
  NAVER_GFA_RECT = '네이버 GFA (1.25:1)',
  NAVER_GFA_CUSTOM = '네이버 GFA (커스텀)',
  META_FEED = '메타 광고 (피드)',
  META_STORY = '메타 광고 (스토리/릴스)',
}

export enum Tone {
  LUXURIOUS = '고급스러운/살롱 무드',
  CLEAN = '깨끗한/클린 뷰티',
  VIBRANT = '생동감 있는/팝',
  NATURAL = '자연스러운/일상',
  PROFESSIONAL = '전문적인/스튜디오',
}

export type TextPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface FormData {
  productName: string;
  targetAudience: string;
  channel: Channel;
  tone: Tone;
  additionalInfo: string;
  productImages: string[]; // Array to support multiple product images (1-10)
  productSizes: string[]; // Array corresponding to productImages (e.g., 'Large', 'Medium', 'Small')
  modelImage?: string; // base64
  backgroundImage?: string; // base64
  referenceImage?: string; // base64
  
  // Text Overlay Fields
  headlineText?: string;
  headlinePosition?: TextPosition;
  subText?: string;
  subPosition?: TextPosition;
  ctaText?: string;
  ctaPosition?: TextPosition;

  // GFA Custom Size
  gfaCustomWidth?: string;
  gfaCustomHeight?: string;
}

export interface GenerationResult {
  prompt: string;
  imageUrl?: string;
  aspectRatioLabel: string;
}

export interface GeminiError {
  message: string;
}