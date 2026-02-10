
import { Channel, Tone, DesignStyle, BackgroundStyle, DecorativeStyle, DecorativeDensity, TextBlockPosition, TextBlockSize, ModelUsage } from './types';

// aspectRatio: Displayed in prompt and UI (Exact)
// apiAspectRatio: Closest valid enum for Gemini API config (1:1, 3:4, 4:3, 9:16, 16:9)
export const CHANNEL_OPTIONS = [
  { value: Channel.SHOPPING_THUMBNAIL, label: '쇼핑몰 썸네일 (1:1)', aspectRatio: '1:1', apiAspectRatio: '1:1' },
  { value: Channel.NAVER_GFA_RECT, label: '네이버 GFA (1.25:1)', aspectRatio: '5:4', apiAspectRatio: '4:3' }, 
  { value: Channel.META_FEED, label: '메타 광고 피드 (4:5)', aspectRatio: '4:5', apiAspectRatio: '3:4' }, 
  { value: Channel.META_STORY, label: '메타 광고 스토리/릴스 (9:16)', aspectRatio: '9:16', apiAspectRatio: '9:16' },
  
  // Naver GFA Sizes
  { value: Channel.NAVER_GFA_1200_628, label: '네이버 GFA 1200×628 (300:157)', aspectRatio: '300:157', apiAspectRatio: '16:9' },
  { value: Channel.NAVER_GFA_1200_1800, label: '네이버 GFA 1200×1800 (2:3)', aspectRatio: '2:3', apiAspectRatio: '3:4' },
  { value: Channel.NAVER_GFA_342_228, label: '네이버 GFA 342×228 (57:38)', aspectRatio: '57:38', apiAspectRatio: '4:3' },
  { value: Channel.NAVER_GFA_1250_560, label: '네이버 GFA 1250×560 (125:56)', aspectRatio: '125:56', apiAspectRatio: '16:9' },
  { value: Channel.NAVER_GFA_CUSTOM, label: '네이버 GFA 커스텀 (직접 입력)', aspectRatio: 'Custom', apiAspectRatio: '1:1' }, // Default fallback
];

export const TONE_OPTIONS = [
  { value: Tone.LUXURIOUS, label: '고급스러운 (Luxury/Salon)' },
  { value: Tone.CLEAN, label: '깨끗한 (Clean Beauty)' },
  { value: Tone.NATURAL, label: '자연스러운 (Natural/Lifestyle)' },
  { value: Tone.VIBRANT, label: '생동감 있는 (Vibrant/Pop)' },
  { value: Tone.PROFESSIONAL, label: '전문적인 (Studio/Professional)' },
];

export const PRODUCT_SIZE_OPTIONS = [
  { value: 'Large', label: 'Main (크게)', prompt: 'Main Hero Product (Large Scale)' },
  { value: 'Medium', label: 'Medium (중간)', prompt: 'Standard Product (Medium Scale)' },
  { value: 'Small', label: 'Small (작게)', prompt: 'Sub Element (Small Scale)' },
];

export const DESIGN_STYLE_OPTIONS = [
  { value: DesignStyle.PREMIUM, label: 'Premium (High-end)' },
  { value: DesignStyle.CLEAN_BEAUTY, label: 'Clean Beauty (Pure)' },
  { value: DesignStyle.POP, label: 'Pop (Trendy/Vivid)' },
  { value: DesignStyle.SALON, label: 'Salon (Professional)' },
  { value: DesignStyle.MINIMAL, label: 'Minimal (Simple)' },
];

export const BACKGROUND_STYLE_OPTIONS = [
  { value: BackgroundStyle.SOLID, label: 'Solid Color (단색)' },
  { value: BackgroundStyle.SOFT_GRADIENT, label: 'Soft Gradient (부드러운 그라데이션)' },
  { value: BackgroundStyle.STRONG_GRADIENT, label: 'Strong Gradient (강렬한 그라데이션)' },
  { value: BackgroundStyle.SPOTLIGHT, label: 'Spotlight (스포트라이트)' },
  { value: BackgroundStyle.DARK_GLOW, label: 'Dark Glow (어두운 광채)' },
  { value: BackgroundStyle.LIGHT_GLOW, label: 'Light Glow (밝은 광채)' },
];

export const DECORATIVE_STYLE_OPTIONS = [
  { value: DecorativeStyle.SPARKLE, label: 'Sparkle (반짝임)' },
  { value: DecorativeStyle.GLOSSY, label: 'Glossy (광택)' },
  { value: DecorativeStyle.GEOMETRIC, label: 'Geometric (기하학 패턴)' },
  { value: DecorativeStyle.MINIMAL, label: 'Minimal (단순 도형)' },
];

export const DECORATIVE_DENSITY_OPTIONS = [
  { value: DecorativeDensity.LOW, label: 'Low (적게)' },
  { value: DecorativeDensity.MEDIUM, label: 'Medium (보통)' },
  { value: DecorativeDensity.HIGH, label: 'High (많이)' },
];

export const TEXT_BLOCK_POSITION_OPTIONS = [
  { value: TextBlockPosition.NONE, label: '선택 안함 (None)' },
  { value: TextBlockPosition.TOP, label: '상단 (Top)' },
  { value: TextBlockPosition.BOTTOM, label: '하단 (Bottom)' },
  { value: TextBlockPosition.LEFT, label: '좌측 (Left)' },
  { value: TextBlockPosition.RIGHT, label: '우측 (Right)' },
  { value: TextBlockPosition.CENTER, label: '중앙 (Center)' },
];

export const TEXT_BLOCK_SIZE_OPTIONS = [
  { value: TextBlockSize.NONE, label: '선택 안함 (None)' },
  { value: TextBlockSize.SMALL, label: '작게' },
  { value: TextBlockSize.MEDIUM, label: '중간' },
  { value: TextBlockSize.LARGE, label: '크게' },
];

export const MODEL_USAGE_OPTIONS = [
  { value: ModelUsage.NO_MODEL, label: '모델 없음 (No Model)' },
  { value: ModelUsage.USE_MODEL, label: '모델 사용 (변형 필수)' },
];

export const SAMPLE_PRODUCTS = [
  "안티헤어로스 샴푸",
  "비타민 C 세럼",
  "프리미엄 가죽 소파",
  "유기농 단백질 쉐이크"
];
