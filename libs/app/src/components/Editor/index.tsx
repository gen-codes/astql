import type * as monacoEditorForTypes from 'monaco-editor';
import React from 'react';
import type ReactMonacoEditorForTypes from 'react-monaco-editor';
import type { EditorDidMount } from 'react-monaco-editor';
import { LineAndColumnComputer } from './LineAndColumnComputer';
import { Spinner } from './Spinner';
import loader from '@monaco-editor/loader';
import ReactMonacoEditor from './MonacoEditor';


export interface CodeEditorProps {
  width?: string | number;
  height?: string | number;
  id?: string;
  onChange?: (text: string) => void;
  onSave?: () => void;
  onClick?: (range: [number, number]) => void;
  text: string;
  highlight?: { start: number; end: number } | undefined;
  showInfo?: boolean;
  readOnly?: boolean;
  renderWhiteSpace?: boolean;
  editorDidMount?: EditorDidMount;
  types?: string[];
  filePath?: string;
  language?: string;
  getCompletions?: any;
  tokens?: any;
  themeRules?: any;
}

export interface CodeEditorState {
  position: number;
  lineNumber: number;
  column: number;
  editorComponent: typeof ReactMonacoEditorForTypes | undefined | false;
  monaco?: typeof monacoEditorForTypes;
}
export class CodeEditor extends React.Component<
  CodeEditorProps,
  CodeEditorState
