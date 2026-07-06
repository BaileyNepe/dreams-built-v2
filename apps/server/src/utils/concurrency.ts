/**
 * Create a promise-based semaphore that limits how many async tasks run at once.
 *
 * `run(fn)` waits for a free slot, executes `fn`, then releases the slot (even if
 * `fn` throws). Used to bound concurrent, memory-heavy work such as PDF/image
 * optimization so a burst of uploads can't exhaust the container's memory.
 */
export function createSemaphore(max: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const release = () => {
    active--;
    const next = queue.shift();
    if (next) {
      active++;
      next();
    }
  };

  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= max) {
      await new Promise<void>((resolve) => {
        queue.push(resolve);
      });
    } else {
      active++;
    }

    try {
      return await fn();
    } finally {
      release();
    }
  };
}
