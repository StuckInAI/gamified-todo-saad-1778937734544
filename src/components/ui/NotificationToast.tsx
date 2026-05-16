import { useGame } from '@/hooks/useGame';
import styles from './NotificationToast.module.css';

export default function NotificationToast() {
  const { notifications } = useGame();

  if (notifications.length === 0) return null;

  return (
    <div className={styles.container}>
      {notifications.map((n) => (
        <div key={n.id} className={[styles.toast, styles[n.type]].join(' ')}>
          <span className={styles.icon}>
            {n.type === 'xp' && '⭐'}
            {n.type === 'coins' && '🪙'}
            {n.type === 'levelup' && '🎉'}
            {n.type === 'info' && '✨'}
          </span>
          <span className={styles.message}>{n.message}</span>
        </div>
      ))}
    </div>
  );
}
