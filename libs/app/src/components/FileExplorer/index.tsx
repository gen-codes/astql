import * as React from 'react';

import { useSandpack } from '../../hooks/useSandpack';

import { ModuleList } from './ModuleList';

// WIP
export const FileExplorer: React.FC = ({prefixedPath}:any) => {
  const { sandpack } = useSandpack();

  return (
    <div>
      <ModuleList
        activePath={sandpack.activePath}
        files={sandpack.files}
        prefixedPath={prefixedPath || "/"}
        selectFile={sandpack.openFile}
        createFile={sandpack.createFile}
        deleteFile={sandpack.deleteFile}
      />
    </div>
  );
};
