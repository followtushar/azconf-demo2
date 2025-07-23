import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  controlCount: number;
}

interface FrameworkSelectorProps {
  frameworks: Framework[];
  selectedFrameworks: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const FrameworkSelector: React.FC<FrameworkSelectorProps> = ({
  frameworks,
  selectedFrameworks,
  onSelectionChange,
}) => {
  const handleFrameworkToggle = (frameworkId: string) => {
    const isSelected = selectedFrameworks.includes(frameworkId);
    if (isSelected) {
      onSelectionChange(selectedFrameworks.filter(id => id !== frameworkId));
    } else {
      onSelectionChange([...selectedFrameworks, frameworkId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFrameworks.length === frameworks.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(frameworks.map(f => f.id));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security framework':
        return 'bg-primary-100 text-primary-800';
      case 'security standard':
        return 'bg-success-100 text-success-800';
      case 'security benchmark':
        return 'bg-warning-100 text-warning-800';
      case 'privacy regulation':
        return 'bg-purple-100 text-purple-800';
      case 'healthcare regulation':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Select All Button */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">
          {selectedFrameworks.length} of {frameworks.length} frameworks selected
        </span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          {selectedFrameworks.length === frameworks.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Framework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map((framework) => {
          const isSelected = selectedFrameworks.includes(framework.id);
          
          return (
            <div
              key={framework.id}
              className={clsx(
                'relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              )}
              onClick={() => handleFrameworkToggle(framework.id)}
            >
              {/* Selection Indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    isSelected
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  )}
                >
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Framework Content */}
              <div className="pr-8">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {framework.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Version {framework.version}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {framework.description}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getCategoryColor(framework.category)
                    )}
                  >
                    {framework.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {framework.controlCount} controls
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {frameworks.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No frameworks available</h3>
          <p className="mt-1 text-sm text-gray-500">
            No compliance frameworks are currently configured.
          </p>
        </div>
      )}
    </div>
  );
};