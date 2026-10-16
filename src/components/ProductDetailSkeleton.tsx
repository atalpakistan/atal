import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ProductDetailSkeletonProps {
  onBack?: () => void;
}

export const ProductDetailSkeleton: React.FC<ProductDetailSkeletonProps> = ({ onBack }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition py-1.5 px-3 rounded-lg border border-stone-200 bg-white shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-stone-200 rounded"></div>
            <span className="text-stone-300">/</span>
            <div className="h-4 w-20 bg-stone-200 rounded"></div>
            <span className="text-stone-300">/</span>
            <div className="h-4 w-32 bg-stone-200 rounded"></div>
          </div>
        </div>

        <div className="h-8 w-24 bg-stone-200 rounded-lg"></div>
      </div>

      {/* Main Showcase: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Product Image Showcase Skeleton */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-stone-200/80 overflow-hidden border border-stone-200 shadow-sm flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-stone-300/60 animate-ping opacity-40"></div>
          </div>

          <div className="flex items-center gap-3 overflow-x-hidden pb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-200 flex-shrink-0"></div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-200 flex-shrink-0"></div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-200 flex-shrink-0"></div>
          </div>
        </div>

        {/* Right: Buy Box & Details Skeleton */}
        <div className="flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Brand & Reviews */}
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-stone-200 rounded"></div>
              <div className="h-8 w-4/5 bg-stone-300 rounded-lg"></div>
              <div className="h-4 w-40 bg-stone-200 rounded"></div>
            </div>

            {/* Price badge */}
            <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-32 bg-stone-300 rounded-lg"></div>
                <div className="h-5 w-20 bg-stone-200 rounded"></div>
              </div>
              <div className="h-3 w-48 bg-stone-200 rounded"></div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-stone-200 rounded"></div>
              <div className="h-4 w-5/6 bg-stone-200 rounded"></div>
              <div className="h-4 w-2/3 bg-stone-200 rounded"></div>
            </div>

            {/* Variants options placeholder */}
            <div className="space-y-3 pt-2">
              <div className="h-3.5 w-28 bg-stone-200 rounded"></div>
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-stone-200 rounded-xl"></div>
                <div className="h-10 w-24 bg-stone-200 rounded-xl"></div>
                <div className="h-10 w-24 bg-stone-200 rounded-xl"></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4">
              <div className="h-12 flex-1 bg-stone-300 rounded-2xl"></div>
              <div className="h-12 w-28 bg-stone-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
