import { Channel, Tone } from './types';

export const CHANNEL_OPTIONS = [
  { value: Channel.SHOPPING_THUMBNAIL, label: '쇼핑몰 썸네일 (1:1)', aspectRatio: '1:1' },
  { value: Channel.NAVER_GFA, label: '네이버 GFA (1:1 / 1.25:1)', aspectRatio: '1:1' }, // GFA often uses square or slightly rect, safe to use 1:1 for generation base
  { value: Channel.META_FEED, label: '메타 광고 피드 (4:5)', aspectRatio: '3:4' }, // Closest approximation in Gemini API
  { value: Channel.META_STORY, label: '메타 광고 스토리/릴스 (9:16)', aspectRatio: '9:16' },
];

export const TONE_OPTIONS = [
  { value: Tone.LUXURIOUS, label: '고급스러운 (Luxury/Salon)' },
  { value: Tone.CLEAN, label: '깨끗한 (Clean Beauty)' },
  { value: Tone.NATURAL, label: '자연스러운 (Natural/Lifestyle)' },
  { value: Tone.VIBRANT, label: '생동감 있는 (Vibrant/Pop)' },
  { value: Tone.PROFESSIONAL, label: '전문적인 (Studio/Professional)' },
];

export const SAMPLE_PRODUCTS = [
  "안티헤어로스 샴푸",
  "비타민 C 세럼",
  "프리미엄 가죽 소파",
  "유기농 단백질 쉐이크"
];