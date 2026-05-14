export async function captureScreen(windowRef: Window): Promise<Blob> {
  const mediaDevices = windowRef.navigator.mediaDevices;

  if (!mediaDevices?.getDisplayMedia) {
    throw new Error('SCREEN_CAPTURE_UNSUPPORTED');
  }

  const stream = await mediaDevices.getDisplayMedia(createCurrentTabCaptureOptions());
  const [videoTrack] = stream.getVideoTracks();

  try {
    if (videoTrack?.getSettings().displaySurface !== 'browser') {
      throw new Error('SCREEN_CAPTURE_CURRENT_TAB_REQUIRED');
    }

    const video = windowRef.document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    await video.play();
    await nextFrame(windowRef);

    const canvas = windowRef.document.createElement('canvas');
    canvas.width = video.videoWidth || windowRef.innerWidth;
    canvas.height = video.videoHeight || windowRef.innerHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('CANVAS_CONTEXT_UNAVAILABLE');
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await canvasToBlob(canvas);
  } finally {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
}

function createCurrentTabCaptureOptions(): DisplayMediaStreamOptions {
  return {
    video: {
      displaySurface: 'browser'
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude'
  } as DisplayMediaStreamOptions;
}

function nextFrame(windowRef: Window): Promise<void> {
  return new Promise((resolve) => {
    windowRef.requestAnimationFrame(() => resolve());
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('CANVAS_TO_BLOB_FAILED'));
      }
    }, 'image/png');
  });
}
