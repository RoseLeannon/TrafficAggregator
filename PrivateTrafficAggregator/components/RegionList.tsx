'use client';

import { RegionData } from '@/hooks/useRegions';
import { RegionCard } from './RegionCard';

interface RegionListProps {
  regions: RegionData[];
  loading: boolean;
}

export function RegionList({ regions, loading }: RegionListProps) {
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4">Loading region data...</p>
      </div>
    );
  }

  if (regions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No regions registered yet. Admin can register regions using the admin panel.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {regions.map((region) => (
        <RegionCard key={region.name} region={region} />
      ))}
    </div>
  );
}
