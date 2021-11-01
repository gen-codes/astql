import * as React from 'react';

import { useSandpack } from '../../hooks/useSandpack';

import { ModuleList } from './ModuleList';

// WIP
export const QueryExplorer: React.FC = () => {
  const { sandpack } = useSandpack();
  return (
    <div>
      <button onClick={() => sandpack.createQuery(window.prompt('filename'))}>
        Create file
      </button>
      <ModuleList
        activePath={sandpack.activeQueryPath}
        files={sandpack.queries}
        prefixedPath={'queries'}
        selectFile={sandpack.openQuery}
        createFile={sandpack.createQuery}
        deleteFile={sandpack.deleteQuery}
      />
    </div>
  );
};
