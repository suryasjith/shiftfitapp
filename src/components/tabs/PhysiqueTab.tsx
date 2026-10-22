import React, { useState, useRef } from 'react';
import { 
  UserProfile, 
  PhysiquePhoto, 
  BodyweightEntry 
} from '../../types';
import { CloudSyncService } from '../../services/cloudSync';
import { 
  Camera, 
  Upload, 
  CloudCheck, 
  CloudOff, 
  Sparkles, 
  ShieldCheck, 
  HardDrive, 
  Layers, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Download,
  Info
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

interface PhysiqueTabProps {
  todayStr: string;
  profile: UserProfile;
  photos: Record<string, PhysiquePhoto>;
  todayWeight: BodyweightEntry | null;
  onSavePhoto: (photo: PhysiquePhoto) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onExportAllData: () => void;
}

export const PhysiqueTab: React.FC<PhysiqueTabProps> = ({
  todayStr,
  profile,
  photos,
  todayWeight,
  onSavePhoto,
  onUpdateProfile,
  onExportAllData,
}) => {
  const [selectedPose, setSelectedPose] = useState<PhysiquePhoto['pose']>('Front Relaxed');
  const [photoNotes, setPhotoNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  
  // Cloud settings modal
  const [showCloudConfig, setShowCloudConfig] = useState<boolean>(false);
  const [googleTokenInput, setGoogleTokenInput] = useState<string>(profile.googleDriveAccessToken || '');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(profile.supabaseUrl || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(profile.supabaseAnonKey || '');

  // Compare mode
  const [comparePhotoA, setComparePhotoA] = useState<string | null>(null);
  const [comparePhotoB, setComparePhotoB] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoList = Object.values(photos).sort((a, b) => b.date.localeCompare(a.date));

  // Handle Photo Selection via Camera or File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playTap();
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await processAndSavePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processAndSavePhoto = async (dataUrl: string) => {
    setIsUploading(true);
    setUploadStatusMsg('Encoding & storing in local offline vault...');

    const weekNum = 42; // Oct 2026 current week
    const photoId = `photo_${Date.now()}`;
    const weightVal = todayWeight?.weightKg || profile.currentWeightKg || 76.4;

    const newPhoto: PhysiquePhoto = {
      id: photoId,
      date: todayStr,
      weekNumber: weekNum,
      imageDataUrl: dataUrl,
      pose: selectedPose,
      weightKgAtTime: weightVal,
      syncedToCloud: false,
      notes: photoNotes || 'Weekly check-in',
    };

    // Attempt Cloud Sync if Google Drive or Supabase is connected!
    if (profile.googleDriveConnected && profile.googleDriveAccessToken) {
      setUploadStatusMsg('Securely uploading to Google Drive Vault folder...');
      const res = await CloudSyncService.uploadToGoogleDrive(
        newPhoto,
        profile.googleDriveAccessToken,
        profile.googleDriveFolderId
      );
      if (res.success) {
        newPhoto.syncedToCloud = true;
        newPhoto.cloudUrl = res.cloudUrl;
        newPhoto.cloudProvider = 'google_drive';
        setUploadStatusMsg('✓ Uploaded to Google Drive! It will automatically sync to your PC folder via Desktop Client.');
      } else {
        setUploadStatusMsg(`Cloud upload note: ${res.error || 'Saved locally in IndexedDB'}`);
      }
    } else if (profile.supabaseConnected && profile.supabaseUrl && profile.supabaseAnonKey) {
      setUploadStatusMsg('Uploading to Supabase Storage...');
      const res = await CloudSyncService.uploadToSupabase(
        newPhoto,
        profile.supabaseUrl,
        profile.supabaseAnonKey
      );
      if (res.success) {
        newPhoto.syncedToCloud = true;
        newPhoto.cloudUrl = res.cloudUrl;
        newPhoto.cloudProvider = 'supabase';
        setUploadStatusMsg('✓ Uploaded to Supabase Storage.');
      }
    } else {
      setUploadStatusMsg('✓ Saved securely to device vault. Connect Google Drive below to sync natively to your PC!');
    }

    onSavePhoto(newPhoto);
    setIsUploading(false);
    setPhotoNotes('');
    soundManager.playCompleteChime();
    setTimeout(() => setUploadStatusMsg(''), 5000);
  };

  const handleSaveCloudSettings = () => {
    soundManager.playTap();
    const updated: UserProfile = {
      ...profile,
      googleDriveAccessToken: googleTokenInput.trim(),
      googleDriveConnected: googleTokenInput.trim().length > 0,
      supabaseUrl: supabaseUrlInput.trim(),
      supabaseAnonKey: supabaseKeyInput.trim(),
      supabaseConnected: supabaseUrlInput.trim().length > 0 && supabaseKeyInput.trim().length > 0,
    };
    onUpdateProfile(updated);
    setShowCloudConfig(false);
  };

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn">
      {/* Header Card */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Physique & Media Vault</h2>
              <p className="text-xs text-slate-400">Desktop Cloud Sync & Progression</p>
            </div>
          </div>

          <button
            onClick={() => setShowCloudConfig(!showCloudConfig)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            {profile.googleDriveConnected ? (
              <CloudCheck className="w-4 h-4 text-cyan-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-slate-400" />
            )}
            <span>{profile.googleDriveConnected ? 'Drive Linked' : 'Cloud Setup'}</span>
          </button>
        </div>

        {/* Weekly Prompt Banner */}
        <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-dark-850 to-cyan-950/30 border border-cyan-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Weekly Physique Prompt (Week 42)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Weight: {todayWeight?.weightKg || '76.4'} kg
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Consistent weekly photos track aesthetic recomp changes (upper chest clavicle flare, lat-to-waist taper) independent of daily water fluctuations.
          </p>

          {/* Pose Selector */}
          <div className="mt-3">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Select Pose:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {(['Front Relaxed', 'Front Double Bicep', 'Side Chest', 'Back Lat Spread', 'Waist/Abs'] as const).map((pose) => (
                <button
                  key={pose}
                  type="button"
                  onClick={() => setSelectedPose(pose)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedPose === pose
                      ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                      : 'bg-dark-800 text-slate-300 border border-dark-700 hover:border-dark-600'
                  }`}
                >
                  {pose}
                </button>
              ))}
            </div>
          </div>

          {/* Camera / Upload Action */}
          <div className="mt-3.5 flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Capture / Upload Photo'}</span>
            </button>
          </div>

          {uploadStatusMsg && (
            <div className="mt-2.5 p-2 rounded-lg bg-dark-900 border border-cyan-800 text-xs text-cyan-300 animate-fadeIn">
              {uploadStatusMsg}
            </div>
          )}
        </div>
      </div>

      {/* Cloud Sync Setup Modal / Card */}
      {showCloudConfig && (
        <div className="rounded-2xl bg-dark-900 border border-cyan-500/40 p-4 shadow-xl text-left animate-slideUp">
          <div className="flex items-center justify-between pb-2 border-b border-dark-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Google Drive Desktop Sync Configuration</h3>
            </div>
            <button 
              onClick={() => setShowCloudConfig(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <div className="p-2.5 rounded-xl bg-dark-850 border border-dark-750 text-slate-300 leading-relaxed">
              <p className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                How the Desktop Cloud Sync Works:
              </p>
              When linked, photos are uploaded directly to the <code className="text-cyan-300 bg-dark-900 px-1 rounded">ShiftFit_Physique_Vault</code> folder in your Google Drive. 
              Because it syncs via the cloud, your PC’s local Google Drive folder automatically updates whenever your PC is on — completely independent of whether your PC is powered on during your workout!
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Google Drive OAuth2 Access Token:
              </label>
              <input
                type="password"
                value={googleTokenInput}
                onChange={(e) => setGoogleTokenInput(e.target.value)}
                placeholder="Paste Google Drive OAuth Bearer token (or leave empty for local vault)"
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Can be generated via Google OAuth Playground or client-side PKCE login.
              </span>
            </div>

            <div className="pt-2 border-t border-dark-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                Or Supabase Storage Option:
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                />
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="Supabase Anon Public API Key"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveCloudSettings}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all active:scale-95"
              >
                Save Cloud Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physique Gallery & Compare Slider */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-lg text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Physique Timeline ({photoList.length})</h3>
          </div>

          <button
            onClick={onExportAllData}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:underline font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
        </div>

        {photoList.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No physique photos logged yet. Take your first check-in photo above!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photoList.map((photo) => (
              <div 
                key={photo.id}
                className="rounded-xl bg-dark-850 border border-dark-750 overflow-hidden group hover:border-cyan-500/50 transition-all"
              >
                {/* Photo Image Display */}
                <div className="relative aspect-[3/4] bg-dark-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.imageDataUrl}
                    alt={photo.pose}
                    className="w-full h-full object-cover"
                  />

                  {/* Sync status badge */}
                  <div className="absolute top-2 right-2">
                    {photo.syncedToCloud ? (
                      <span className="p-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center gap-1 text-[9px] font-bold px-1.5" title="Synced to Cloud Vault">
                        <CloudCheck className="w-3 h-3" />
                        <span>SYNCED</span>
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-dark-900/80 border border-dark-700 text-slate-400 flex items-center gap-1 text-[9px] font-medium px-1.5" title="Stored safely in Local Vault">
                        <HardDrive className="w-3 h-3" />
                        <span>LOCAL</span>
                      </span>
                    )}
                  </div>

                  {/* Weight overlay tag */}
                  <div className="absolute bottom-2 left-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-white/10">
                    {photo.weightKgAtTime || '76.4'} kg
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5">
                  <div className="text-xs font-bold text-white truncate">{photo.pose}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Week {photo.weekNumber}</span>
                    <span className="font-mono">{photo.date}</span>
                  </div>
                  {photo.notes && (
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                      "{photo.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
