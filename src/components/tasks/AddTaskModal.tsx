import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import Modal from '@/components/ui/Modal';
import type { TaskPriority } from '@/types';
import styles from './AddTaskModal.module.css';

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string | null;
};

export default function AddTaskModal({ isOpen, onClose, defaultProjectId }: AddTaskModalProps) {
  const { dispatch, state } = useGame();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || '');
  const [deadline, setDeadline] = useState('');
  const [extensionDays, setExtensionDays] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const xpBase = priority === 'high' ? 30 : priority === 'medium' ? 20 : 10;
    const coinBase = priority === 'high' ? 20 : priority === 'medium' ? 12 : 6;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        description: description.trim(),
        priority,
        projectId: projectId || null,
        deadline: deadline || null,
        extensionDays,
        xpReward: xpBase,
        coinReward: coinBase,
      },
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setProjectId(defaultProjectId || '');
    setDeadline('');
    setExtensionDays(0);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ New Quest">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Quest Name *</label>
          <input
            className={styles.input}
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Any extra details..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <div className={styles.priorityBtns}>
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={[styles.priorityBtn, priority === p ? styles.priorityActive : ''].join(' ')}
                  onClick={() => setPriority(p)}
                  data-priority={p}
                >
                  {p === 'low' ? '🌿' : p === 'medium' ? '⚡' : '🔥'} {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Project (optional)</label>
          <select
            className={styles.select}
            value={projectId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectId(e.target.value)}
          >
            <option value="">No project</option>
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.name}
              </option>
            ))}
          </select>
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

        {deadline && extensionDays > 0 && (
          <div className={styles.deadlineHint}>
            🕐 Final deadline:{' '}
            {new Date(
              new Date(deadline).setDate(new Date(deadline).getDate() + extensionDays)
            ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        <div className={styles.rewards}>
          <span>🌟 Reward: <strong>+{priority === 'high' ? 30 : priority === 'medium' ? 20 : 10} XP</strong></span>
          <span>🪙 Reward: <strong>+{priority === 'high' ? 20 : priority === 'medium' ? 12 : 6} coins</strong></span>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Add Quest ✨
        </button>
      </form>
    </Modal>
  );
}
