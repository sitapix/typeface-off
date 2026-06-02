export const prerender = true;
import { fonts } from '$lib';

export async function load() {
  return {
    fonts
  };
}
