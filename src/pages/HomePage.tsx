import { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import AddProjectModal from '@/components/tasks/AddProjectModal';
import ProgressBar from '@/components/ui/ProgressBar';
import { getMoodEmoji } from '@/lib/gameUtils';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { state } = useGame();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [filterProject, setFilterProject] = useState<string | null>(null);

  const { character, tasks, projects } = state;

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedToday = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const filteredTasks = filterProject
    ? activeTasks.filter((t) => t.projectId === filterProject)
    : activeTasks;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.greeting}>
            {greeting}, {character.name}! {getMoodEmoji(character.mood)}
          </h1>
          <p className={styles.subGreeting}>
            You have {activeTasks.length} active quest{activeTasks.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtnSecondary} onClick={() => setShowAddProject(true)}>
            <FolderPlus size={18} />
            New Project
          </button>
          <button className={styles.addBtn} onClick={() => setShowAddTask(true)}>
            <Plus size={18} />
            Add Quest
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statEmoji}>⚔️</span>
          <span className={styles.statValue}>{activeTasks.length}</span>
          <span className={styles.statLabel}>Active Quests</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statEmoji}>✅</span>
          <span className={styles.statValue}>{completedToday}</span>
          <span className={styles.statLabel}>Done Today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statEmoji}>🪙</span>
          <span className={styles.statValue}>{character.coins}</span>
          <span className={styles.statLabel}>Coins</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statEmoji}>🔥</span>
          <span className={styles.statValue}>{state.streak}</span>
          <span className={styles.statLabel}>Day Streak</span>
        </div>
      </div>

      <div className={styles.xpSection}>
        <div className={styles.xpHeader}>
          <span className={styles.xpTitle}>⭐ Level {character.level}</span>
          <span className={styles.xpMeta}>{character.xp} / {character.xpToNextLevel} XP</span>
        </div>
        <ProgressBar value={character.xp} max={character.xpToNextLevel} color="var(--color-primary)" />
      </div>

      {projects.length > 0 && (
        <div className={styles.projects}>
          <h2 className={styles.sectionTitle}>🗺️ Projects</h2>
          <div className={styles.projectList}>
            <button
              className={[
                styles.projectChip,
                filterProject === null ? styles.projectChipActive : '',
              ].join(' ')}
              style={filterProject === null ? { background: 'var(--color-primary)' } : {}}
              onClick={() => setFilterProject(null)}
            >
              All
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                className={[
                  styles.projectChip,
                  filterProject === p.id ? styles.projectChipActive : '',
                ].join(' ')}
                style={filterProject === p.id ? { background: p.color } : {}}
                onClick={() => setFilterProject(filterProject === p.id ? null : p.id)}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.taskSection}>
        <h2 className={styles.sectionTitle}>⚔️ Active Quests</h2>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>🌟</span>
            <p className={styles.emptyTitle}>All clear, adventurer!</p>
            <p className={styles.emptyDesc}>Add a new quest to get started.</p>
          </div>
        ) : (
          <div className={styles.taskList}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                project={projects.find((p) => p.id === task.projectId) ?? null}
              />
            ))}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        defaultProjectId={filterProject}
      />
      <AddProjectModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
      />
    </div>
  );
}
