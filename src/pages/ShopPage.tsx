import { useGame } from '@/hooks/useGame';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character, shopItems } = state;

  function handleBuy(itemId: string) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    const slot = item.slot as 'hat' | 'accessory';
    if (character.inventory.includes(item.id)) return;
    if (character.coins < item.price) {
      addNotification('Not enough coins! 😢', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { item } });
    addNotification(`Bought ${item.name}! ${item.emoji}`, 'info');
    void slot;
  }

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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🛍️ Cozy Shop</h1>
        <p className={styles.subtitle}>Spend your hard-earned coins on cosmetics!</p>
      </div>

      <div className={styles.balance}>
        <span>🪙</span>
        <span>{character.coins} coins</span>
      </div>

      <div className={styles.grid}>
        {shopItems.map((item) => {
          const owned = character.inventory.includes(item.id);
          const slot = item.slot as 'hat' | 'accessory';
          const isEquipped = character.equipment[slot] === item.id;
          return (
            <div
              key={item.id}
              className={[
                styles.itemCard,
                owned ? styles.itemCardOwned : '',
                isEquipped ? styles.itemCardEquipped : '',
              ].join(' ')}
            >
              <span className={styles.itemEmoji}>{item.emoji}</span>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemDesc}>{item.description}</span>
              <span className={styles.itemSlot}>{item.slot}</span>
              <span className={styles.itemPrice}>🪙 {item.price}</span>
              {owned ? (
                <button className={styles.equipBtn} onClick={() => handleEquip(item.id)}>
                  {isEquipped ? '✅ Equipped' : 'Equip'}
                </button>
              ) : (
                <button
                  className={styles.buyBtn}
                  onClick={() => handleBuy(item.id)}
                  disabled={character.coins < item.price}
                >
                  Buy
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
