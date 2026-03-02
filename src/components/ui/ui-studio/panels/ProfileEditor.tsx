import { useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { UserSettings } from '@mynaui/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudioStore } from '../store';

export function ProfileEditor() {
    const { user, updateProfile } = useAuth();
    const profileFileRef = useRef<HTMLInputElement>(null);

    const profileName = useStudioStore((s) => s.profileName);
    const setProfileName = useStudioStore((s) => s.setProfileName);
    const profileAvatarPreview = useStudioStore((s) => s.profileAvatarPreview);
    const setProfileAvatarPreview = useStudioStore((s) => s.setProfileAvatarPreview);
    const profileAvatarBase64 = useStudioStore((s) => s.profileAvatarBase64);
    const setProfileAvatarBase64 = useStudioStore((s) => s.setProfileAvatarBase64);
    const profileSaving = useStudioStore((s) => s.profileSaving);
    const setProfileSaving = useStudioStore((s) => s.setProfileSaving);
    const profileSaved = useStudioStore((s) => s.profileSaved);
    const setProfileSaved = useStudioStore((s) => s.setProfileSaved);
    const profileError = useStudioStore((s) => s.profileError);
    const setProfileError = useStudioStore((s) => s.setProfileError);
    const setShowProfile = useStudioStore((s) => s.setShowProfile);

    const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setProfileError('Please select an image file.'); return; }
        try {
            const b64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const scale = Math.min(1, 256 / Math.max(img.width, img.height));
                        canvas.width = Math.round(img.width * scale);
                        canvas.height = Math.round(img.height * scale);
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject(new Error('Canvas unavailable'));
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.82));
                    };
                    img.onerror = reject;
                    img.src = ev.target?.result as string;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            setProfileAvatarPreview(b64);
            setProfileAvatarBase64(b64);
            setProfileError(null);
        } catch { setProfileError('Failed to process image.'); }
    };

    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileError(null);
        try {
            await updateProfile(profileName.trim() || null, profileAvatarBase64);
            setProfileSaved(true);
            setProfileAvatarBase64(undefined);
            window.setTimeout(() => setProfileSaved(false), 2000);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    return (
        <section className="ui-studio-canvas flex h-full min-h-[440px] flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(20,31,49,0.96),rgba(12,20,35,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_rgba(2,6,14,0.45)]">
            <header className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
                <button
                    type="button"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#8da4c3] transition hover:bg-white/[0.06] hover:text-[#dbe8fb]"
                >
                    <Minus className="size-3 rotate-90" />
                    Back
                </button>
                <div className="min-w-0 flex-1">
                    <p className="ui-studio-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f95b4]">Profile</p>
                    <p className="truncate text-xs text-[#9bb0cc]">Manage your display name and avatar</p>
                </div>
            </header>
            <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-4 py-10">
                <div className="w-full max-w-sm space-y-7">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="size-24 rounded-full overflow-hidden bg-[#63e8da]/16 flex items-center justify-center text-2xl font-semibold text-[#7efef0]">
                                {profileAvatarPreview
                                    ? <img src={profileAvatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    : (user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() ?? 'UI')
                                }
                            </div>
                            <button
                                type="button"
                                onClick={() => profileFileRef.current?.click()}
                                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-[#63e8da] text-[#0d1a1a] hover:bg-[#7efef0] transition shadow-lg"
                                aria-label="Upload avatar"
                            >
                                <UserSettings className="size-4" />
                            </button>
                        </div>
                        <input
                            ref={profileFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => void handleProfileFileChange(e)}
                        />
                        {profileAvatarPreview && (
                            <button
                                type="button"
                                onClick={() => { setProfileAvatarPreview(null); setProfileAvatarBase64(null); if (profileFileRef.current) profileFileRef.current.value = ''; }}
                                className="text-xs text-[#8da4c3] hover:text-[#ff7d87] transition"
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
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Your name"
                                className="w-full rounded-lg border border-white/8 bg-white/[0.04] px-3.5 py-2.5 text-sm text-[#f0f6ff] placeholder-[#8da4c3]/60 outline-none focus:border-[#63e8da]/60 focus:bg-white/[0.06] transition"
                            />
                        </div>
                    </div>

                    {profileError && <p className="text-sm text-red-400">{profileError}</p>}

                    <button
                        type="button"
                        onClick={() => void handleProfileSave()}
                        disabled={profileSaving}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#63e8da] py-2.5 text-sm font-semibold text-[#0d1a1a] hover:bg-[#7efef0] active:bg-[#63e8da] transition disabled:opacity-60"
                    >
                        {profileSaving ? (
                            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        ) : profileSaved ? (
                            <><Check className="size-4" /> Saved</>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}
