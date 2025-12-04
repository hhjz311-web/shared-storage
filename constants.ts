import { Channel, Tone } from './types';

export const CHANNEL_OPTIONS = [
  { value: Channel.SHOPPING_THUMBNAIL, label: '쇼핑몰 썸네일 (1:1)', aspectRatio: '1:1' },
  { value: Channel.NAVER_GFA_SQUARE, label: '네이버 GFA (1:1)', aspectRatio: '1:1' }, 
  { value: Channel.NAVER_GFA_RECT, label: '네이버 GFA (1.25:1)', aspectRatio: '4:3' }, // Closest approximation for 1.25 (5:4) is 4:3 in standard presets, or rely on prompt crop
  { value: Channel.NAVER_GFA_CUSTOM, label: '네이버 GFA (커스텀)', aspectRatio: '1:1' }, // Default base for custom
  { value: Channel.META_FEED, label: '메타 광고 피드 (4:5)', aspectRatio: '3:4' }, // Closest approximation
  { value: Channel.META_STORY, label: '메타 광고 스토리/릴스 (9:16)', aspectRatio: '9:16' },
];

export const TONE_OPTIONS = [
  { value: Tone.LUXURIOUS, label: '고급스러운 (Luxury/Salon)' },
  { value: Tone.CLEAN, label: '깨끗한 (Clean Beauty)' },
  { value: Tone.NATURAL, label: '자연스러운 (Natural/Lifestyle)' },
  { value: Tone.VIBRANT, label: '생동감 있는 (Vibrant/Pop)' },
  { value: Tone.PROFESSIONAL, label: '전문적인 (Studio/Professional)' },
];

export const PRODUCT_SIZE_OPTIONS = [
  { value: 'Large', label: '메인 (크게)', prompt: 'Main Hero Product (Large Scale)' },
  { value: 'Medium', label: '기본 (중간)', prompt: 'Standard Product (Medium Scale)' },
  { value: 'Small', label: '보조 (작게)', prompt: 'Sub Element (Small Scale)' },
];

export const TEXT_POSITION_OPTIONS = [
  { value: 'top-left', label: '상단 좌측' },
  { value: 'top-center', label: '상단 중앙' },
  { value: 'top-right', label: '상단 우측' },
  { value: 'center', label: '정중앙' },
  { value: 'bottom-left', label: '하단 좌측' },
  { value: 'bottom-center', label: '하단 중앙' },
  { value: 'bottom-right', label: '하단 우측' },
];

export const SAMPLE_PRODUCTS = [
  "안티헤어로스 샴푸",
  "비타민 C 세럼",
  "프리미엄 가죽 소파",
  "유기농 단백질 쉐이크"
];