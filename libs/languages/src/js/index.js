export const id = 'javascript';
export const displayName = 'JavaScript';
export const mimeTypes = ['text/javascript'];
export const fileExtensions = ['js', 'jsx', 'ts', 'tsx'];
export const decideParser = (filename) => {
  const extension = filename.split('.').pop();
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'typescript';
  }
};
export const defaultParser = 'babylon';
