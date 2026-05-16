import { useGame } from '@/hooks/useGame';
import ProgressBar from '@/components/ui/ProgressBar';
import { getMoodEmoji, getMoodText } from '@/lib/gameUtils';
import styles from './CharacterPage.module.css';

export default function CharacterPage() {
  const { state, dispatch } = useGame();
  const { character } = state;

  const equippedHat = character.equipment.hat
    ? state.shopItems.find((i) => i.id === character.equipment.hat)
    : null;
  const equippedAccessory = character.equipment.accessory
    ? state.shopItems.find((i) => i.id === character.equipment.accessory)
    : null;
  const equippedOutfit = character.equipment.outfit
    ? state.shopItems.find((i) => i.id === character.equipment.outfit)
    : null;

  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const achievements = [
    { emoji: '🌱', name: 'First Quest', desc: 'Complete your first task', unlocked: completedTasks >= 1 },
    { emoji: '⭐', name: 'Rising Star', desc: 'Complete 5 tasks', unlocked: completedTasks >= 5 },
    { emoji: '🔥', name: 'On Fire', desc: 'Complete 10 tasks', unlocked: completedTasks >= 10 },
    { emoji: '👑', name: 'Quest Master', desc: 'Complete 25 tasks', unlocked: completedTasks >= 25 },
    { emoji: '🪙', name: 'Coin Hoarder', desc: 'Collect 200 coins', unlocked: character.coins >= 200 },
    { emoji: '🛒', name: 'Shopaholic', desc: 'Own 3 items', unlocked: character.ownedItems.length >= 3 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🧝 Your Character</h1>
        <p className={styles.subtitle}>Level up by completing quests!</p>
      </div>

      <div className={styles.characterCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarBig}>
            <span className={styles.avatarMainEmoji}>🧝</span>
            {equippedHat && (
              <span className={styles.avatarHatEmoji}>{equippedHat.emoji}</span>
            )}
            {equippedAccessory && (
              <span className={styles.avatarAccessoryEmoji}>{equippedAccessory.emoji}</span>
            )}
            {equippedOutfit && (
              <span className={styles.avatarOutfitEmoji}>{equippedOutfit.emoji}</span>
            )}
          </div>
          <div className={styles.moodDisplay}>
            {getMoodEmoji(character.mood)} {getMoodText(character.mood)}
          </div>
        </div>

        <div className={styles.statsSection}>
          <div>
            <h2 className={styles.charName}>{character.name}</h2>
            <span className={styles.levelBadge}>⚔️ Level {character.level}</span>
          </div>

          <div className={styles.xpBar}>
            <span className={styles.xpLabel}>
              {character.xp} / {character.xpToNextLevel} XP to next level
            </span>
            <ProgressBar value={character.xp} max={character.xpToNextLevel} color="var(--color-primary)" />
          </div>

          <div className={styles.statRow}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>🪙 Coins</span>
              <span className={styles.statValue}>{character.coins}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>✅ Completed</span>
              <span className={styles.statValue}>{completedTasks}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>🔥 Streak</span>
              <span className={styles.statValue}>{state.streak}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.equipmentSection}>
        <h2 className={styles.sectionTitle}>⚔️ Equipment</h2>
        <div className={styles.equipmentGrid}>
          {(['hat', 'accessory', 'outfit'] as const).map((slot) => {
            const item = slot === 'hat' ? equippedHat : slot === 'accessory' ? equippedAccessory : equippedOutfit;
            return (
              <div key={slot} className={styles.equipmentSlot}>
                <span className={styles.slotLabel}>{slot}</span>
                {item ? (
                  <>
                    <span className={styles.slotEmoji}>{item.emoji}</span>
                    <span className={styles.slotName}>{item.name}</span>
                    <button
                      className={styles.unequipBtn}
                      onClick={() => dispatch({ type: 'UNEQUIP_ITEM', payload: { slot } })}
                    >
                      Unequip
                    </button>
                  </>
                ) : (
                  <>
                    <span className={styles.slotEmoji}>❓</span>
                    <span className={styles.slotEmpty}>Nothing equipped</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.achievementsSection}>
        <h2 className={styles.sectionTitle}>🏆 Achievements</h2>
        <div className={styles.achievementsList}>
          {achievements.map((a) => (
            <div
              key={a.name}
              className={styles.achievement}
              style={{ opacity: a.unlocked ? 1 : 0.4 }}
            >
              <span className={styles.achievementEmoji}>{a.emoji}</span>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementName}>{a.name} {a.unlocked ? '✅' : '🔒'}</span>
                <span className={styles.achievementDesc}>{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
