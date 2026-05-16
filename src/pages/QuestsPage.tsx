import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import TaskCard from '@/components/tasks/TaskCard';
import styles from './QuestsPage.module.css';

type Filter = 'all' | 'active' | 'completed';

export default function QuestsPage() {
  const { state } = useGame();
  const [filter, setFilter] = useState<Filter>('active');

  const filtered = state.tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚔️ Quest Log</h1>
        <p className={styles.subtitle}>
          {state.tasks.filter((t) => !t.completed).length} active ·{' '}
          {state.tasks.filter((t) => t.completed).length} completed
        </p>
      </div>

      <div className={styles.filters}>
        {(['all', 'active', 'completed'] as Filter[]).map((f) => (
          <button
            key={f}
            className={[styles.filterBtn, filter === f ? styles.filterBtnActive : ''].join(' ')}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '📋 All' : f === 'active' ? '⚡ Active' : '✅ Completed'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyEmoji}>🎉</span>
          <p className={styles.emptyTitle}>No quests here!</p>
          <p className={styles.emptyDesc}>
            {filter === 'completed' ? 'Complete some quests to see them here.' : 'Add a quest from the Home page.'}
          </p>
        </div>
      ) : (
        <div className={styles.taskList}>
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={state.projects.find((p) => p.id === task.projectId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
