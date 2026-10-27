// Finds files named in copy.md inside assets/. Names may carry a folder prefix
// ("wfc/anatomy.png"), which can match either "anatomy.png" or "wfc-anatomy.png".
// Matching ignores case and the file ending, so "notion-prompts.jpg" finds "notion-prompts.png".

import type { ImageMetadata } from 'astro';
import { basename, type FileRef } from './content';

const images = import.meta.glob<{ default: ImageMetadata }>('/assets/{images,graphics}/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});
const pdfs = import.meta.glob<string>('/assets/pdfs/*.pdf', { eager: true, query: '?url', import: 'default' });
const videos = import.meta.glob<string>('/assets/videos/*.{mp4,webm}', { eager: true, query: '?url', import: 'default' });

const stem = (file: string) => basename(file).toLowerCase().replace(/\.[a-z0-9]+$/, '');

function candidates(file: string): string[] {
  const parts = file.split('/');
  const name = parts.pop()!;
  const folder = parts.pop();
  return folder ? [name, `${folder}-${name}`] : [name];
}

function lookup<T>(table: Record<string, T>, file: string): T | undefined {
  for (const name of candidates(file)) {
    const key = Object.keys(table).find((path) => stem(path) === stem(name));
    if (key) return table[key];
  }
  return undefined;
}

export const findImage = (ref: FileRef) => lookup(images, ref.file)?.default;
export const findPdf = (ref: FileRef) => lookup(pdfs, ref.file);
export const findVideo = (ref: FileRef) => lookup(videos, ref.file);
export const isPdf = (ref: FileRef) => /\.pdf$/i.test(ref.file);
export const isVideo = (ref: FileRef) => /\.(mp4|webm|mov)$/i.test(ref.file);
