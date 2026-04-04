import type { Translation, SceneNode } from '../types';

// 用一个极低概率出现在正文中的分隔符，把多段文本合并成一次翻译请求。
const SEPARATOR = '\n🔷🔸🔷\n';

/**
 * DeepLX 翻译器。
 * 负责把场景标题和简介批量翻译为中文。
 */
export class DeepLXTranslator {
  private apiUrl: string;

  /**
   * @param apiUrl DeepLX 服务地址
   */
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * 批量翻译场景数据。
   * 会把标题和详情按顺序拼接后统一发送，减少请求次数。
   */
  async translateBatch(scenes: SceneNode[]): Promise<Translation[]> {
    if (scenes.length === 0) return [];

    // 按“标题、详情、标题、详情”的顺序收集文本，方便后面按原位还原。
    const texts: (string | null)[] = [];
    for (const s of scenes) {
      texts.push(s.title || null);
      texts.push(s.details || null);
    }

    const validTexts = texts.filter((t): t is string => t !== null && t.trim().length > 0);

    if (validTexts.length === 0) {
      // 没有可翻译内容时，直接回退为原始文本，避免无意义调用翻译接口。
      return scenes.map((s) => ({
        code: s.code ?? '',
        titleZh: s.title ?? '',
        summaryZh: s.details ?? '',
        coverUrl: s.coverUrl,
      }));
    }

    // 将有效文本合并为一次请求，降低翻译接口调用开销。
    const combined = validTexts.join(SEPARATOR);
    const translated = await this.translateText(combined);

    const parts = translated.split('🔷🔸🔷').map((p) => p.trim());

    // 按最初收集的顺序把翻译结果放回原位置。
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

  /**
   * 调用 DeepLX 接口翻译一段合并后的文本。
   */
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
      // 如果是上面已经归一化过的业务错误，直接透传即可。
      if (error instanceof Error && error.message.startsWith('翻译接口出错')) {
        throw error;
      }
      // 网络错误或解析异常统一包装成可读错误信息。
      throw new Error(`翻译接口出错: ${error instanceof Error ? error.message : '网络请求失败'}`);
    }
  }
}
