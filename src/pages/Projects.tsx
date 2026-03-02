import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FolderOpen, LogOut, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProjects, createProject, deleteProject, type Project } from '@/lib/projects-api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Projects() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [showCreateModal]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const project = await createProject(newName.trim(), newDesc.trim() || undefined);
      setProjects((prev) => [project, ...prev]);
      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id: string) => {
    setDeleteError('');
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete project');
    }
    setDeleteConfirmId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-[#0d0f12] text-white font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[rgba(13,15,18,0.9)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/J6.webp"
              alt="J6"
              className="h-7 w-auto object-contain brightness-110"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-white/40 text-sm font-medium hidden sm:block">UI Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block truncate max-w-[200px]">
              {user?.name ?? user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user?.name ? `${user.name}'s Projects` : 'My Projects'}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Open a project to launch the designer
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(121,213,233,0.9)] text-[#0d0f12] rounded-xl text-sm font-bold transition-all duration-150 hover:bg-[rgba(121,213,233,1)] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(121,213,233,0.2)] active:translate-y-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Project
          </button>
        </div>

        {/* Error */}
        {(error || deleteError) && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error || deleteError}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <Layers size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-semibold text-white/60 mb-2">No projects yet</h2>
            <p className="text-sm text-white/30 mb-6 max-w-xs">
              Create your first project to start designing with J6 UI Studio
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.1] rounded-xl text-sm font-medium text-white/70 transition-all duration-150"
            >
              <Plus size={15} />
              Create a project
            </button>
          </div>
        )}

        {/* Projects grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col bg-[rgba(26,31,42,0.7)] border border-white/[0.07] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-[rgba(121,213,233,0.25)] hover:bg-[rgba(26,31,42,0.9)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_0_1px_rgba(121,213,233,0.1)] hover:-translate-y-0.5"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {/* Project icon */}
                <div className="w-10 h-10 rounded-xl bg-[rgba(121,213,233,0.08)] border border-[rgba(121,213,233,0.15)] flex items-center justify-center mb-3 transition-colors group-hover:bg-[rgba(121,213,233,0.12)]">
                  <FolderOpen size={18} className="text-[rgba(121,213,233,0.7)]" />
                </div>

                <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-2">
                    {project.description}
                  </p>
                )}

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-white/25">
                    {formatDate(project.updated_at)}
                  </span>

                  {/* Delete button */}
                  {deleteConfirmId === project.id ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-2 py-1 text-[10px] font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-[10px] font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white/50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                      aria-label="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="w-full max-w-md bg-[rgba(20,24,32,0.98)] border border-white/[0.1] rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
            <h2 className="text-base font-bold text-white mb-5">New Project</h2>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {createError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {createError}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70">Project name</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. Design System v2"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-[rgba(121,213,233,0.4)] focus:ring-1 focus:ring-[rgba(121,213,233,0.2)] transition-all disabled:opacity-50"
                  required
                  disabled={creating}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70">
                  Description <span className="font-normal text-white/30">(optional)</span>
                </label>
                <textarea
                  placeholder="What are you building?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-[rgba(121,213,233,0.4)] focus:ring-1 focus:ring-[rgba(121,213,233,0.2)] transition-all resize-none disabled:opacity-50"
                  disabled={creating}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setNewName(''); setNewDesc(''); setCreateError(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] transition-all"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-[rgba(121,213,233,0.9)] text-[#0d0f12] hover:bg-[rgba(121,213,233,1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={creating || !newName.trim()}
                >
                  {creating ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
