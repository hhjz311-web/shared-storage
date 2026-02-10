
export enum Channel {
  SHOPPING_THUMBNAIL = '쇼핑몰 썸네일',
  NAVER_GFA_RECT = '네이버 GFA (1.25:1)',
  META_FEED = '메타 광고 (피드)',
  META_STORY = '메타 광고 (스토리/릴스)',
  NAVER_GFA_1200_628 = '네이버 GFA 1200×628',
  NAVER_GFA_1200_1800 = '네이버 GFA 1200×1800',
  NAVER_GFA_342_228 = '네이버 GFA 342×228',
  NAVER_GFA_1250_560 = '네이버 GFA 1250×560',
  NAVER_GFA_CUSTOM = '네이버 GFA (커스텀)',
}

export enum Tone {
  LUXURIOUS = '고급스러운/살롱 무드',
  CLEAN = '깨끗한/클린 뷰티',
  VIBRANT = '생동감 있는/팝',
  NATURAL = '자연스러운/일상',
  PROFESSIONAL = '전문적인/스튜디오',
}

export enum DesignStyle {
  PREMIUM = 'Premium',
  CLEAN_BEAUTY = 'Clean Beauty',
  POP = 'Pop',
  SALON = 'Salon',
  MINIMAL = 'Minimal',
}

export enum BackgroundStyle {
  SOLID = 'Solid Color',
  SOFT_GRADIENT = 'Soft Gradient',
  STRONG_GRADIENT = 'Strong Gradient',
  SPOTLIGHT = 'Spotlight',
  DARK_GLOW = 'Dark Glow',
  LIGHT_GLOW = 'Light Glow',
}

export enum DecorativeStyle {
  SPARKLE = 'Sparkle',
  GLOSSY = 'Glossy',
  GEOMETRIC = 'Geometric',
  MINIMAL = 'Minimal',
}

export enum DecorativeDensity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TextBlockPosition {
  NONE = 'None',
  TOP = 'Top Area',
  BOTTOM = 'Bottom Area',
  LEFT = 'Left Side',
  RIGHT = 'Right Side',
  CENTER = 'Center',
}

export enum TextBlockSize {
  NONE = 'None',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
}

export enum ModelUsage {
  NO_MODEL = 'No Model',
  USE_MODEL = 'Use Model (Identity Change)',
}

export interface FormData {
  productName: string;
  targetAudience: string;
  channel: Channel;
  customRatioWidth?: number;
  customRatioHeight?: number;
  tone: Tone;
  additionalInfo: string;
  productImages: string[]; 
  productSizes: string[]; 
  modelImage?: string; 
  modelUsageRule: ModelUsage;
  backgroundImage?: string; 
  referenceImage?: string;

  // Design Fields
  designStyle: DesignStyle;
  backgroundStyle: BackgroundStyle;
  primaryColor: string;
  secondaryColor: string;
  useDecorativeElements: boolean;
  decorativeStyle: DecorativeStyle;
  decorativeDensity: DecorativeDensity;
  textBlockMainPosition: TextBlockPosition;
  textBlockMainSize: TextBlockSize;
  
  // New Field
  modificationRequest: string;
}

export interface GenerationResult {
  prompt: string;
  imageUrl?: string;
  aspectRatioLabel: string;
}

export interface GeminiError {
  message: string;
}
