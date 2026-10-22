import React, { useState, useRef } from 'react';
import { 
  UserProfile, 
  PhysiquePhoto, 
  BodyweightEntry 
} from '../../types';
import { CloudSyncService } from '../../services/cloudSync';
import { 
  Camera, 
  CloudCheck, 
  CloudOff, 
  ShieldCheck, 
  HardDrive, 
  Layers, 
  Download
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

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
  
  const [showCloudConfig, setShowCloudConfig] = useState<boolean>(false);
  const [googleTokenInput, setGoogleTokenInput] = useState<string>(profile.googleDriveAccessToken || '');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(profile.supabaseUrl || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(profile.supabaseAnonKey || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoList = Object.values(photos).sort((a, b) => b.date.localeCompare(a.date));

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
    setUploadStatusMsg('Encoding & saving to device vault...');

    const weekNum = 42;
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

    if (profile.googleDriveConnected && profile.googleDriveAccessToken) {
      setUploadStatusMsg('Uploading to Google Drive ShiftFit_Physique_Vault...');
      const res = await CloudSyncService.uploadToGoogleDrive(
        newPhoto,
        profile.googleDriveAccessToken,
        profile.googleDriveFolderId
      );
      if (res.success) {
        newPhoto.syncedToCloud = true;
        newPhoto.cloudUrl = res.cloudUrl;
        newPhoto.cloudProvider = 'google_drive';
        setUploadStatusMsg('✓ Uploaded to Google Drive (Desktop will auto-sync to your PC)');
      } else {
        setUploadStatusMsg(`Cloud note: ${res.error || 'Stored safely in local vault'}`);
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
        setUploadStatusMsg('✓ Uploaded to Supabase Storage');
      }
    } else {
      setUploadStatusMsg('✓ Saved to device vault. Link Google Drive below for automatic PC folder sync.');
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
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn">
      {/* Header Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Physique Vault</h2>
                <ContextualHelp
                  title="Physique Vault"
                  content="Take weekly check-in photos. When connected, photos automatically upload to your Google Drive 'ShiftFit_Physique_Vault' folder, which Google Drive for Desktop syncs to your PC without needing the PC on during your workout."
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">Desktop Cloud Mirroring</p>
            </div>
          </div>

          <button
            onClick={() => setShowCloudConfig(!showCloudConfig)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-750 bg-neutral-900 text-xs font-mono text-white hover:border-neutral-500 transition-all active:scale-95"
          >
            {profile.googleDriveConnected ? (
              <CloudCheck className="w-3.5 h-3.5 text-white" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <span>{profile.googleDriveConnected ? 'Drive Linked' : 'Cloud Setup'}</span>
          </button>
        </div>

        {/* Weekly Prompt */}
        <div className="mt-3.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              WEEK 42 PHYSIQUE CHECK-IN
            </span>
            <span className="text-[10px] text-neutral-400">
              Weight: {todayWeight?.weightKg || '76.4'} kg
            </span>
          </div>

          {/* Pose Selector */}
          <div className="mt-2.5">
            <div className="grid grid-cols-3 gap-1 text-center">
              {(['Front Relaxed', 'Front Double Bicep', 'Side Chest', 'Back Lat Spread', 'Waist/Abs'] as const).map((pose) => (
                <button
                  key={pose}
                  type="button"
                  onClick={() => setSelectedPose(pose)}
                  className={`py-1 px-1.5 rounded text-[10px] font-mono transition-all ${
                    selectedPose === pose
                      ? 'bg-white text-black font-bold'
                      : 'bg-black text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {pose}
                </button>
              ))}
            </div>
          </div>

          {/* Camera / Upload Action */}
          <div className="mt-3 flex gap-2">
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
              className="flex-1 py-2 px-3 rounded-lg bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isUploading ? 'SAVING...' : 'CAPTURE / UPLOAD PHOTO'}</span>
            </button>
          </div>

          {uploadStatusMsg && (
            <div className="mt-2 p-2 rounded bg-black border border-neutral-800 text-[11px] text-neutral-300 font-mono">
              {uploadStatusMsg}
            </div>
          )}
        </div>
      </div>

      {/* Cloud Sync Setup Card */}
      {showCloudConfig && (
        <div className="rounded-xl bg-neutral-950 border border-neutral-700 p-4 shadow-sm text-left animate-slideUp font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold text-white uppercase">Desktop Cloud Sync Setup</h3>
            </div>
            <button 
              onClick={() => setShowCloudConfig(false)}
              className="text-neutral-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            <div className="p-2.5 rounded bg-neutral-900 border border-neutral-850 text-neutral-300 font-sans text-[11px] leading-relaxed">
              <span className="font-bold font-mono text-white block mb-0.5">Desktop Sync Mechanism:</span>
              Photos upload to Google Drive's <code className="text-white bg-black px-1 rounded font-mono">ShiftFit_Physique_Vault</code> folder. 
              The Google Drive desktop client mirrors this folder to your PC whenever your PC is on.
            </div>

            <div>
              <label className="text-neutral-400 text-[11px] block mb-1">
                Google Drive OAuth2 Access Token:
              </label>
              <input
                type="password"
                value={googleTokenInput}
                onChange={(e) => setGoogleTokenInput(e.target.value)}
                placeholder="Paste Bearer token (optional)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="pt-2 border-t border-neutral-850">
              <label className="text-neutral-400 text-[11px] block mb-1">
                Or Supabase Project URL:
              </label>
              <input
                type="text"
                value={supabaseUrlInput}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs mb-1.5"
              />
              <input
                type="password"
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="Supabase Anon Key"
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs"
              />
            </div>

            <button
              onClick={handleSaveCloudSettings}
              className="w-full mt-2 py-2 rounded bg-white text-black font-bold text-xs hover:bg-neutral-200"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Physique Gallery */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-3 font-mono">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-white" />
            <h3 className="text-xs font-bold text-white uppercase">Vault History ({photoList.length})</h3>
            <ContextualHelp
              title="Vault Storage"
              content="Every photo is stored offline in IndexedDB on this device, plus mirrored to the cloud if configured."
            />
          </div>

          <button
            onClick={onExportAllData}
            className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white"
          >
            <Download className="w-3 h-3" />
            <span>Export Backup</span>
          </button>
        </div>

        {photoList.length === 0 ? (
          <div className="py-8 text-center text-neutral-600 text-xs font-mono">
            No check-in photos logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {photoList.map((photo) => (
              <div 
                key={photo.id}
                className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden"
              >
                <div className="relative aspect-[3/4] bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.imageDataUrl}
                    alt={photo.pose}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-1.5 right-1.5">
                    {photo.syncedToCloud ? (
                      <span className="px-1 py-0.2 rounded bg-black/80 border border-neutral-700 text-white text-[8px] font-mono font-bold">
                        SYNCED
                      </span>
                    ) : (
                      <span className="px-1 py-0.2 rounded bg-black/80 border border-neutral-800 text-neutral-400 text-[8px] font-mono">
                        LOCAL
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-1.5 left-1.5 bg-black/90 px-1 py-0.2 rounded text-[9px] font-mono text-white border border-neutral-800">
                    {photo.weightKgAtTime || '76.4'} kg
                  </div>
                </div>

                <div className="p-2 font-mono">
                  <div className="text-[11px] font-bold text-white truncate">{photo.pose}</div>
                  <div className="flex items-center justify-between text-[9px] text-neutral-500 mt-0.5">
                    <span>Wk {photo.weekNumber}</span>
                    <span>{photo.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
