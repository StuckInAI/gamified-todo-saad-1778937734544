import { useState } from 'react';
import { Plus, TrendingUp, CheckSquare, Folder } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { getXpProgress, getMoodEmoji } from '@/lib/gameUtils';
import ProgressBar from '@/components/ui/ProgressBar';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import AddProjectModal from '@/components/tasks/AddProjectModal';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { state } = useGame();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  const activeTasks = state.tasks.filter((t) => !t.completed).slice(0, 5);
  const recentCompleted = state.tasks.filter((t) => t.completed).slice(0, 3);

  // Calculate cumulative XP for progress bar
  const allTasks = state.tasks.filter((t) => t.completed);
  const totalXpEarned = allTasks.reduce((acc, t) => acc + t.xpReward, 0);
  const xpProgress = getXpProgress(totalXpEarned);

  const equippedBg = state.shopItems.find(
    (i) => i.id === state.character.equipment.background && i.equipped
  );
  const equippedPet = state.shopItems.find(
    (i) => i.id === state.character.equipment.pet && i.equipped
  );
  const equippedHat = state.shopItems.find(
    (i) => i.id === state.character.equipment.hat && i.equipped
  );
  const equippedOutfit = state.shopItems.find(
    (i) => i.id === state.character.equipment.outfit && i.equipped
  );

  const greetings = [
    `Hello, ${state.character.name}! Ready for today's quests? 🌟`,
    `Welcome back, ${state.character.name}! Let's make today magical! ✨`,
    `Hey ${state.character.name}! Your adventure awaits! 🗺️`,
    `Good to see you, ${state.character.name}! Time to level up! ⬆️`,
  ];
  const greeting = greetings[Math.floor(Date.now() / 86400000) % greetings.length];

  return (
    <div className={styles.page}>
      {/* Hero / Character Panel */}
      <div
        className={styles.heroBanner}
        style={equippedBg ? { background: `linear-gradient(135deg, ${equippedBg.color}44, ${equippedBg.color}22)` } : undefined}
      >
        <div className={styles.characterScene}>
          <div className={styles.avatarArea}>
            {equippedHat && <span className={styles.hatLayer}>{equippedHat.emoji}</span>}
            <span className={styles.mainAvatar}>🧝</span>
            {equippedOutfit && <span className={styles.outfitBadge}>{equippedOutfit.emoji}</span>}
          </div>
          {equippedPet && <span className={styles.petFloat}>{equippedPet.emoji}</span>}
          <div className={styles.characterDetails}>
            <h1 className={styles.greeting}>{greeting}</h1>
            <div className={styles.statsRow}>
              <span className={styles.statChip}>🏆 Lv.{state.character.level}</span>
              <span className={styles.statChip}>🪙 {state.character.coins}</span>
              <span className={styles.statChip}>🔥 {state.streak}</span>
              <span className={styles.statChip}>{getMoodEmoji(state.character.mood)} mood</span>
            </div>
            <ProgressBar
              value={xpProgress.current}
              max={xpProgress.needed}
              color="var(--color-primary)"
              label={`XP to Level ${xpProgress.level + 1}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>✅</span>
            <div>
              <p className={styles.statNum}>{state.totalTasksCompleted}</p>
              <p className={styles.statLabel}>Quests Done</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📋</span>
            <div>
              <p className={styles.statNum}>{state.tasks.filter((t) => !t.completed).length}</p>
              <p className={styles.statLabel}>Active Quests</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🗂️</span>
            <div>
              <p className={styles.statNum}>{state.projects.length}</p>
              <p className={styles.statLabel}>Projects</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⭐</span>
            <div>
              <p className={styles.statNum}>{totalXpEarned}</p>
              <p className={styles.statLabel}>Total XP</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionRow}>
          <button className={styles.addBtn} onClick={() => setShowAddTask(true)}>
            <Plus size={18} />
            New Quest
          </button>
          <button className={styles.addBtnSecondary} onClick={() => setShowAddProject(true)}>
            <Folder size={18} />
            New Project
          </button>
        </div>

        {/* Active Tasks */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={18} />
            <h2 className={styles.sectionTitle}>Today's Quests</h2>
            <span className={styles.sectionCount}>{activeTasks.length}</span>
          </div>
          {activeTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyEmoji}>🌸</span>
              <p>No active quests! Add one to start your adventure.</p>
            </div>
          ) : (
            <div className={styles.taskList}>
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={state.projects.find((p) => p.id === task.projectId) || null}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Completed */}
        {recentCompleted.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <CheckSquare size={18} />
              <h2 className={styles.sectionTitle}>Recently Completed</h2>
            </div>
            <div className={styles.taskList}>
              {recentCompleted.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={state.projects.find((p) => p.id === task.projectId) || null}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} />
      <AddProjectModal isOpen={showAddProject} onClose={() => setShowAddProject(false)} />
    </div>
  );
}
