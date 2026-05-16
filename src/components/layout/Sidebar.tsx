import { NavLink } from 'react-router-dom';
import { Home, Sword, ShoppingBag, User } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { getMoodEmoji } from '@/lib/gameUtils';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/quests', icon: Sword, label: 'Quests' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  { to: '/character', icon: User, label: 'Character' },
];

export default function Sidebar() {
  const { state } = useGame();
  const { character } = state;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoEmoji}>🌟</span>
        <span className={styles.logoText}>CozyQuest</span>
      </div>

      <div className={styles.characterPreview}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatarEmoji}>🧝</span>
          {character.equipment.hat && (
            <span className={styles.avatarHat}>
              {state.shopItems.find((i) => i.id === character.equipment.hat)?.emoji}
            </span>
          )}
        </div>
        <div className={styles.characterInfo}>
          <p className={styles.characterName}>{character.name}</p>
          <p className={styles.characterLevel}>Lv.{character.level} {getMoodEmoji(character.mood)}</p>
        </div>
        <div className={styles.coinsBadge}>
          <span>🪙</span>
          <span>{character.coins}</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.streakBadge}>
        <span>🔥</span>
        <span>{state.streak} day streak</span>
      </div>
    </aside>
  );
}
