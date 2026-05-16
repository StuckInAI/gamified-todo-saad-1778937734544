import { useGame } from '@/hooks/useGame';
import { getMoodEmoji, getMoodText } from '@/lib/gameUtils';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './CharacterPage.module.css';

export default function CharacterPage() {
  const { state, dispatch } = useGame();
  const { character } = state;

  const equippedItems = state.shopItems.filter(
    (item) =>
      item.purchased &&
      (item.id === character.equipment.hat ||
        item.id === character.equipment.accessory ||
        item.id === character.equipment.background)
  );

  function handleUnequip(category: 'hat' | 'accessory' | 'background') {
    dispatch({ type: 'UNEQUIP_ITEM', payload: { category } });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🧝 Character</h1>
        <p className={styles.subtitle}>Your adventurer's profile</p>
      </div>

      <div className={styles.grid}>
        {/* Character Card */}
        <div className={styles.characterCard}>
          <div className={styles.avatarSection}>
            <div
              className={styles.avatarBg}
              style={
                character.equipment.background
                  ? {
                      background: state.shopItems.find(
                        (i) => i.id === character.equipment.background
                      )?.description,
                    }
                  : undefined
              }
            >
              <div className={styles.avatarWrap}>
                <span className={styles.avatarEmoji}>🧝</span>
                {character.equipment.hat && (
                  <span className={styles.hatEmoji}>
                    {state.shopItems.find((i) => i.id === character.equipment.hat)?.emoji}
                  </span>
                )}
                {character.equipment.accessory && (
                  <span className={styles.accessoryEmoji}>
                    {state.shopItems.find((i) => i.id === character.equipment.accessory)?.emoji}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.characterInfo}>
            <h2 className={styles.characterName}>{character.name}</h2>
            <p className={styles.characterMood}>
              {getMoodEmoji(character.mood)} {getMoodText(character.mood)}
            </p>
            <div className={styles.levelBadge}>Level {character.level}</div>
          </div>

          <div className={styles.xpSection}>
            <div className={styles.xpLabel}>
              <span>XP Progress</span>
              <span>
                {character.xp} / {character.xpToNextLevel}
              </span>
            </div>
            <ProgressBar
              value={character.xp % 100}
              max={100}
              color="var(--color-primary)"
            />
          </div>

          <div className={styles.coins}>
            <span>🪙</span>
            <span>{character.coins} coins</span>
          </div>
        </div>

        {/* Stats Card */}
        <div className={styles.statsCard}>
          <h3 className={styles.sectionTitle}>📊 Stats</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Tasks Completed</span>
              <span className={styles.statValue}>{character.stats.tasksCompleted}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Projects Completed</span>
              <span className={styles.statValue}>{character.stats.projectsCompleted}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Longest Streak</span>
              <span className={styles.statValue}>{character.stats.longestStreak} days</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Current Streak</span>
              <span className={styles.statValue}>{state.streak} days 🔥</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total XP Earned</span>
              <span className={styles.statValue}>{character.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Equipped Items */}
        <div className={styles.equippedCard}>
          <h3 className={styles.sectionTitle}>🎽 Equipped</h3>
          {equippedItems.length === 0 ? (
            <p className={styles.emptyText}>Nothing equipped yet. Visit the Shop!</p>
          ) : (
            <div className={styles.equippedList}>
              {equippedItems.map((item) => (
                <div key={item.id} className={styles.equippedItem}>
                  <span className={styles.equippedEmoji}>{item.emoji}</span>
                  <div className={styles.equippedInfo}>
                    <span className={styles.equippedName}>{item.name}</span>
                    <span className={styles.equippedCategory}>{item.category}</span>
                  </div>
                  <button
                    className={styles.unequipBtn}
                    onClick={() => handleUnequip(item.category as 'hat' | 'accessory' | 'background')}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quests Progress */}
        <div className={styles.questsCard}>
          <h3 className={styles.sectionTitle}>🏆 Quest Progress</h3>
          <div className={styles.questsList}>
            {state.quests.map((quest) => (
              <div key={quest.id} className={[styles.questItem, quest.completed ? styles.questCompleted : ''].join(' ')}>
                <div className={styles.questTop}>
                  <span className={styles.questEmoji}>{quest.emoji}</span>
                  <div className={styles.questInfo}>
                    <span className={styles.questTitle}>{quest.title}</span>
                    <span className={styles.questDesc}>{quest.description}</span>
                  </div>
                  {quest.completed && <span className={styles.questDone}>✅</span>}
                </div>
                {!quest.completed && (
                  <ProgressBar
                    value={quest.progress}
                    max={quest.requirement}
                    color="var(--color-secondary-dark)"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
