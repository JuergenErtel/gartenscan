import { PlantNetProvider } from './plantnet';
import { MockIdentificationProvider } from './mock';
import type { IdentificationProvider } from './types';

export function getIdentificationProvider(): IdentificationProvider {
  if (process.env.IDENTIFICATION_PROVIDER === 'mock') {
    return new MockIdentificationProvider();
  }

  return new PlantNetProvider({
    apiKey: process.env.PLANTNET_API_KEY ?? '',
    project: process.env.PLANTNET_PROJECT ?? 'weurope',
  });
}
