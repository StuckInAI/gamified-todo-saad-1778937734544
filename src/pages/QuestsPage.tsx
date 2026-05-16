import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import styles from './QuestsPage.module.css';

type Filter = 'all' | 'active' | 'completed' | 'overdue';

export default function QuestsPage() {
  const { state } = useGame();
  const { tasks, projects } = state;
  const [filter, setFilter] = useState<Filter>('all');
  const [showAddTask, setShowAddTask] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'overdue') {
      if (t.completed || !t.deadline) return false;
      const extended = new Date(t.deadline);
      extended.setDate(extended.getDate() + t.extensionDays);
      return new Date() > extended;
    }
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚔️ Quest Log</h1>
        <p className={styles.subtitle}>All your tasks in one place.</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterRow}>
          {(['all', 'active', 'completed', 'overdue'] as Filter[]).map((f) => (
            <button
              key={f}
              className={[styles.filterBtn, filter === f ? styles.filterBtnActive : ''].join(' ')}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddTask(true)}>
          <Plus size={16} /> New Quest
        </button>
      </div>

      <div className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyEmoji}>🌿</div>
            <p className={styles.emptyText}>No quests found!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={projects.find((p) => p.id === task.projectId) ?? null}
            />
          ))
        )}
      </div>

      <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  );
}
