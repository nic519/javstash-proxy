import type { Translation, SceneNode } from '../types';

const SEPARATOR = '\n🔷🔸🔷\n';

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
        coverUrl: s.coverUrl,
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
        coverUrl: s.coverUrl,
      }));
    }

    const parts = translated.split('🔷🔸🔷').map((p) => p.trim());

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
      coverUrl: s.coverUrl,
    }));
  }

  private async translateText(text: string): Promise<string> {
    let errorMsg = '翻译接口出错';

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

      if (!response.ok) {
        errorMsg = `翻译接口出错: HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = (await response.json()) as { code?: number; data?: string; message?: string };

      if (data.code !== 200) {
        errorMsg = `翻译接口出错: ${data.message ?? `错误码 ${data.code}`}`;
        throw new Error(errorMsg);
      }

      if (!data.data) {
        errorMsg = '翻译接口出错: 返回数据为空';
        throw new Error(errorMsg);
      }

      return data.data;
    } catch (error) {
      // 如果是我们自己抛出的错误，直接抛出
      if (error instanceof Error && error.message.startsWith('翻译接口出错')) {
        throw error;
      }
      // 网络错误等
      throw new Error(`翻译接口出错: ${error instanceof Error ? error.message : '网络请求失败'}`);
    }
  }
}