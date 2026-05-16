import { useGame } from '@/hooks/useGame';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character, shopItems } = state;

  function handleBuy(itemId: string) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    if (character.coins < item.price) {
      addNotification('Not enough coins! Complete quests to earn more.', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { itemId } });
    addNotification(`Bought ${item.name}! 🎉`, 'coins');
  }

  function handleEquip(itemId: string) {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    const slot = item.slot as 'hat' | 'accessory';
    const isEquipped = character.equipment[slot] === itemId;
    dispatch({ type: 'EQUIP_ITEM', payload: { itemId } });
    addNotification(isEquipped ? `Unequipped ${item.name}` : `Equipped ${item.name}! ✨`, 'info');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🛍️ Shop</h1>
        <div className={styles.coinsBadge}>
          <span>🪙</span>
          <span>{character.coins} coins</span>
        </div>
      </div>

      <div className={styles.grid}>
        {shopItems.map((item) => {
          const owned = character.inventory.includes(item.id);
          const slot = item.slot as 'hat' | 'accessory';
          const equipped = character.equipment[slot] === item.id;
          const canAfford = character.coins >= item.price;

          return (
            <div
              key={item.id}
              className={[
                styles.card,
                equipped ? styles.cardEquipped : owned ? styles.cardOwned : '',
              ].join(' ')}
            >
              <span className={styles.itemEmoji}>{item.emoji}</span>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemDesc}>{item.description}</p>
              <span className={styles.itemSlot}>{item.slot}</span>
              {!owned && (
                <p className={styles.itemPrice}>🪙 {item.price} coins</p>
              )}
              {!owned ? (
                <button
                  className={styles.buyBtn}
                  onClick={() => handleBuy(item.id)}
                  disabled={!canAfford}
                >
                  {canAfford ? `Buy for ${item.price} 🪙` : 'Not enough coins'}
                </button>
              ) : equipped ? (
                <button className={styles.equipBtn} onClick={() => handleEquip(item.id)}>
                  Unequip
                </button>
              ) : (
                <button className={styles.equipBtn} onClick={() => handleEquip(item.id)}>
                  Equip ✨
                </button>
              )}
              {equipped && (
                <div className={styles.equippedLabel}>✅ Equipped</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
