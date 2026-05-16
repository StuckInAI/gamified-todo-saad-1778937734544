import { useGame } from '@/hooks/useGame';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();
  const { character } = state;

  const grouped = {
    hat: state.shopItems.filter((i) => i.type === 'hat'),
    accessory: state.shopItems.filter((i) => i.type === 'accessory'),
    outfit: state.shopItems.filter((i) => i.type === 'outfit'),
  };

  function handleBuy(itemId: string, price: number) {
    if (character.coins < price) {
      addNotification('Not enough coins! 😢', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { itemId } });
    addNotification('Item purchased! 🛒', 'info');
  }

  function handleEquip(itemId: string) {
    dispatch({ type: 'EQUIP_ITEM', payload: { itemId } });
    addNotification('Item equipped! ✨', 'info');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🛒 Cozy Shop</h1>
        <p className={styles.subtitle}>Spend your hard-earned coins on items for your character!</p>
      </div>

      <div className={styles.coinsBanner}>
        🪙 {character.coins} coins available
      </div>

      {(['hat', 'accessory', 'outfit'] as const).map((type) => (
        <div key={type}>
          <h2 className={styles.sectionTitle}>
            {type === 'hat' ? '🎩 Hats' : type === 'accessory' ? '✨ Accessories' : '👗 Outfits'}
          </h2>
          <div className={styles.grid}>
            {grouped[type].map((item) => {
              const owned = character.ownedItems.includes(item.id);
              const equipped = character.equipment[type] === item.id;
              return (
                <div
                  key={item.id}
                  className={[
                    styles.itemCard,
                    owned ? styles.itemCardOwned : '',
                    equipped ? styles.itemCardEquipped : '',
                  ].join(' ')}
                >
                  <span className={styles.itemEmoji}>{item.emoji}</span>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemDesc}>{item.description}</span>
                  {!owned && (
                    <span className={styles.itemPrice}>🪙 {item.price}</span>
                  )}
                  {equipped ? (
                    <span className={styles.equippedLabel}>✅ Equipped</span>
                  ) : owned ? (
                    <button className={styles.equipBtn} onClick={() => handleEquip(item.id)}>
                      Equip
                    </button>
                  ) : (
                    <button
                      className={[
                        styles.buyBtn,
                        character.coins < item.price ? styles.buyBtnDisabled : '',
                      ].join(' ')}
                      onClick={() => handleBuy(item.id, item.price)}
                      disabled={character.coins < item.price}
                    >
                      Buy 🪙 {item.price}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
