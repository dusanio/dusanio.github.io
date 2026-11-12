/// <reference path="../.astro/types.d.ts" />

/** Runtime globals shared between the layout and pages (set up in layouts/Layout.astro). */
interface Window {
  __site: { stageProjects: { slug: string; logo: string; accent: string }[]; timeZone: string };
  __stage?: Promise<import('./scripts/stage/stage').Stage | null>;
  /** Shared nav state: pages call set() when the current mode/project changes. */
  __nav: {
    set(mode: import('./scripts/stage/stage').StageMode, project: number): void;
    mode: import('./scripts/stage/stage').StageMode;
    project: number;
  };
}
