import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import type { EquipmentSlot } from '@/types';
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

  function handleUnequip(category: EquipmentSlot) {
    dispatch({ type: 'UNEQUIP_ITEM', payload: { category } });
  }

  const ownedItems = state.shopItems.filter((i) => character.purchasedItems.includes(i.id));

  const xpPercent = Math.min(100, Math.round((character.xp / character.xpToNextLevel) * 100));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>🧝 My Character</h1>
      </div>

      <div className={styles.grid}>
        {/* Character Card */}
        <div className={styles.characterCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarBig}>
              <span className={styles.avatarEmoji}>🧝</span>
              {character.equipment.hat && (
                <span className={styles.equipHat}>
                  {state.shopItems.find((i) => i.id === character.equipment.hat)?.emoji}
                </span>
              )}
            </div>
            <div className={styles.nameLine}>
              {editing ? (
                <>
                  <input
                    className={styles.nameInput}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={handleRename}>Save</button>
                </>
              ) : (
                <>
                  <h2 className={styles.charName}>{character.name}</h2>
                  <button className={styles.editBtn} onClick={() => setEditing(true)}>✏️</button>
                </>
              )}
            </div>
            <p className={styles.levelBadge}>Level {character.level} Adventurer</p>
          </div>

          <div className={styles.statsSection}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>⭐ XP</span>
              <div className={styles.xpBarWrap}>
                <div className={styles.xpBar} style={{ width: `${xpPercent}%` }} />
              </div>
              <span className={styles.statValue}>{character.xp} / {character.xpToNextLevel}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>🪙 Coins</span>
              <span className={styles.statValue}>{character.coins}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>😊 Mood</span>
              <span className={styles.statValue}>{character.mood}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>🔥 Streak</span>
              <span className={styles.statValue}>{state.streak} days</span>
            </div>
          </div>
        </div>

        {/* Equipment Card */}
        <div className={styles.equipmentCard}>
          <h2 className={styles.sectionTitle}>🎩 Equipment</h2>
          {(['hat', 'outfit', 'accessory'] as EquipmentSlot[]).map((slot) => {
            const equippedId = character.equipment[slot];
            const equippedItem = equippedId ? state.shopItems.find((i) => i.id === equippedId) : null;
            return (
              <div key={slot} className={styles.equipSlot}>
                <span className={styles.slotLabel}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
                {equippedItem ? (
                  <div className={styles.equippedItem}>
                    <span>{equippedItem.emoji}</span>
                    <span>{equippedItem.name}</span>
                    <button className={styles.unequipBtn} onClick={() => handleUnequip(slot)}>Remove</button>
                  </div>
                ) : (
                  <span className={styles.emptySlot}>Nothing equipped</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Owned Items */}
        <div className={styles.inventoryCard}>
          <h2 className={styles.sectionTitle}>🎒 Inventory</h2>
          {ownedItems.length === 0 ? (
            <p className={styles.emptyMsg}>No items yet — visit the Shop!</p>
          ) : (
            <div className={styles.itemGrid}>
              {ownedItems.map((item) => (
                <div key={item.id} className={styles.invItem}>
                  <span className={styles.invEmoji}>{item.emoji}</span>
                  <span className={styles.invName}>{item.name}</span>
                  {character.equipment[item.category] === item.id ? (
                    <span className={styles.equippedBadge}>Equipped</span>
                  ) : (
                    <button
                      className={styles.equipBtn}
                      onClick={() => dispatch({ type: 'EQUIP_ITEM', payload: { id: item.id } })}
                    >
                      Equip
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
