import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import type { ItemCategory } from '@/types';
import styles from './ShopPage.module.css';

const CATEGORIES: { key: ItemCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Items', emoji: '🛒' },
  { key: 'hat', label: 'Hats', emoji: '🎩' },
  { key: 'outfit', label: 'Outfits', emoji: '👗' },
  { key: 'accessory', label: 'Accessories', emoji: '✨' },
  { key: 'background', label: 'Backgrounds', emoji: '🖼️' },
  { key: 'pet', label: 'Pets', emoji: '🐾' },
];

export default function ShopPage() {
  const { state, dispatch, addNotification } = useGame();
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [tab, setTab] = useState<'shop' | 'owned'>('shop');

  const filtered = state.shopItems.filter((item) => {
    if (tab === 'owned' && !item.owned) return false;
    if (tab === 'shop' && item.owned) return false;
    if (category !== 'all' && item.category !== category) return false;
    return true;
  });

  function handleBuy(id: string) {
    const item = state.shopItems.find((i) => i.id === id);
    if (!item) return;
    if (state.character.coins < item.price) {
      addNotification('Not enough coins! 🪙', 'info');
      return;
    }
    dispatch({ type: 'BUY_ITEM', payload: { id } });
    addNotification(`You bought ${item.name}! 🎉`, 'coins');
  }

  function handleEquip(id: string) {
    const item = state.shopItems.find((i) => i.id === id);
    if (!item) return;
    if (item.equipped) {
      dispatch({ type: 'UNEQUIP_ITEM', payload: { category: item.category } });
      addNotification(`Unequipped ${item.name}`, 'info');
    } else {
      dispatch({ type: 'EQUIP_ITEM', payload: { id } });
      addNotification(`Equipped ${item.name}! ✨`, 'info');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>🛍️ Cozy Shop</h1>
          <div className={styles.coinsBanner}>
            <span>🪙</span>
            <span className={styles.coinsAmount}>{state.character.coins}</span>
            <span className={styles.coinsLabel}>coins</span>
          </div>
        </div>
        <p className={styles.subtitle}>Spend your hard-earned coins to customize your character!</p>

        {/* Shop / Owned Tabs */}
        <div className={styles.tabRow}>
          <button
            className={[styles.tab, tab === 'shop' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('shop')}
          >
            🛒 Shop
          </button>
          <button
            className={[styles.tab, tab === 'owned' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('owned')}
          >
            🎒 My Items
          </button>
        </div>

        {/* Category Filter */}
        <div className={styles.categories}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={[styles.catBtn, category === c.key ? styles.catBtnActive : ''].join(' ')}
              onClick={() => setCategory(c.key)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>🌟</span>
          <p>{tab === 'owned' ? 'No owned items in this category yet.' : 'All items in this category are owned!'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item) => (
            <div key={item.id} className={[styles.card, item.equipped ? styles.cardEquipped : ''].join(' ')}>
              <div className={styles.cardEmoji} style={{ background: item.color + '33' }}>
                {item.emoji}
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardName}>{item.name}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.catTag}>{item.category}</span>
              </div>
              <div className={styles.cardActions}>
                {!item.owned ? (
                  <>
                    <div className={styles.price}>
                      <span>🪙</span>
                      <span>{item.price}</span>
                    </div>
                    <button
                      className={[
                        styles.buyBtn,
                        state.character.coins < item.price ? styles.buyBtnDisabled : ''
                      ].join(' ')}
                      onClick={() => handleBuy(item.id)}
                      disabled={state.character.coins < item.price}
                    >
                      {state.character.coins < item.price ? 'Need more coins' : 'Buy'}
                    </button>
                  </>
                ) : (
                  <button
                    className={[styles.equipBtn, item.equipped ? styles.equipBtnActive : ''].join(' ')}
                    onClick={() => handleEquip(item.id)}
                  >
                    {item.equipped ? '✓ Equipped' : 'Equip'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
