import { useGame } from '@/hooks/useGame';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character, shopItems } = state;

  function handleBuy(itemId: string) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    if (character.purchasedItems.includes(item.id)) {
      addNotification('Already owned!', 'info');
      return;
    }
    if (character.coins < item.price) {
      addNotification('Not enough coins! 😢', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { id: itemId } });
    addNotification(`Bought ${item.emoji} ${item.name}!`, 'coins');
  }

  function handleEquip(itemId: string) {
    dispatch({ type: 'EQUIP_ITEM', payload: { id: itemId } });
    addNotification('Item equipped! ✨', 'info');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🛒 Cozy Shop</h1>
        <div className={styles.coinsBadge}>
          <span>🪙</span>
          <span>{character.coins} coins</span>
        </div>
      </div>

      <div className={styles.grid}>
        {shopItems.map((item) => {
          const owned = character.purchasedItems.includes(item.id);
          const equipped = Object.values(character.equipment).includes(item.id);
          const canAfford = character.coins >= item.price;

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
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemDesc}>{item.description}</p>
                {item.effect && <p className={styles.itemEffect}>✨ {item.effect}</p>}
                <span className={styles.categoryTag}>{item.category}</span>
              </div>
              <div className={styles.itemActions}>
                {equipped ? (
                  <span className={styles.equippedBadge}>✅ Equipped</span>
                ) : owned ? (
                  <button className={styles.equipBtn} onClick={() => handleEquip(item.id)}>
                    Equip
                  </button>
                ) : (
                  <button
                    className={[styles.buyBtn, !canAfford ? styles.disabled : ''].join(' ')}
                    onClick={() => handleBuy(item.id)}
                    disabled={!canAfford}
                  >
                    🪙 {item.price}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
