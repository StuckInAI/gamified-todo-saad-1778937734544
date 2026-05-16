import styles from './Badge.module.css';

type BadgeProps = {
  label: string;
  color?: string;
  emoji?: string;
};

export default function Badge({ label, color, emoji }: BadgeProps) {
  return (
    <span className={styles.badge} style={color ? { background: color } : undefined}>
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  );
}
