import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import NotificationToast from '@/components/ui/NotificationToast';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
      <NotificationToast />
    </div>
  );
}
