import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import type { EquipmentCategory } from '@/types';
import styles from './CharacterPage.module.css';

export default function CharacterPage() {
  const { state, dispatch } = useGame();
  const { character } = state;
  const [nameInput, setNameInput] = useState(character.name);
  const [editing, setEditing] = useState(false);

  function handleRename() {
    if (nameInput.trim() && nameInput.trim() !== character.name) {
      dispatch({ type: 'RENAME_CHARACTER', payload: { name: nameInput.trim() } });
    }
    setEditing(false);
  }

  function handleUnequip(category: EquipmentCategory) {
    dispatch({ type: 'UNEQUIP_ITEM', payload: { category } });
  }

  const ownedItems = state.shopItems.filter((i) => character.purchasedItems.includes(i.id));

  const xpPercent = Math.round((character.xp / character.xpToNextLevel) * 100);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🧝 My Character</h1>
      </div>

      <div className={styles.grid}>
        {/* Character Card */}
        <div className={styles.characterCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarBig}>
              <span className={styles.avatarEmoji}>🧝</span>
              {character.equipment.hat && (
                <span className={styles.hatOverlay}>
                  {state.shopItems.find((i) => i.id === character.equipment.hat)?.emoji}
                </span>
              )}
              {character.equipment.accessory && (
                <span className={styles.accessoryOverlay}>
                  {state.shopItems.find((i) => i.id === character.equipment.accessory)?.emoji}
                </span>
              )}
            </div>
          </div>

          {editing ? (
            <div className={styles.nameEdit}>
              <input
                className={styles.nameInput}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
              <button className={styles.saveBtn} onClick={handleRename}>Save</button>
              <button className={styles.cancelBtn} onClick={() => { setEditing(false); setNameInput(character.name); }}>Cancel</button>
            </div>
          ) : (
            <div className={styles.nameRow}>
              <h2 className={styles.characterName}>{character.name}</h2>
              <button className={styles.editBtn} onClick={() => setEditing(true)}>✏️</button>
            </div>
          )}

          <p className={styles.levelText}>Level {character.level} Adventurer</p>

          <div className={styles.xpBar}>
            <div className={styles.xpBarFill} style={{ width: `${xpPercent}%` }} />
          </div>
          <p className={styles.xpText}>{character.xp} / {character.xpToNextLevel} XP</p>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statEmoji}>🪙</span>
              <span className={styles.statValue}>{character.coins}</span>
              <span className={styles.statLabel}>Coins</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statEmoji}>⚔️</span>
              <span className={styles.statValue}>{state.tasks.filter((t) => t.completed).length}</span>
              <span className={styles.statLabel}>Quests Done</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statEmoji}>🔥</span>
              <span className={styles.statValue}>{state.streak}</span>
              <span className={styles.statLabel}>Streak</span>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className={styles.equipmentCard}>
          <h3 className={styles.sectionTitle}>⚔️ Equipment</h3>
          {(['hat', 'accessory', 'weapon'] as EquipmentCategory[]).map((cat) => {
            const equippedId = character.equipment[cat];
            const equippedItem = equippedId ? state.shopItems.find((i) => i.id === equippedId) : null;
            return (
              <div key={cat} className={styles.equipSlot}>
                <span className={styles.equipSlotLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                {equippedItem ? (
                  <div className={styles.equippedItem}>
                    <span>{equippedItem.emoji}</span>
                    <span>{equippedItem.name}</span>
                    <button className={styles.unequipBtn} onClick={() => handleUnequip(cat)}>Remove</button>
                  </div>
                ) : (
                  <span className={styles.emptySlot}>— empty —</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Owned Items */}
        <div className={styles.inventoryCard}>
          <h3 className={styles.sectionTitle}>🎒 Inventory</h3>
          {ownedItems.length === 0 ? (
            <p className={styles.emptyText}>No items yet. Visit the shop!</p>
          ) : (
            <div className={styles.itemGrid}>
              {ownedItems.map((item) => {
                const isEquipped = Object.values(character.equipment).includes(item.id);
                return (
                  <div key={item.id} className={[styles.inventoryItem, isEquipped ? styles.equippedHighlight : ''].join(' ')}>
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <span className={styles.itemName}>{item.name}</span>
                    {isEquipped && <span className={styles.equippedBadge}>Equipped</span>}
                    {!isEquipped && (
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