> {
  private editor: monacoEditorForTypes.editor.IStandaloneCodeEditor | undefined;
  private outerContainerRef = React.createRef<HTMLDivElement>();
  private disposables: monacoEditorForTypes.IDisposable[] = [];
  private monaco?: typeof monacoEditorForTypes;
  constructor(props: CodeEditorProps) {
    super(props);
    this.state = {
      position: 0,
      lineNumber: 1,
      column: 1,
      editorComponent: undefined,
      monaco: undefined,
    };
    this.editorDidMount = this.editorDidMount.bind(this);

    // const reactMonacoEditorPromise = import("react-monaco-editor");
    loader
      .init()
      .then((monacoEditor) => {
        this.monaco = monacoEditor;
        monacoEditor.languages.typescript.typescriptDefaults.setCompilerOptions(
          {
            target: monacoEditor.languages.typescript.ScriptTarget.Latest,
            allowNonTsExtensions: true,
            moduleResolution:
              monacoEditor.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monacoEditor.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            jsx: monacoEditor.languages.typescript.JsxEmit.React,
            reactNamespace: 'React',
            allowJs: true,
            typeRoots: ['node_modules/@types'],
          }
        );
        monacoEditor.languages.typescript.typescriptDefaults.addExtraLib(
          `declare module "react" {
        <react.d.ts goes here>
        }`,
          'react'
        );
        // if(props.types){
        //   const MONACO_LIB_PREFIX: string = 'file:///node_modules/';
        //   props.types.forEach(type => {
        //     const path = `${MONACO_LIB_PREFIX}${type}`;

        //   })
        // }
        this.setState({ monaco: monacoEditor });

        // reactMonacoEditorPromise.then(editor => {
        //   this.setState({ editorComponent: editor.default });
        // }).catch(err => {
        //   console.error(err);
        //   this.setState({ editorComponent: false });
        // });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  render() {
    this.updateHighlight();
    return this.getEditor();
  }

  componentWillUnmount() {
    for (const disposable of this.disposables) disposable.dispose();
    this.disposables.length = 0; // clear
  }

  private getInfo() {
    return (
      <div className={'editorInfo'}>
        Pos {this.state.position}, Ln {this.state.lineNumber}, Col{' '}
        {this.state.column}
      </div>
    );
  }

  private deltaDecorations: string[] = [];
  private lineAndColumnComputer = new LineAndColumnComputer('');
  private updateHighlight() {
    if (this.editor == null) return;

    if (this.lineAndColumnComputer.text !== this.props.text)
      this.lineAndColumnComputer = new LineAndColumnComputer(this.props.text);

    const { highlight } = this.props;
    const lineAndColumnComputer = this.lineAndColumnComputer;
    const range = getRange();
    this.deltaDecorations = this.editor.deltaDecorations(
      this.deltaDecorations,
      range == null
        ? []
        : [
            {
              range,
              options: { className: 'editorRangeHighlight' },
            },
          ]
    );
    function getRange(): monacoEditorForTypes.IRange | undefined {
      if (highlight == null) return undefined;

      const startInfo = lineAndColumnComputer.getNumberAndColumnFromPos(
        highlight[0]
      );
      const endInfo = lineAndColumnComputer.getNumberAndColumnFromPos(
        highlight[1]
      );
      return {
        startLineNumber: startInfo.lineNumber,
        startColumn: startInfo.column,
        endLineNumber: endInfo.lineNumber,
        endColumn: endInfo.column,
      };
    }
  }

  private getEditor() {
    if (!this.monaco) {
      return <Spinner backgroundColor="#1e1e1e" />;
    }
    return (
      <ReactMonacoEditor
        width={this.props.width || '100%'}
        height={this.props.height || '200px'}
        value={this.props.text}
        // theme="vs-dark"

        filename={
          this.props.filePath
            ? `${this.props.filePath.replace(/^\//, '')}`
            : 'file.tsx'
        }
        monaco={this.monaco}
        language={this.props.language}
        tokens={this.props.tokens}
        themeRules={this.props.themeRules}
        getCompletions={this.props.getCompletions}
        onChange={(text) => this.props.onChange && this.props.onChange(text)}
        editorDidMount={this.editorDidMount}
        options={{
          automaticLayout: false,
          renderWhitespace: 'all',
          minimap: { enabled: false },
          readOnly: this.props.readOnly,
          quickSuggestions: true,
          occurrencesHighlight: false,
          selectionHighlight: false,
          codeLens: true,
          suggestOnTriggerCharacters: false,
        }}
      />
    );
  }

  private editorDidMount(
    editor: monacoEditorForTypes.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditorForTypes
  ) {
    this.editor = editor;
    
    // use lf newlines
    editor.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);
    if (this.props.onSave)
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
        this.props.onSave
      );
    this.disposables.push(
      editor.onDidChangeCursorPosition((e) => {
        const editorModel = editor.getModel();
        if (editorModel == null) return;

        this.setState({
          position: editorModel.getOffsetAt(e.position),
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        });
      })
    );
    this.disposables.push(
      editor.onMouseDown((e) => {
        if (
          e.target == null ||
          e.target.range == null ||
          this.props.onClick == null
        )
          return;

        // Sometimes e.target.range will be the column right before if clicked to the left enough,
        // but the cursor position will still be at the next column. For that reason, always
        // use the editor posiion.
        const pos = editor.getPosition();
        if (pos != null) {
          const start = this.lineAndColumnComputer.getPosFromLineAndColumn(
            pos.lineNumber,
            pos.column
          );
          this.props.onClick([start, start]);
        }
      })
    );

    // manually refresh the layout of the editor (lightweight compared to monaco editor)
    let lastHeight = 0;
    let lastWidth = 0;
    const intervalId = setInterval(() => {
      const containerElement = this.outerContainerRef.current;
      if (containerElement == null) return;

      const width = containerElement.offsetWidth;
      const height = containerElement.offsetHeight;
      if (lastHeight === height && lastWidth === width) return;

      editor.layout();

      lastHeight = height;
      lastWidth = width;
    }, 500);
    this.disposables.push({ dispose: () => clearInterval(intervalId) });

    this.updateHighlight();

    if (this.props.editorDidMount) this.props.editorDidMount(editor, monaco);
  }
}

export interface SandpackCodeEditorProps {
  customStyle?: React.CSSProperties;
  showTabs?: boolean;
  showLineNumbers?: boolean;
  showInlineErrors?: boolean;
  showRunButton?: boolean;
  wrapContent?: boolean;
  closableTabs?: boolean;
}

export default CodeEditor