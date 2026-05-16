import { useGame } from '@/hooks/useGame';
import type { ShopItem } from '@/types';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();

  const grouped = {
    hat: state.shopItems.filter((i) => i.category === 'hat'),
    accessory: state.shopItems.filter((i) => i.category === 'accessory'),
    outfit: state.shopItems.filter((i) => i.category === 'outfit'),
  };

  function handleBuy(id: string) {
    const item = state.shopItems.find((i) => i.id === id);
    if (!item) return;
    if (state.character.coins < item.cost) {
      addNotification('Not enough coins! 🪙', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { id } });
    addNotification(`Bought ${item.name}!`, 'coins');
  }

  function handleEquip(id: string) {
    dispatch({ type: 'EQUIP_ITEM', payload: { id } });
  }

  function renderItem(item: ShopItem) {
    return (
      <div key={item.id} className={styles.item}>
        <span className={styles.itemEmoji}>{item.emoji}</span>
        <div className={styles.itemInfo}>
          <p className={styles.itemName}>{item.name}</p>
          <p className={styles.itemDesc}>{item.description}</p>
        </div>
        <div className={styles.itemActions}>
          {item.owned ? (
            <button
              className={[styles.equipBtn, item.equipped ? styles.equipped : ''].join(' ')}
              onClick={() => handleEquip(item.id)}
            >
              {item.equipped ? 'Equipped ✓' : 'Equip'}
            </button>
          ) : (
            <button
              className={styles.buyBtn}
              onClick={() => handleBuy(item.id)}
              disabled={state.character.coins < item.cost}
            >
              🪙 {item.cost}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🛒 Cozy Shop</h1>
        <div className={styles.coins}>
          <span>🪙</span>
          <span>{state.character.coins} coins</span>
        </div>
      </div>

      {(['hat', 'accessory', 'outfit'] as const).map((cat) => (
        <section key={cat} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {cat === 'hat' ? '🎩 Hats' : cat === 'accessory' ? '💎 Accessories' : '👗 Outfits'}
          </h2>
          <div className={styles.itemList}>
            {grouped[cat].length === 0 ? (
              <p className={styles.empty}>No items yet</p>
            ) : (
              grouped[cat].map(renderItem)
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
