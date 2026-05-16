import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import Modal from '@/components/ui/Modal';
import styles from './AddProjectModal.module.css';

const PROJECT_COLORS = [
  '#ffb3d9', '#ffd3b6', '#ffd166', '#b5ead7', '#a8d8ea', '#c9b1ff', '#ff9a9e', '#7dbb9e'
];

const PROJECT_EMOJIS = ['📚', '🎨', '🏋️', '💼', '🎮', '🌱', '🏠', '🎵', '🧪', '✈️', '🍳', '🌟'];

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [emoji, setEmoji] = useState(PROJECT_EMOJIS[0]);
  const [deadline, setDeadline] = useState('');
  const [extensionDays, setExtensionDays] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_PROJECT',
      payload: {
        name: name.trim(),
        description: description.trim(),
        color,
        emoji,
        deadline: deadline || null,
        extensionDays,
      },
    });
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setEmoji(PROJECT_EMOJIS[0]);
    setDeadline('');
    setExtensionDays(0);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🗺️ New Project">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Project Name *</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Personal Website"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="What is this project about?"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Emoji</label>
          <div className={styles.emojiGrid}>
            {PROJECT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={[styles.emojiBtn, emoji === e ? styles.emojiBtnActive : ''].join(' ')}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Color</label>
          <div className={styles.colorGrid}>
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={[styles.colorBtn, color === c ? styles.colorBtnActive : ''].join(' ')}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Official Deadline</label>
            <input
              className={styles.input}
              type="date"
              value={deadline}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Grace Period (days)</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              max={30}
              value={extensionDays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExtensionDays(Number(e.target.value))}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Create Project 🗺️
        </button>
      </form>
    </Modal>
  );
}
