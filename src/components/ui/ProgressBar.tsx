import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showText?: boolean;
};

export default function ProgressBar({ value, max, color, label, showText = true }: ProgressBarProps) {
  const percent = Math.min(100, Math.floor((value / max) * 100));
  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%`, background: color || 'var(--color-primary)' }}
        />
      </div>
      {showText && (
        <span className={styles.text}>
          {value} / {max}
        </span>
      )}
    </div>
  );
}
