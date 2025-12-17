import { JSDOM } from 'jsdom';

/**
 * 清理 HTML 内容，提取纯文本
 */
export function cleanHtmlContent(htmlContent: string): string {
  try {
    // 创建虚拟 DOM
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 移除 script 和 style 标签
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(element => element.remove());

    // 获取纯文本内容
    let textContent = document.body?.textContent || document.textContent || '';

    // 清理多余的空白字符
    textContent = textContent
      .replace(/\s+/g, ' ')           // 多个空格替换为一个
      .replace(/\n\s*\n/g, '\n')       // 多个换行替换为一个
      .replace(/^\s+|\s+$/g, '')       // 去除首尾空白
      .trim();

    return textContent;
  } catch (error) {
    // 如果 HTML 解析失败，返回原始内容的清理版本
    console.warn('HTML 解析失败，返回清理后的文本:', error instanceof Error ? error.message : String(error));

    // 简单的 HTML 标签移除（备用方案）
    return htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }
}

/**
 * 检查内容是否包含 HTML 标签
 */
export function hasHtmlTags(content: string): boolean {
  return /<[^>]+>/g.test(content);
}

/**
 * 清理内容（如果包含 HTML）
 */
export function cleanContent(content: string): string {
  if (hasHtmlTags(content)) {
    return cleanHtmlContent(content);
  }
  return content;
}