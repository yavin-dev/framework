/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { ensure, Task } from 'effection';

export function isTask(maybeTask: unknown): maybeTask is Task {
  return typeof maybeTask === 'object' && !!maybeTask && 'halt' in maybeTask;
}

export async function maybeHalt(maybeTask: unknown) {
  if (isTask(maybeTask)) {
    await maybeTask.halt();
  }
}

export function ensureHalt(maybeTask: unknown) {
  return ensure(async () => {
    await maybeHalt(maybeTask);
  });
}
