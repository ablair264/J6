import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, Loader2, Check } from 'lucide-react';

const MAX_AVATAR_PX = 256;

function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, MAX_AVATAR_PX / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null);
  const [avatarBase64, setAvatarBase64] = useState<string | null | undefined>(undefined); // undefined = no change
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    try {
      const b64 = await resizeImageToBase64(file);
      setAvatarPreview(b64);
      setAvatarBase64(b64);
      setError(null);
    } catch {
      setError('Failed to process image. Please try another file.');
    }
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarBase64(null); // null = explicitly clear
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile(name.trim() || null, avatarBase64);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [name, avatarBase64, updateProfile]);

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'UI';

  return (
    <div className="min-h-dvh bg-[#0d0f12] text-[#e6f0ff] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-white/8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#8da4c3] hover:text-[#e6f0ff] transition text-sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="ml-auto">
          <img src="/J6.webp" alt="J6" className="h-6 opacity-80" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#f0f6ff]">Profile</h1>
            <p className="mt-1 text-sm text-[#8da4c3]">Manage your name and avatar</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="size-24 rounded-full overflow-hidden bg-[#63e8da]/16 flex items-center justify-center text-2xl font-semibold text-[#7efef0]">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-[#63e8da] text-[#0d1a1a] hover:bg-[#7efef0] transition shadow-lg"
                aria-label="Upload avatar"
              >
                <Camera className="size-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs text-[#8da4c3] hover:text-red-400 transition"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8da4c3] mb-1.5">Email</label>
              <div className="w-full rounded-lg border border-white/8 bg-white/[0.04] px-3.5 py-2.5 text-sm text-[#8da4c3] select-all">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8da4c3] mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-white/8 bg-white/[0.04] px-3.5 py-2.5 text-sm text-[#f0f6ff] placeholder-[#8da4c3]/60 outline-none focus:border-[#63e8da]/60 focus:bg-white/[0.06] transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#63e8da] py-2.5 text-sm font-semibold text-[#0d1a1a] hover:bg-[#7efef0] active:bg-[#63e8da] transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <><Check className="size-4" /> Saved</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
