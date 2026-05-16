import { useState } from 'react';
import { Plus, FolderPlus, Trash2 } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import AddProjectModal from '@/components/tasks/AddProjectModal';
import ProgressBar from '@/components/ui/ProgressBar';
import styles from './HomePage.module.css';

type FilterType = 'all' | 'active' | 'completed' | string;

export default function HomePage() {
  const { state, dispatch } = useGame();
  const { character, tasks, projects } = state;
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [filter, setFilter] = useState<FilterType>('active');
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return t.projectId === filter;
  });

  function handleAddTaskForProject(projectId: string) {
    setDefaultProjectId(projectId);
    setShowAddTask(true);
  }

  const activeTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Hi, {character.name}! ✨</h1>
          <p className={styles.subGreeting}>
            Level {character.level} &middot; {activeTasks} active quests
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => { setDefaultProjectId(null); setShowAddTask(true); }}
          >
            <Plus size={18} />
            Add Quest
          </button>
          <button className={styles.btnSecondary} onClick={() => setShowAddProject(true)}>
            <FolderPlus size={18} />
            Add Project
          </button>
        </div>
      </div>

      <div className={styles.xpBar}>
        <div className={styles.xpLabel}>
          <span>⭐ Level {character.level} — {character.xp} XP</span>
          <span>{character.xp} / {character.xpToNextLevel}</span>
        </div>
        <ProgressBar value={character.xp} max={character.xpToNextLevel} color="var(--color-primary)" />
      </div>

      <div className={styles.statsRow}>
        {[
          { label: 'Active Quests', value: activeTasks, emoji: '📝' },
          { label: 'Completed', value: completedTasks, emoji: '✅' },
          { label: 'Day Streak', value: state.streak, emoji: '🔥' },
          { label: 'Coins', value: character.coins, emoji: '🪙' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statValue}>{s.emoji} {s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {projects.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🗺️ Projects</h2>
          </div>
          <div className={styles.projectGrid}>
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const done = projectTasks.filter((t) => t.completed).length;
              const total = projectTasks.length;
              return (
                <div
                  key={project.id}
                  className={styles.projectCard}
                  style={{ borderColor: project.color }}
                  onClick={() => setFilter(project.id)}
                >
                  <div className={styles.projectTop}>
                    <span className={styles.projectEmoji}>{project.emoji}</span>
                    <span className={styles.projectName}>{project.name}</span>
                    <button
                      className={styles.deleteProjectBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'DELETE_PROJECT', payload: { id: project.id } });
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {project.description && (
                    <p className={styles.projectDesc}>{project.description}</p>
                  )}
                  <ProgressBar
                    value={done}
                    max={total || 1}
                    color={project.color}
                  />
                  <div className={styles.projectProgress}>
                    <span>{done}/{total} tasks</span>
                    <button
                      style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTaskForProject(project.id);
                      }}
                    >
                      + Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>📋 Quests</h2>
          <div className={styles.filterRow}>
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                className={[styles.filterBtn, filter === f ? styles.filterBtnActive : ''].join(' ')}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {projects.map((p) => (
              <button
                key={p.id}
                className={[styles.filterBtn, filter === p.id ? styles.filterBtnActive : ''].join(' ')}
                onClick={() => setFilter(p.id)}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>🌱</span>
            <p>No quests here yet. Add one to get started!</p>
          </div>
        ) : (
          <div className={styles.taskList}>
            {filteredTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId) ?? null;
              return <TaskCard key={task.id} task={task} project={project} />;
            })}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => { setShowAddTask(false); setDefaultProjectId(null); }}
        defaultProjectId={defaultProjectId}
      />
      <AddProjectModal isOpen={showAddProject} onClose={() => setShowAddProject(false)} />
    </div>
  );
}
