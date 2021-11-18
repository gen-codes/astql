import React, { useEffect } from 'react';
import { useClasser } from '@code-hike/classer';
import { RunButton } from '../../common/RunButton';
import { SandpackLayout } from '../../common/Layout';
import { SandpackStack } from '../../common/Stack';
import { useActiveCode, useActiveQueryCode } from '../../hooks/useActiveCode';
import { useSandpack } from '../../hooks/useSandpack';
import { FileTabs } from '../FileTabs';
import {
  ignoreKeysFilter,
  locationInformationFilter,
  functionFilter,
  emptyKeysFilter,
  typeKeysFilter,
} from '../ASTOutput/core/TreeAdapter.js';
import ASTOutput from '../ASTOutput';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import { FileExplorer } from '../FileExplorer';
import { Navigator } from '../Navigator';
import { SandpackCodeEditorProps, CodeEditor } from '../Editor';
import { QueryExplorer } from '../QueryExplorer';

import { getCompletions } from '../../utils/getCompletions';
import { getTokens } from '../../utils/getTokens';
import { Code } from '@astql/core/';
`
$func():

|
import $=join(imports, ',') from $.module
$for variable in vars:

$/

`
export const SandpackCodeEditor: React.FC<SandpackCodeEditorProps> = ({
  showTabs,
  showRunButton = false,
}) => {
  const { sandpack } = useSandpack();
  const { code, updateCode } = useActiveCode();
  const { code: queryCode, updateCode: updateQueryCode } = useActiveQueryCode();
  const { activePath, activeQueryPath, status, editorState } = sandpack;
  const shouldShowTabs = showTabs ?? sandpack.openPaths.length > 1;
  const c = useClasser('sp');
  const [config, setConfig] = React.useState(null);
  const [ast, setAst] = React.useState({});
  const handleCodeUpdate = (newCode: string) => {
    updateCode(newCode);
  };
  console.log(queryCode)
  useEffect(() => {
    if (!queryCode || !ast.treeAdapter || !ast.treeAdapter.options.visitorKeys) return;
    const code = activeQueryPath
      .replace(/^\/queries\//, '')
      .replace(/\/index.astql$/, '')
      .split('/')
      .reduce((files, query, index) => {
        if (index !== 0) {
          files.push(files[index - 1].concat([query]))

        } else {
          files.push(['/queries', query])
        }
        return files;
      }, [])
      .reduce((res, value) => {
        const file = [...value, 'index.astql'].join('/')

        const code = sandpack.queries[file] && sandpack.queries[file].code || ''
        res += ` ${code}`
        return res
      }, '')

    console.log('queries', code)
    try {
      const result = esquery(ast.initial, code, {
        visitorKeys: {
          ...ast.treeAdapter.options.visitorKeys,
        }
      })
      if (result.length > 0) {
        setAst({ ...ast, ast: result })
      } else {
      }

    } catch (err) {
      console.log(err)
      setAst({ ...ast, ast: ast.initial })
    }
  }, [queryCode, ast.treeAdapter])
  const handleQueryCodeUpdate = (newCode: string) => {
    updateQueryCode(newCode);
  };
  React.useEffect(() => {
    setTimeout(() => {
      try {
        setConfig(getConfig(activePath.split('.').pop()));
      } catch (err) {
        setConfig(null);
      }
    }, 1000);
  }, [activePath]);
  React.useEffect(() => {
    if (!config || !activePath.endsWith(config.fileExtension)) return;
    const newParser = config.parsers[0].default;
    const treeAdapter = getTreeAdapter(newParser);
    newParser.loadParser(function ({ parse }) {
      const parsed = parse(code, newParser.getDefaultOptions())
      const visitorKeys = getObjectsWithType(parsed)
      treeAdapter.options.visitorKeys = visitorKeys
      const { tokens } = getTokens(visitorKeys)
      // regex to get everything but specific word
      console.log(tokens)

      tokens.push([/[A-Z][a-zA-z]*/, 'string'])
      treeAdapter.monaco = {
        tokens,
        getCompletions: getCompletions(visitorKeys)
      }
      setAst({ treeAdapter, ast: parsed, initial: parsed });
    });
  }, [config, code]);
  console.log('activeQueryPath', activeQueryPath)
  return (
    <ReactSplit direction={SplitDirection.Horizontal}>
      <SandpackLayout>
        <div style={{ height: '50vh' }}>
          <FileExplorer prefixedPath={'/code'} />

        </div>

        <SandpackStack>
          {shouldShowTabs ? <FileTabs closableTabs={true} /> : null}

          {/* <Navigator /> */}

          <CodeEditor
            key={activePath}
            text={code}
            // editorState={editorState}
            filePath={activePath}
            onChange={handleCodeUpdate}
            onClick={sandpack.setHighlight}
            highlight={sandpack.highlight}
            height={'50vh'}

          />
          <CodeEditor
            text={queryCode || 'sdsdsd'}
            onChange={handleQueryCodeUpdate}
            filePath={activeQueryPath || 'indexd.astql'}
          />
          {showRunButton && status === 'idle' ? <RunButton /> : null}
        </SandpackStack>
      </SandpackLayout>
      <SandpackLayout>
        <QueryExplorer></QueryExplorer>

        <SandpackStack>
          <CodeEditor
            text={queryCode || 'sdsdsd'}
            onChange={handleQueryCodeUpdate}
            filePath={activeQueryPath || 'index.astql'}
          />
            {/* {config && ast.treeAdapter && ast.treeAdapter.monaco  && <CodeEditor
                // height={'500px'}
                text={queryCode || ''}
                onChange={handleQueryCodeUpdate}
                filePath={activeQueryPath || 'index.astql'}
                language={activeQueryPath.endsWith('astql')?`${config.id}-ast`:undefined}
                {...ast.treeAdapter.monaco}
              ></CodeEditor>} */}
          {/* <ReactSplit direction={SplitDirection.Vertical}>

            <ASTOutput
              parseResult={ast}
              position={sandpack.highlight && sandpack.highlight[0]}
            ></ASTOutput>

          </ReactSplit> */}
        </SandpackStack>
      </SandpackLayout>
    </ReactSplit>

  )
  return (
    <ReactSplit direction={SplitDirection.Horizontal}>
      <SandpackLayout>
        <div style={{ height: '50vh' }}>
          <FileExplorer prefixedPath={'/code'} />

        </div>

        <SandpackStack>
          {shouldShowTabs ? <FileTabs closableTabs={true} /> : null}

          {/* <Navigator /> */}

          <CodeEditor
            key={activePath}
            text={code}
            // editorState={editorState}
            filePath={activePath}
            onChange={handleCodeUpdate}
            onClick={sandpack.setHighlight}
            highlight={sandpack.highlight}
            height={'50vh'}

          />
          {showRunButton && status === 'idle' ? <RunButton /> : null}
        </SandpackStack>
      </SandpackLayout>
      {/* <SandpackPreview /> */}
      <SandpackLayout>
        <QueryExplorer></QueryExplorer>

        <SandpackStack>
          <CodeEditor
            text={queryCode || 'sdsdsd'}
            onChange={handleQueryCodeUpdate}
            filePath={activeQueryPath || 'index.astql'}
          />
          <ReactSplit direction={SplitDirection.Vertical}>
            {/* {config && ast.treeAdapter && ast.treeAdapter.monaco  && <CodeEditor
                // height={'500px'}
                text={queryCode || ''}
                onChange={handleQueryCodeUpdate}
                filePath={activeQueryPath || 'index.astql'}
                language={activeQueryPath.endsWith('astql')?`${config.id}-ast`:undefined}
                {...ast.treeAdapter.monaco}
              ></CodeEditor>} */}

            <ASTOutput
              parseResult={ast}
              position={sandpack.highlight && sandpack.highlight[0]}
            ></ASTOutput>

          </ReactSplit>
        </SandpackStack>
      </SandpackLayout>
    </ReactSplit>
  );
};

function getTreeAdapter(newParser: any) {
  return {
    type: 'default',
    monaco: {},
    options: {
      openByDefault: (newParser.opensByDefault || (() => false)).bind(
        newParser
      ),
      nodeToRange: newParser.nodeToRange.bind(newParser),
      nodeToName: newParser.getNodeName.bind(newParser),
      walkNode: newParser.forEachProperty.bind(newParser),
      visitorKeys: newParser.visitorKeys,
      filters: [
        ignoreKeysFilter(newParser._ignoredProperties),
        functionFilter(),
        emptyKeysFilter(),
        locationInformationFilter(newParser.locationProps),
        typeKeysFilter(newParser.typeProps),
      ],
      locationProps: newParser.locationProps,
    },
  };
}
