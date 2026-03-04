/**
 * Extract primary and secondary colors from client logo using node-vibrant.
 * Returns hex strings for use in templates.
 */

import { Vibrant } from 'node-vibrant/node';

/**
 * @param {string} imagePath - Absolute or relative path to logo image
 * @returns {Promise<{ primary: string, secondary: string }>}
 */
export async function extractColors(imagePath) {
  try {
    const palette = await Vibrant.from(imagePath).getPalette();
    const primary = palette.Vibrant?.hex ?? palette.DarkVibrant?.hex ?? palette.Muted?.hex ?? '#c41e3a';
    const secondary = palette.DarkVibrant?.hex ?? palette.Muted?.hex ?? palette.DarkMuted?.hex ?? '#2d2d2d';
    return { primary, secondary };
  } catch {
    return { primary: '#c41e3a', secondary: '#2d2d2d' };
  }
}
