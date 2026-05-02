'use client';

import { useState } from 'react';
import { DeleteScanSheet } from './DeleteScanSheet';

interface Props {
  scanId: string;
}

export function ScanFooterActions({ scanId }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <section className="px-5 pt-6">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap-press w-full py-3 text-center text-[13px] font-medium text-berry-700 transition"
        >
          Scan löschen
        </button>
      </section>

      {sheetOpen && (
        <DeleteScanSheet scanId={scanId} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}
