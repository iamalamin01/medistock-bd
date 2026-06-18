'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ title, children }) {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/');
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1>{title}</h1>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
