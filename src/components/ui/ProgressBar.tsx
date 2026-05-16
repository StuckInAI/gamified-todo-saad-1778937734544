import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
};

export default function ProgressBar({ value, max, color = 'var(--color-primary)', showLabel = false }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className={styles.wrap}>
        <div
          className={styles.bar}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <div className={styles.label}>
          <span>{value}</span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}
