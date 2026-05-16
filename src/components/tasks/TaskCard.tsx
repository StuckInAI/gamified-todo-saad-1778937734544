import { useState } from 'react';
import { Trash2, CheckCircle, Clock, Zap } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { getTaskStatus, formatDeadline } from '@/lib/gameUtils';
import type { Task, Project } from '@/types';
import styles from './TaskCard.module.css';

type TaskCardProps = {
  task: Task;
  project: Project | null;
};

export default function TaskCard({ task, project }: TaskCardProps) {
  const { dispatch, addNotification, state } = useGame();
  const [celebrating, setCelebrating] = useState(false);
  const status = getTaskStatus(task);

  function handleComplete() {
    if (task.completed) return;
    const prevLevel = state.character.level;
    dispatch({ type: 'COMPLETE_TASK', payload: { id: task.id } });
    addNotification(`+${task.xpReward} XP earned!`, 'xp');
    addNotification(`+${task.coinReward} 🪙 earned!`, 'coins');
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 800);
    // Check for level up (approximate — real check happens in reducer)
    const newXp = state.character.xp + task.xpReward;
    if (newXp >= state.character.xpToNextLevel && prevLevel === state.character.level) {
      setTimeout(() => addNotification('🎉 Level Up!', 'levelup'), 500);
    }
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
  }

  const priorityColor =
    task.priority === 'high'
      ? 'var(--color-priority-high)'
      : task.priority === 'medium'
      ? 'var(--color-priority-medium)'
      : 'var(--color-priority-low)';

  const statusClass =
    status === 'completed'
      ? styles.completed
      : status === 'overdue'
      ? styles.overdue
      : status === 'warning'
      ? styles.warning
      : '';

  return (
    <div className={[styles.card, statusClass, celebrating ? styles.celebrate : ''].join(' ')}>
      <div className={styles.priorityBar} style={{ background: priorityColor }} />
      <div className={styles.content}>
        <div className={styles.top}>
          <h3 className={styles.title} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title}
          </h3>
          <div className={styles.actions}>
            {!task.completed && (
              <button className={styles.completeBtn} onClick={handleComplete} title="Complete task">
                <CheckCircle size={20} />
              </button>
            )}
            <button className={styles.deleteBtn} onClick={handleDelete} title="Delete task">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        <div className={styles.meta}>
          {project && (
            <span className={styles.projectTag} style={{ background: project.color + '33' }}>
              {project.emoji} {project.name}
            </span>
          )}
          {task.deadline && (
            <span className={styles.deadlineTag}>
              <Clock size={12} />
              {formatDeadline(task.deadline, task.extensionDays)}
            </span>
          )}
          <span className={styles.rewardTag}>
            <Zap size={12} />
            +{task.xpReward} XP · +{task.coinReward}🪙
          </span>
        </div>

        {status === 'overdue' && (
          <div className={styles.statusBanner}>⚠️ Past extended deadline</div>
        )}
        {status === 'warning' && (
          <div className={styles.statusBannerWarn}>⏰ Deadline approaching!</div>
        )}
        {task.completed && (
          <div className={styles.completedBanner}>✅ Quest complete!</div>
        )}
      </div>
    </div>
  );
}
