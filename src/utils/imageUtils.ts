/**
 * Utility to process uploaded portraits and remove plain white/off-white background
 * via HTML5 Canvas flood-fill algorithm.
 */
export async function removeWhiteBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width: w, height: h } = imgData;

        // BFS flood-fill near-white/light pixels from border edges
        const isLightBg = (r: number, g: number, b: number) => {
          return r > 215 && g > 215 && b > 215 && Math.abs(r - g) < 28 && Math.abs(r - b) < 28;
        };

        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Check top and bottom border
        for (let x = 0; x < w; x++) {
          const topIdx = x;
          const pT = topIdx * 4;
          if (isLightBg(data[pT], data[pT + 1], data[pT + 2])) {
            visited[topIdx] = 1;
            queue.push(topIdx);
          }

          const botIdx = (h - 1) * w + x;
          const pB = botIdx * 4;
          if (isLightBg(data[pB], data[pB + 1], data[pB + 2])) {
            visited[botIdx] = 1;
            queue.push(botIdx);
          }
        }

        // Check left and right border
        for (let y = 0; y < h; y++) {
          const leftIdx = y * w;
          const pL = leftIdx * 4;
          if (!visited[leftIdx] && isLightBg(data[pL], data[pL + 1], data[pL + 2])) {
            visited[leftIdx] = 1;
            queue.push(leftIdx);
          }

          const rightIdx = y * w + (w - 1);
          const pR = rightIdx * 4;
          if (!visited[rightIdx] && isLightBg(data[pR], data[pR + 1], data[pR + 2])) {
            visited[rightIdx] = 1;
            queue.push(rightIdx);
          }
        }

        // If no edge pixels were light, don't alter
        if (queue.length === 0) {
          resolve(dataUrl);
          return;
        }

        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cx = curr % w;
          const cy = Math.floor(curr / w);
          const p = curr * 4;

          data[p + 3] = 0; // Transparent

          const neighbors = [
            cx > 0 ? curr - 1 : -1,
            cx < w - 1 ? curr + 1 : -1,
            cy > 0 ? curr - w : -1,
            cy < h - 1 ? curr + w : -1,
          ];

          for (const n of neighbors) {
            if (n >= 0 && !visited[n]) {
              const np = n * 4;
              if (isLightBg(data[np], data[np + 1], data[np + 2])) {
                visited[n] = 1;
                queue.push(n);
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Background removal fallback:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Compresses an image File or Data URL using HTML5 canvas,
 * ensuring high resolution but small memory footprint (avoids storage quota crashes).
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/webp', quality);
          resolve(compressed);
        } catch {
          const fallback = canvas.toDataURL('image/jpeg', quality);
          resolve(fallback);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

// Lightweight IndexedDB Store for large project images & galleries (prevents 5MB localStorage crash)
const DB_NAME = 'HorizonStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'project_data';

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    if (!db) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('idbSet fallback to localStorage:', e);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    if (!db) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return await new Promise<T | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined && req.result !== null) {
          resolve(req.result as T);
        } else {
          const item = localStorage.getItem(key);
          resolve(item ? JSON.parse(item) : null);
        }
      };
      req.onerror = () => {
        const item = localStorage.getItem(key);
        resolve(item ? JSON.parse(item) : null);
      };
    });
  } catch {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}

