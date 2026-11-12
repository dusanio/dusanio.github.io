import type { TransitionDirectionalAnimations } from 'astro';

/**
 * Page change as one continuous motion: the camera starts gliding the moment a link is clicked
 * (see Layout), while the old content dissolves upward and the new content resolves in.
 */
const anim = {
  old: { name: 'contentOut', duration: '0.5s', easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fillMode: 'both' },
  new: { name: 'contentIn', duration: '0.9s', delay: '0.3s', easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fillMode: 'both' },
};
export const stageSwap: TransitionDirectionalAnimations = { forwards: anim, backwards: anim };
