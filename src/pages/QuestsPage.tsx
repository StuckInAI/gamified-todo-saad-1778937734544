import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import styles from './QuestsPage.module.css';

type Priority = 'all' | 'low' | 'medium' | 'high';

export default function QuestsPage() {
  const { state } = useGame();
  const { tasks, projects } = state;
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState<Priority>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const filteredActive = activeTasks.filter((t) =>
    filter === 'all' ? true : t.priority === filter
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚔️ All Quests</h1>
        <button className={styles.addBtn} onClick={() => setShowAddTask(true)}>
          <Plus size={18} />
          New Quest
        </button>
      </div>

      <div className={styles.statsBar}>
        <span className={styles.statPill}>📝 {activeTasks.length} active</span>
        <span className={styles.statPill}>✅ {completedTasks.length} completed</span>
        <span className={styles.statPill}>🗺️ {projects.length} projects</span>
      </div>

      <div className={styles.filterRow}>
        {(['all', 'low', 'medium', 'high'] as Priority[]).map((p) => (
          <button
            key={p}
            className={[styles.filterBtn, filter === p ? styles.filterBtnActive : ''].join(' ')}
            onClick={() => setFilter(p)}
          >
            {p === 'all' ? 'All' : p === 'low' ? '🌿 Low' : p === 'medium' ? '⚡ Medium' : '🔥 High'}
          </button>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Quests</h2>
        {filteredActive.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>🌟</span>
            <p>No active quests. You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className={styles.taskList}>
            {filteredActive.map((task) => {
              const project = projects.find((p) => p.id === task.projectId) ?? null;
              return <TaskCard key={task.id} task={task} project={project} />;
            })}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className={styles.section}>
          <button
            className={styles.sectionTitle}
            style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowCompleted((v) => !v)}
          >
            {showCompleted ? '▼' : '▶'} Completed Quests ({completedTasks.length})
          </button>
          {showCompleted && (
            <div className={styles.taskList}>
              {completedTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId) ?? null;
                return <TaskCard key={task.id} task={task} project={project} />;
              })}
            </div>
          )}
        </div>
      )}

      <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  );
}
