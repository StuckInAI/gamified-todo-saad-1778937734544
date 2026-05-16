import { useGame } from '@/hooks/useGame';
import type { ShopItem } from '@/types';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character } = state;

  function handleBuy(item: ShopItem) {
    if (character.purchasedItems.includes(item.id)) {
      addNotification('Already owned!', 'info');
      return;
    }
    if (character.coins < item.price) {
      addNotification('Not enough coins! 🪙', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { id: item.id } });
    addNotification(`Bought ${item.name}! ${item.emoji}`, 'coins');
  }

  function handleEquip(item: ShopItem) {
    dispatch({ type: 'EQUIP_ITEM', payload: { id: item.id } });
    addNotification(`Equipped ${item.name}! ${item.emoji}`, 'info');
  }

  const categories = ['hat', 'outfit', 'accessory'] as const;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>🛒 Cozy Shop</h1>
        <div className={styles.coinsBadge}>
          <span>🪙</span>
          <span>{character.coins} coins</span>
        </div>
      </div>

      {categories.map((cat) => (
        <section key={cat} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {cat === 'hat' ? '🎩' : cat === 'outfit' ? '👘' : '💍'} {cat.charAt(0).toUpperCase() + cat.slice(1)}s
          </h2>
          <div className={styles.itemGrid}>
            {state.shopItems.filter((i) => i.category === cat).map((item) => {
              const owned = character.purchasedItems.includes(item.id);
              const equipped = character.equipment[item.category] === item.id;
              return (
                <div
                  key={item.id}
                  className={[
                    styles.itemCard,
                    owned ? styles.owned : '',
                    equipped ? styles.equipped : '',
                  ].join(' ')}
                >
                  <div className={styles.itemEmoji}>{item.emoji}</div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemDesc}>{item.description}</p>
                    {item.effect && <p className={styles.itemEffect}>✨ {item.effect}</p>}
                    <div className={styles.itemMeta}>
                      <span className={styles.rarityBadge} data-rarity={item.rarity}>{item.rarity}</span>
                      <span className={styles.price}>🪙 {item.price}</span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    {equipped ? (
                      <button className={styles.equippedBtn} disabled>✓ Equipped</button>
                    ) : owned ? (
                      <button className={styles.equipBtn} onClick={() => handleEquip(item)}>Equip</button>
                    ) : (
                      <button
                        className={styles.buyBtn}
                        onClick={() => handleBuy(item)}
                        disabled={character.coins < item.price}
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
