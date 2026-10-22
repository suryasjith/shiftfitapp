// Cloud Synchronization Service: Google Drive API & Supabase Storage
import { PhysiquePhoto, UserProfile } from '../types';

export interface CloudUploadResult {
  success: boolean;
  cloudUrl?: string;
  provider: 'google_drive' | 'supabase';
  error?: string;
  folderName?: string;
}

export class CloudSyncService {
  /**
   * Google Drive API: Upload a base64 or blob image directly to a folder
   */
  static async uploadToGoogleDrive(
    photo: PhysiquePhoto, 
    accessToken: string,
    existingFolderId?: string
  ): Promise<CloudUploadResult> {
    try {
      // 1. Ensure or create target folder "ShiftFit_Physique_Vault"
      let folderId = existingFolderId;
      if (!folderId) {
        folderId = await this.getOrCreateDriveFolder(accessToken, 'ShiftFit_Physique_Vault');
      }

      // 2. Prepare image data
      const blob = this.dataURItoBlob(photo.imageDataUrl);
      const fileName = `Physique_Wk${photo.weekNumber}_${photo.date}_${photo.pose.replace(/\s+/g, '_')}_${photo.weightKgAtTime || '76'}kg.jpg`;

      // 3. Multipart upload to Google Drive v3
      const metadata = {
        name: fileName,
        mimeType: 'image/jpeg',
        parents: folderId ? [folderId] : undefined,
        description: `ShiftFit Body Recomposition Check-In: ${photo.pose} (${photo.weightKgAtTime} kg) - ${photo.notes || 'No notes'}`
      };

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";

      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: image/jpeg\r\n' +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        base64Data +
        closeDelim;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Drive upload failed: ${response.status} ${errorText}`);
      }

      const resData = await response.json();
      return {
        success: true,
        provider: 'google_drive',
        cloudUrl: `https://drive.google.com/file/d/${resData.id}/view`,
        folderName: 'ShiftFit_Physique_Vault'
      };
    } catch (err: any) {
      console.error('Google Drive Upload error:', err);
      return {
        success: false,
        provider: 'google_drive',
        error: err.message || 'Unknown upload error'
      };
    }
  }

  /**
   * Search for existing "ShiftFit_Physique_Vault" or create one
   */
  static async getOrCreateDriveFolder(accessToken: string, folderName: string): Promise<string> {
    try {
      // Search for folder
      const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          return data.files[0].id;
        }
      }

      // Create folder if not found
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          description: 'ShiftFit PWA Gym & Physique Tracking Vault for Desktop Cloud Sync'
        })
      });

      if (createRes.ok) {
        const folderData = await createRes.json();
        return folderData.id;
      }
    } catch (e) {
      console.warn('Folder search/creation failed, uploading to root:', e);
    }
    return '';
  }

  /**
   * Supabase Storage Upload
   */
  static async uploadToSupabase(
    photo: PhysiquePhoto,
    supabaseUrl: string,
    anonKey: string
  ): Promise<CloudUploadResult> {
    try {
      const blob = this.dataURItoBlob(photo.imageDataUrl);
      const cleanUrl = supabaseUrl.replace(/\/$/, '');
      const filePath = `physique/${photo.date}_${photo.id}.jpg`;

      const response = await fetch(`${cleanUrl}/storage/v1/object/physique-vault/${filePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true'
        },
        body: blob
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Supabase upload failed: ${response.status} ${err}`);
      }

      const publicUrl = `${cleanUrl}/storage/v1/object/public/physique-vault/${filePath}`;
      return {
        success: true,
        provider: 'supabase',
        cloudUrl: publicUrl,
        folderName: 'physique-vault'
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'supabase',
        error: err.message || 'Supabase storage error'
      };
    }
  }

  /**
   * Helper: convert base64 Data URI to Blob
   */
  static dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}
