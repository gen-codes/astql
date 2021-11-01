import * as React from 'react';

import { useSandpack } from '../../hooks/useSandpack';

import { QueryList } from './QueryList';

// WIP
export const QueryExplorer: React.FC = () => {
  const { sandpack } = useSandpack();
  console.log('queriiiiiiiiiiiiiiiiiiiii', sandpack)
  return (
    <div>
      <QueryList
        activePath={sandpack.activeQueryPath}
        files={sandpack.queries}
        prefixedPath={'/queries'}
        selectFile={sandpack.openQuery}
        createFile={sandpack.createQuery}
        deleteFile={sandpack.deleteQuery}
      />
    </div>
  );
};
