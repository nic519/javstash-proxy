import { redirect } from 'next/navigation';

/**
 * 首页组件
 * 自动重定向到管理页面
 */
export default function HomePage() {
  redirect('/admin');
}
