import { describe, expect, it, vi } from 'vitest';
import { captureScreen } from '../src/ui/screenshot';

describe('captureScreen', () => {
  it('requests current-tab capture and rejects non-browser selections', async () => {
    const stop = vi.fn();
    const getDisplayMedia = vi.fn(async () => {
      return {
        getVideoTracks: () => [
          {
            getSettings: () => ({
              displaySurface: 'monitor'
            })
          }
        ],
        getTracks: () => [
          {
            stop
          }
        ]
      } as unknown as MediaStream;
    });

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getDisplayMedia
      }
    });

    await expect(captureScreen(window)).rejects.toThrow('SCREEN_CAPTURE_CURRENT_TAB_REQUIRED');

    expect(getDisplayMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: {
          displaySurface: 'browser'
        },
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude'
      })
    );
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
