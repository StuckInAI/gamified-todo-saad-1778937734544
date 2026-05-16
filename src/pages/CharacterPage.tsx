import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import type { EquipmentCategory } from '@/types';
import styles from './CharacterPage.module.css';
import { getMoodEmoji, getMoodLabel } from '@/lib/gameUtils';
import ProgressBar from '@/components/ui/ProgressBar';

export default function CharacterPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character } = state;
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(character.name);

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    dispatch({ type: 'RENAME_CHARACTER', payload: { name: nameInput.trim() } });
    setEditingName(false);
    addNotification('Name updated!', 'info');
  }

  function handleUnequip(category: EquipmentCategory) {
    dispatch({ type: 'UNEQUIP_ITEM', payload: { category } });
  }

  const ownedItems = state.shopItems.filter((i) => character.ownedItems.includes(i.id));
  const equippedItems = state.shopItems.filter((i) =>
    Object.values(character.equipment).includes(i.id)
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>👤 My Character</h1>
      </div>

      <div className={styles.grid}>
        {/* Character Card */}
        <div className={styles.characterCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarBig}>
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
            <div className={styles.moodBadge}>
              {getMoodEmoji(character.mood)} {getMoodLabel(character.mood)}
            </div>
          </div>

          <div className={styles.characterInfo}>
            {editingName ? (
              <form onSubmit={handleRename} className={styles.renameForm}>
                <input
                  className={styles.renameInput}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.renameSubmit}>✓</button>
                <button type="button" className={styles.renameCancel} onClick={() => setEditingName(false)}>✕</button>
              </form>
            ) : (
              <div className={styles.nameRow}>
                <h2 className={styles.characterName}>{character.name}</h2>
                <button className={styles.editBtn} onClick={() => setEditingName(true)}>✏️</button>
              </div>
            )}
            <p className={styles.levelText}>Level {character.level} Adventurer</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{character.level}</span>
              <span className={styles.statLabel}>Level</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{character.coins}</span>
              <span className={styles.statLabel}>🪙 Coins</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{state.streak}</span>
              <span className={styles.statLabel}>🔥 Streak</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{state.tasks.filter((t) => t.completed).length}</span>
              <span className={styles.statLabel}>✅ Done</span>
            </div>
          </div>

          <div className={styles.xpSection}>
            <div className={styles.xpLabel}>
              <span>XP Progress</span>
              <span>{character.xp} / {character.xpToNextLevel}</span>
            </div>
            <ProgressBar value={character.xp} max={character.xpToNextLevel} color="var(--color-primary)" />
          </div>
        </div>

        {/* Equipment */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🎒 Equipment</h2>
          {(['hat', 'accessory', 'outfit', 'background'] as EquipmentCategory[]).map((cat) => {
            const itemId = character.equipment[cat];
            const item = itemId ? state.shopItems.find((i) => i.id === itemId) : null;
            return (
              <div key={cat} className={styles.equipSlot}>
                <div className={styles.slotLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                {item ? (
                  <div className={styles.equippedItem}>
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <span className={styles.itemName}>{item.name}</span>
                    <button
                      className={styles.unequipBtn}
                      onClick={() => handleUnequip(cat)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className={styles.emptySlot}>Nothing equipped</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Owned Items */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🎁 Owned Items ({ownedItems.length})</h2>
          {ownedItems.length === 0 ? (
            <p className={styles.emptyText}>Visit the shop to get some items!</p>
          ) : (
            <div className={styles.itemsGrid}>
              {ownedItems.map((item) => {
                const isEquipped = equippedItems.some((e) => e.id === item.id);
                return (
                  <div key={item.id} className={[styles.ownedItem, isEquipped ? styles.equipped : ''].join(' ')}>
                    <span className={styles.ownedItemEmoji}>{item.emoji}</span>
                    <span className={styles.ownedItemName}>{item.name}</span>
                    {isEquipped ? (
                      <span className={styles.equippedTag}>Equipped</span>
                    ) : (
                      <button
                        className={styles.equipBtn}
                        onClick={() => dispatch({ type: 'EQUIP_ITEM', payload: { id: item.id } })}
                      >
                        Equip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
