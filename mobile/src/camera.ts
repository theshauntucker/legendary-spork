/**
 * Native camera/video picker bridge for RoutineX iOS.
 * Replaces the web file input on /upload with native iOS photo library/camera access.
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface CapturedVideo {
  path: string;
  webPath: string;
  format: string;
}

export async function pickVideoFromLibrary(): Promise<CapturedVideo> {
  const result = await Camera.pickImages({
    quality: 90,
    limit: 1,
  });

  if (!result.photos.length) {
    throw new Error('No video selected');
  }

  const photo = result.photos[0];
  return {
    path: photo.path || '',
    webPath: photo.webPath,
    format: photo.format,
  };
}

export async function captureVideo(): Promise<CapturedVideo> {
  const result = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 90,
  });

  return {
    path: result.path || '',
    webPath: result.webPath || '',
    format: result.format,
  };
}

export async function checkPermissions(): Promise<boolean> {
  const status = await Camera.checkPermissions();
  return status.camera === 'granted' && status.photos === 'granted';
}

export async function requestPermissions(): Promise<boolean> {
  const status = await Camera.requestPermissions();
  return status.camera === 'granted' && status.photos === 'granted';
}
