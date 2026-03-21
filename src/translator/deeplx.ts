import type { Translation, SceneNode } from '../types';

const SEPARATOR = '\n===SEP===\n';

export class DeepLXTranslator {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Translate batch of scenes
   */
  async translateBatch(scenes: SceneNode[]): Promise<Translation[]> {
    if (scenes.length === 0) return [];

    // Collect texts to translate
    const texts: (string | null)[] = [];
    for (const s of scenes) {
      texts.push(s.title || null);
      texts.push(s.details || null);
    }

    const validTexts = texts.filter((t): t is string => t !== null && t.trim().length > 0);

    if (validTexts.length === 0) {
      return scenes.map((s) => ({
        code: s.code ?? '',
        titleZh: s.title ?? '',
        summaryZh: s.details ?? '',
      }));
    }

    // Batch translate
    const combined = validTexts.join(SEPARATOR);
    const translated = await this.translateText(combined);

    if (!translated) {
      // Translation failed, return original
      return scenes.map((s) => ({
        code: s.code ?? '',
        titleZh: s.title ?? '',
        summaryZh: s.details ?? '',
      }));
    }

    const parts = translated.split('===SEP===').map((p) => p.trim());

    // Restore to original positions
    let partIndex = 0;
    const finalTexts: string[] = [];
    for (const text of texts) {
      if (text && text.trim()) {
        finalTexts.push(parts[partIndex++] ?? '');
      } else {
        finalTexts.push('');
      }
    }

    return scenes.map((s, i) => ({
      code: s.code ?? '',
      titleZh: finalTexts[i * 2] ?? s.title ?? '',
      summaryZh: finalTexts[i * 2 + 1] ?? s.details ?? '',
    }));
  }

  private async translateText(text: string): Promise<string | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_lang: 'JA',
          target_lang: 'ZH',
        }),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as { code?: number; data?: string };
      return data.code === 200 ? data.data ?? null : null;
    } catch {
      return null;
    }
  }
}