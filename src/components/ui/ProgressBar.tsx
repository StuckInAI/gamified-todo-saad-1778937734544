import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function ProgressBar({ value, max, color = 'var(--color-primary)', size = 'md' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={[styles.track, size !== 'md' ? styles[size] : ''].join(' ')}>
      <div
        className={styles.fill}
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
