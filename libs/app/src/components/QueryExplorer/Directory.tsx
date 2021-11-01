import type { SandpackBundlerFiles } from '@codesandbox/sandpack-client';
import * as React from 'react';

import { Query } from './Query';
import { QueryList } from './QueryList';

export interface Props {
  prefixedPath: string;
  files: SandpackBundlerFiles;
  selectFile: (path: string) => void;
  createFile: (path: string) => void;
  deleteFile: (path: string) => void;
  activePath: string;
  depth: number;
}

interface State {
  open: boolean;
}

export class Directory extends React.Component<Props, State> {
  state = {
    open: true,
  };

  toggleOpen = (): void => {
    // this.setState((state) => ({ open: !state.open }));
    console.log(this.props.prefixedPath);
    this.props.selectFile(this.props.prefixedPath+'index.astql');
    // if(!this.state.open){
    // }
  };

  render(): React.ReactElement {
    const {
      prefixedPath,
      files,
      selectFile,
      activePath,
      depth,
      createFile,
      deleteFile,
    } = this.props;

    return (
      <div key={prefixedPath}>
        <Query
          depth={depth}
          isDirOpen={this.state.open}
          onClick={this.toggleOpen}
          path={prefixedPath + '/'}
          createFile={createFile}
          deleteFile={deleteFile}
        />

        {this.state.open ? (
          <QueryList
            activePath={activePath}
            depth={depth}
            files={files}
            prefixedPath={prefixedPath}
            selectFile={selectFile}
            createFile={createFile}
            deleteFile={deleteFile}
          />
        ) : null}
      </div>
    );
  }
}
