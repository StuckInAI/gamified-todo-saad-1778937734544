import { useGame } from '@/hooks/useGame';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './CharacterPage.module.css';

export default function CharacterPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character, shopItems } = state;

  function handleEquip(itemId: string) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    dispatch({ type: 'EQUIP_ITEM', payload: { item } });
    const isNowEquipped = character.equipment[item.slot] !== item.id;
    addNotification(
      isNowEquipped ? `Equipped ${item.name}! ${item.emoji}` : `Unequipped ${item.name}`,
      'info'
    );
  }

  const ownedItems = shopItems.filter((i) => character.inventory.includes(i.id));

  const stats = [
    { label: 'Level', value: character.level, emoji: '⭐' },
    { label: 'Total XP', value: character.xp, emoji: '✨' },
    { label: 'Coins', value: character.coins, emoji: '🪙' },
    { label: 'Items Owned', value: character.inventory.length, emoji: '🎒' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🧝 Character</h1>
        <p className={styles.subtitle}>Your adventurer's profile and wardrobe.</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarBig}>
            <span className={styles.avatarEmoji}>🧝</span>
            {character.equipment.hat && (
              <span className={styles.avatarHat}>
                {shopItems.find((i) => i.id === character.equipment.hat)?.emoji}
              </span>
            )}
            {character.equipment.accessory && (
              <span className={styles.avatarAccessory}>
                {shopItems.find((i) => i.id === character.equipment.accessory)?.emoji}
              </span>
            )}
          </div>
          <div className={styles.characterInfo}>
            <h2 className={styles.characterName}>{character.name}</h2>
            <p className={styles.characterLevel}>Level {character.level} Adventurer</p>
            <p className={styles.characterMood}>Mood: {character.mood}</p>
          </div>
        </div>

        <div className={styles.xpSection}>
          <div className={styles.xpHeader}>
            <span className={styles.xpLabel}>XP Progress</span>
            <span className={styles.xpValue}>
              {character.xpInLevel} / {character.xpToNextLevel}
            </span>
          </div>
          <ProgressBar value={character.xpInLevel} max={character.xpToNextLevel} color="var(--color-primary)" />
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(({ label, value, emoji }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statEmoji}>{emoji}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.wardrobeSection}>
        <h2 className={styles.sectionTitle}>🎒 Wardrobe</h2>
        <p className={styles.sectionSubtitle}>Items you own — click to equip/unequip</p>

        <div className={styles.equippedRow}>
          <div className={styles.equippedSlot}>
            <span className={styles.slotLabel}>Hat</span>
            <span className={styles.slotValue}>
              {character.equipment.hat
                ? shopItems.find((i) => i.id === character.equipment.hat)?.emoji + ' ' +
                  shopItems.find((i) => i.id === character.equipment.hat)?.name
                : 'None'}
            </span>
          </div>
          <div className={styles.equippedSlot}>
            <span className={styles.slotLabel}>Accessory</span>
            <span className={styles.slotValue}>
              {character.equipment.accessory
                ? shopItems.find((i) => i.id === character.equipment.accessory)?.emoji + ' ' +
                  shopItems.find((i) => i.id === character.equipment.accessory)?.name
                : 'None'}
            </span>
          </div>
        </div>

        {ownedItems.length === 0 ? (
          <div className={styles.emptyWardrobe}>
            <span>🛍️</span>
            <p>No items yet! Visit the Shop to buy cosmetics.</p>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {ownedItems.map((item) => {
              const isEquipped = character.equipment[item.slot] === item.id;
              return (
                <button
                  key={item.id}
                  className={[
                    styles.itemCard,
                    isEquipped ? styles.itemCardEquipped : '',
                  ].join(' ')}
                  onClick={() => handleEquip(item.id)}
                >
                  <span className={styles.itemEmoji}>{item.emoji}</span>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemSlot}>{item.slot}</span>
                  <span className={styles.itemEquipStatus}>
                    {isEquipped ? '✅ Equipped' : item.slot}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
