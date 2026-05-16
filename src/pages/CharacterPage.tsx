import { useGame } from '@/hooks/useGame';
import { getMoodEmoji } from '@/lib/gameUtils';
import ProgressBar from '@/components/ui/ProgressBar';

const containerStyle: React.CSSProperties = {
  padding: '32px',
  maxWidth: '700px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '2px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '28px',
  fontWeight: 800,
  color: 'var(--color-text)',
  marginBottom: '24px',
};

export default function CharacterPage() {
  const { state } = useGame();
  const { character } = state;

  const equippedItems = state.shopItems.filter(
    (item) =>
      character.equipment.hat === item.id ||
      character.equipment.accessory === item.id
  );

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>👤 Character</h1>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '56px',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            🧝
            {character.equipment.hat && (
              <span
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-6px',
                  fontSize: '28px',
                }}
              >
                {state.shopItems.find((i) => i.id === character.equipment.hat)?.emoji}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--color-text)',
              }}
            >
              {character.name}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Level {character.level} &middot; Mood: {getMoodEmoji(character.mood)} {character.mood}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 14px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                🪙 {character.coins} coins
              </span>
              <span
                style={{
                  background: 'var(--color-secondary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 14px',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                🌟 {character.xp} XP total
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginBottom: '6px',
            }}
          >
            <span>XP Progress to Level {character.level + 1}</span>
            <span>
              {character.xp} / {character.xpToNextLevel}
            </span>
          </div>
          <ProgressBar
            value={character.xp}
            max={character.xpToNextLevel}
            color="var(--color-primary)"
          />
        </div>
      </div>

      <div style={cardStyle}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '16px',
          }}
        >
          🎒 Equipped Items
        </h3>
        {equippedItems.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            No items equipped. Visit the Shop to buy gear!
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {equippedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-primary-light)',
                  border: '2px solid var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    {item.slot}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '16px',
          }}
        >
          📦 Inventory
        </h3>
        {character.inventory.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Your inventory is empty. Complete quests and buy items!
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {character.inventory.map((itemId) => {
              const item = state.shopItems.find((i) => i.id === itemId);
              if (!item) return null;
              const isEquipped =
                character.equipment.hat === itemId ||
                character.equipment.accessory === itemId;
              return (
                <div
                  key={itemId}
                  style={{
                    background: isEquipped ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    border: `2px solid ${
                      isEquipped ? 'var(--color-primary)' : 'var(--color-border)'
                    }`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: isEquipped ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {isEquipped ? '✅ Equipped' : item.slot}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '16px',
          }}
        >
          📊 Stats
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { label: 'Tasks Done', value: state.tasks.filter((t) => t.completed).length, emoji: '✅' },
            { label: 'Active Tasks', value: state.tasks.filter((t) => !t.completed).length, emoji: '📝' },
            { label: 'Projects', value: state.projects.length, emoji: '🗺️' },
            { label: 'Day Streak', value: state.streak, emoji: '🔥' },
            { label: 'Items Owned', value: character.inventory.length, emoji: '🎒' },
            { label: 'Level', value: character.level, emoji: '⭐' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.emoji}</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--color-primary-dark)',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
