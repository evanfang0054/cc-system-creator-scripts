/**
 * 日期时间工具函数
 */

/**
 * 格式化时间为易读的格式: YYYY/MM/DD HH:mm:ss
 *
 * @example
 * formatDateTime(new Date())
 * // 返回: "2026/01/31 14:35:40"
 */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取当前时间戳的格式化字符串
 */
export function now(): string {
  return formatDateTime(new Date());
}
