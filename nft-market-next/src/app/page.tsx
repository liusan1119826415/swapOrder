import { redirect } from 'next/navigation';

// 重定向到 /collections
export default function HomePage() {
  redirect('/collections');
}
