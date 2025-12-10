'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

export default function CatchAllPage() {
  // This will trigger the not-found.tsx page
  notFound();
}
