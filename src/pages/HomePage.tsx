import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import AddProjectModal from '@/components/tasks/AddProjectModal';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './HomePage.module.css';

type Filter = 'all' | 'active' | 'completed';

export default function HomePage() {
  const { state, dispatch } = useGame();
  const { character, tasks, projects } = state;
  const [filter, setFilter] = useState<Filter>('active');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchProject = selectedProjectId ? t.projectId === selectedProjectId : true;
    const matchFilter =
      filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed;
    return matchProject && matchFilter;
  });

  const activeTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>
          {greeting}, {character.name}! 🌟
        </h1>
        <p className={styles.subtitle}>
          You have {activeTasks} active quest{activeTasks !== 1 ? 's' : ''} to complete.
        </p>
      </div>

      <div className={styles.statsRow}>
        {[
          { emoji: '⚔️', value: activeTasks, label: 'Active Quests' },
          { emoji: '✅', value: completedTasks, label: 'Completed' },
          { emoji: '🔥', value: state.streak, label: 'Day Streak' },
          { emoji: '🪙', value: character.coins, label: 'Coins' },
        ].map(({ emoji, value, label }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statEmoji}>{emoji}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.xpSection}>
        <div className={styles.xpHeader}>
          <span className={styles.xpLabel}>Level {character.level} — XP Progress</span>
          <span className={styles.xpValue}>
            {character.xpInLevel} / {character.xpToNextLevel} XP
          </span>
        </div>
        <ProgressBar value={character.xpInLevel} max={character.xpToNextLevel} color="var(--color-primary)" />
      </div>

      <div className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🗺️ Projects</h2>
          <button className={styles.addBtn} onClick={() => setShowAddProject(true)}>
            <Plus size={16} /> New Project
          </button>
        </div>
        <div className={styles.projectsGrid}>
          {projects.map((project) => {
            const count = tasks.filter((t) => t.projectId === project.id && !t.completed).length;
            return (
              <button
                key={project.id}
                className={[
                  styles.projectCard,
                  selectedProjectId === project.id ? styles.projectCardActive : '',
                ].join(' ')}
                style={{ borderTopColor: project.color }}
                onClick={() =>
                  setSelectedProjectId((prev) => (prev === project.id ? null : project.id))
                }
              >
                <div className={styles.projectEmoji}>{project.emoji}</div>
                <div className={styles.projectName}>{project.name}</div>
                <div className={styles.projectCount}>{count} active task{count !== 1 ? 's' : ''}</div>
                <button
                  className={styles.projectDeleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'DELETE_PROJECT', payload: { id: project.id } });
                    if (selectedProjectId === project.id) setSelectedProjectId(null);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.tasksSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {selectedProjectId
              ? `${projects.find((p) => p.id === selectedProjectId)?.emoji} ${
                  projects.find((p) => p.id === selectedProjectId)?.name
                }`
              : '✨ All Quests'}
          </h2>
          <button className={styles.addBtn} onClick={() => setShowAddTask(true)}>
            <Plus size={16} /> New Quest
          </button>
        </div>

        <div className={styles.filterRow}>
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              className={[styles.filterBtn, filter === f ? styles.filterBtnActive : ''].join(' ')}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>🌿</div>
              <p className={styles.emptyText}>
                {filter === 'completed' ? 'No completed quests yet!' : 'No quests here. Add one!'}
              </p>
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
      </div>

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        defaultProjectId={selectedProjectId}
      />
      <AddProjectModal isOpen={showAddProject} onClose={() => setShowAddProject(false)} />
    </div>
  );
}
