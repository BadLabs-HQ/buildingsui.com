import { links } from '../config';

export type Meme = { id: string; title: string; src: string; by?: string };

// Curated wall. To approve a submission, add an entry with `src: walrusMeme('<blob id>')` and redeploy.
const local = (file: string) => `/memes/${file}.svg`;
export const walrusMeme = (blobId: string) => links.walrusBlob(blobId);

export const MEMES: Meme[] = [
  { id: 'gm-builders', title: 'gm builders', src: local('gm-builders') },
  { id: 'wen-build', title: 'Wen build', src: local('wen-build') },
  { id: 'hard-hat-on', title: 'Hard hat on', src: local('hard-hat-on') },
  { id: 'family-dinner', title: 'Family dinner', src: local('family-dinner') },
  { id: 'sui-gas', title: 'Gas fees on Sui', src: local('sui-gas') },
  { id: 'floor-one', title: 'Floor 1', src: local('floor-one') },
];

export const TEMPLATES: Meme[] = [
  { id: 'template-classic', title: 'Classic builder', src: local('template-classic') },
  { id: 'template-duo', title: 'Builder duo', src: local('template-duo') },
];
