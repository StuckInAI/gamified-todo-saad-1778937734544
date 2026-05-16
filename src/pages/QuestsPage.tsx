import { useState } from 'react';
import { Plus, Folder, Trash2, Search } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { formatDeadline, getEffectiveDeadline } from '@/lib/gameUtils';
import TaskCard from '@/components/tasks/TaskCard';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import AddProjectModal from '@/components/tasks/AddProjectModal';
import styles from './QuestsPage.module.css';

export default function QuestsPage() {
  const { state, dispatch } = useGame();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [search, setSearch] = useState('');
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);

  const filteredTasks = state.tasks.filter((t) => {
    if (selectedProject && t.projectId !== selectedProject) return false;
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleAddTaskToProject(projectId: string) {
    setDefaultProjectId(projectId);
    setShowAddTask(true);
  }

  function handleDeleteProject(id: string) {
    if (window.confirm('Delete this project and all its quests?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: { id } });
      if (selectedProject === id) setSelectedProject(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>⚔️ Quest Board</h1>
          <div className={styles.headerActions}>
            <button className={styles.addBtn} onClick={() => { setDefaultProjectId(null); setShowAddTask(true); }}>
              <Plus size={18} />
              New Quest
            </button>
            <button className={styles.addBtnSecondary} onClick={() => setShowAddProject(true)}>
              <Folder size={18} />
              New Project
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search quests..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className={styles.filterTabs}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              className={[styles.filterTab, filter === f ? styles.filterTabActive : ''].join(' ')}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '📋 All' : f === 'active' ? '⚡ Active' : '✅ Completed'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        {/* Projects sidebar */}
        <aside className={styles.projectsSidebar}>
          <h2 className={styles.sidebarTitle}>🗂️ Projects</h2>
          <button
            className={[styles.projectChip, selectedProject === null ? styles.projectChipActive : ''].join(' ')}
            onClick={() => setSelectedProject(null)}
          >
            📋 All Quests
          </button>
          {state.projects.map((p) => {
            const taskCount = state.tasks.filter((t) => t.projectId === p.id && !t.completed).length;
            const effective = getEffectiveDeadline(p.deadline, p.extensionDays);
            return (
              <div key={p.id} className={styles.projectItem}>
                <button
                  className={[styles.projectChip, selectedProject === p.id ? styles.projectChipActive : ''].join(' ')}
                  style={selectedProject === p.id ? { background: p.color + '66' } : undefined}
                  onClick={() => setSelectedProject(p.id)}
                >
                  <span>{p.emoji} {p.name}</span>
                  {taskCount > 0 && <span className={styles.taskBadge}>{taskCount}</span>}
                </button>
                <div className={styles.projectMeta}>
                  {effective && (
                    <span className={styles.projectDeadline}>
                      📅 {formatDeadline(p.deadline, p.extensionDays)}
                    </span>
                  )}
                  <div className={styles.projectItemActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => handleAddTaskToProject(p.id)}
                      title="Add quest to project"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className={[styles.iconBtn, styles.iconBtnDanger].join(' ')}
                      onClick={() => handleDeleteProject(p.id)}
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {state.projects.length === 0 && (
            <p className={styles.noProjects}>No projects yet. Create one to organize your quests!</p>
          )}
        </aside>

        {/* Task list */}
        <div className={styles.taskArea}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyEmoji}>🍃</span>
              <p>No quests here yet!</p>
              <p className={styles.emptyHint}>Add a new quest to begin your adventure.</p>
            </div>
          ) : (
            <div className={styles.taskList}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={state.projects.find((p) => p.id === task.projectId) || null}
                />
              ))}
            </div>
          )}
        </div>
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
