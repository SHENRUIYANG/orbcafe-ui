'use client'

import { FC } from 'react'
import { SAPCardTypeContent } from '../cardTypes'
import { Box } from 'lucide-react'

export const SAPCard: FC<SAPCardTypeContent> = ({ 
  type, 
  manifest
}) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
        <Box className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          SAP Card: {type}
        </h3>
      </div>
      <div className="p-4">
        <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SAPCard;
