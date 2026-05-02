'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DeletePlantSheet } from './DeletePlantSheet';

interface Props {
  plantId: string;
  plantNickname: string;
  scanCount: number;
}

export function PlantActions({ plantId, plantNickname, scanCount }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <section className="px-5 pt-8">
        <Button
          href="/scan/new"
          fullWidth
          size="lg"
          iconLeft={<Camera className="h-5 w-5" />}
        >
          Neuen Scan machen
        </Button>
      </section>

      <section className="px-5 pt-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap-press w-full py-3 text-center text-[13px] font-medium text-berry-700 transition"
        >
          Pflanze löschen
        </button>
      </section>

      {sheetOpen && (
        <DeletePlantSheet
          plantId={plantId}
          plantNickname={plantNickname}
          scanCount={scanCount}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
