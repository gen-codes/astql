import * as React from 'react';

import { DirectoryIcon, FileIcon } from '../../icons';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

export interface Props {
  path: string;
  selectFile?: (path: string) => void;
  createFile: (path: string) => void;
  deleteFile: (path: string) => void;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  depth: number;
  isDirOpen?: boolean;
}

export class File extends React.PureComponent<Props> {
  selectFile = (): void => {
    if (this.props.selectFile) {
      this.props.selectFile(this.props.path);
    }
  };
  createFileDialog() {
    const dir = this.props.path.split('/').slice(0, -1).join('/');
    const filename = prompt('filename  ' + dir);
    if (!filename) return;
    const filePath = `${dir}${filename}`;
    console.log(dir, filename, filePath);
    this.props.createFile(filePath);
  }
  render(): React.ReactElement {
    const fileName = this.props.path.split('/').filter(Boolean).pop();
    return (
      <>
        <ContextMenu id={this.props.path}>
          <MenuItem
            disabled={false}
            onClick={() => {
              this.createFileDialog();
            }}
          >
            <button>Create</button>
          </MenuItem>
          <MenuItem
            data={{ foo: 'bar' }}
            onClick={() => {
              this.props.deleteFile(this.props.path);
            }}
          >
            <button>Delete</button>
          </MenuItem>
        </ContextMenu>
        <ContextMenuTrigger id={this.props.path}>
          <button
            className="sp-button sp-explorer"
            data-active={this.props.active}
            onClick={
              this.props.selectFile ? this.selectFile : this.props.onClick
            }
            style={{ paddingLeft: 8 * this.props.depth + 'px' }}
            type="button"
          >
            {this.props.selectFile ? (
              <FileIcon />
            ) : (
              <DirectoryIcon isOpen={this.props.isDirOpen} />
            )}
            {fileName}
          </button>
        </ContextMenuTrigger>
      </>
    );
  }
}
