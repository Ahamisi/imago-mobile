/**
 * Weekly Delivery service.
 * Fetches the mother's precomputed weekly delivery (CMS spec §10) and maps it
 * onto the Tips/Stories UI shape the app already renders.
 */
import apiClient from './apiClient';

export interface DeliveryMedia {
  id: string;
  type: 'image' | 'video_embed' | 'video_file' | 'infographic';
  url: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  duration?: number;
  altText?: string;
  videoChannel?: string;
}

export interface DeliveryItem {
  id: string;
  title: string;
  body: string;
  contentType: string;
  tags: string[];
  sourceUrl?: string;
  media: DeliveryMedia[];
}

export interface StorySlide {
  type: 'cover' | 'text';
  image?: string | null;
  title?: string;
  subtitle?: string;
  text?: string;
}

export interface DeliveryTopic {
  id: string;
  title: string;
  subtitle?: string;
  coverImageUrl: string;
  category: string;
  estimatedReadMins?: number;
  items: DeliveryItem[];
  slides?: StorySlide[];
}

export interface CurrentDelivery {
  id: string;
  gestationalWeek: number;
  scheduledAt: string;
  deliveredAt?: string;
  status: string;
  topics: DeliveryTopic[];
}

// UI shapes consumed by TipsScreen / TipStoryViewer.
export interface TipSlide {
  id: string;
  image?: string;
  backgroundColor?: string;
  title: string;
  content: string;
  duration?: number;
  isTextOnly?: boolean;
}

export interface Tip {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  slides: TipSlide[];
  isNew?: boolean;
}

// Solid background per category for text-only slides (no image/video).
const CATEGORY_COLORS: Record<string, string> = {
  baby_dev: '#0E5DD8',
  nutrition: '#10B981',
  antenatal_care: '#6366F1',
  warning_signs: '#EF4444',
  mental_health: '#EC4899',
  symptoms: '#F59E0B',
  postpartum_prep: '#8B5CF6',
};

/** Strip the light markdown the backend stores so it renders cleanly as plain text. */
function stripMarkdown(md: string): string {
  return (md || '')
    .replace(/^#+\s*/gm, '') // headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/(^|[^_])_([^_]+)_/g, '$1$2') // italic
    .replace(/^\s*[-*]\s+/gm, '• ') // bullets
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Pick a renderable image for a slide from an item's media, if any. */
function slideImage(item: DeliveryItem): string | undefined {
  const image = item.media?.find((m) => m.type === 'image' || m.type === 'infographic');
  if (image?.url) return image.url;
  const video = item.media?.find((m) => m.thumbnailUrl);
  return video?.thumbnailUrl;
}

/** Map a delivery topic to a Tip (story card). */
function topicToTip(topic: DeliveryTopic): Tip {
  const bg = CATEGORY_COLORS[topic.category] || '#0E5DD8';

  let slides: TipSlide[];
  if (topic.slides && topic.slides.length > 0) {
    // Preferred: the backend story template (cover slide + short text slides).
    slides = topic.slides.map((s, i) => {
      if (s.type === 'cover') {
        return {
          id: `${topic.id}-cover`,
          title: s.title || topic.title,
          content: s.subtitle || '',
          image: s.image || undefined,
          isTextOnly: !s.image, // titled colour card until a real cover exists
          backgroundColor: bg,
          duration: 4,
        };
      }
      // Text slides render as short, readable colour cards.
      return {
        id: `${topic.id}-t${i}`,
        title: '',
        content: s.text || '',
        isTextOnly: true,
        backgroundColor: bg,
        duration: 6,
      };
    });
  } else {
    // Fallback (older payloads): one slide per item.
    slides = (topic.items || []).map((item) => {
      const image = slideImage(item);
      return {
        id: item.id,
        title: item.title,
        content: stripMarkdown(item.body),
        image,
        isTextOnly: !image,
        backgroundColor: bg,
        duration: 6,
      };
    });
  }

  return {
    id: topic.id,
    title: topic.title,
    category: topic.category,
    coverImage: topic.coverImageUrl,
    slides,
    isNew: true,
  };
}

/** GET the current weekly delivery, or null if none is available yet. */
export async function getCurrentDelivery(): Promise<CurrentDelivery | null> {
  const response = await apiClient.get('/deliveries/current', {
    headers: { 'X-Skip-Success-Notification': 'true' },
  });
  return response.data?.data ?? null;
}

/** Fetch the current delivery already mapped to the Tips/Stories shape. */
export async function getWeeklyTips(): Promise<Tip[]> {
  const delivery = await getCurrentDelivery();
  if (!delivery || !delivery.topics?.length) return [];
  return delivery.topics.map(topicToTip);
}

/**
 * Browse the evergreen content library by category (the category tabs).
 * Pass no category (or 'trending') for the weekly delivery instead.
 */
export async function getLibraryTips(category?: string): Promise<Tip[]> {
  if (!category || category === 'trending') return getWeeklyTips();
  const response = await apiClient.get('/content-library', {
    params: { category },
    headers: { 'X-Skip-Success-Notification': 'true' },
  });
  const topics: DeliveryTopic[] = response.data?.data?.topics ?? [];
  return topics.map(topicToTip);
}

export default { getCurrentDelivery, getWeeklyTips, getLibraryTips };
