import * as monacoInstalled from 'monaco-editor/esm/vs/editor/editor.api';
import type * as monacoEditorForTypes from 'monaco-editor';

import * as React from 'react';
import { MonacoEditorProps } from 'react-monaco-editor/lib/types';
import { noop, processSize } from 'react-monaco-editor/lib/utils';

export interface SwizzledMonacoEditorProps extends MonacoEditorProps {
  monaco: typeof monacoEditorForTypes;
  filename: string;
  getCompletions?: any;
  tokens?: any;
  themeRules?: any;
}

class MonacoEditor extends React.Component<SwizzledMonacoEditorProps> {
 

  static defaultProps = {
    width: '100%',
    height: '100%',
    value: null,
    defaultValue: '',
    theme: null,
    options: {},
    overrideServices: {},
    editorDidMount: noop,
    editorWillMount: noop,
    onChange: noop,
    className: null,
  };

  editor?: monacoInstalled.editor.IStandaloneCodeEditor;

  private containerElement?: HTMLDivElement;

  // private _subscription: monacoInstalled.IDisposable;

  private __prevent_trigger_change_event?: boolean;

  constructor(props: SwizzledMonacoEditorProps) {
    super(props);
    this.containerElement = undefined;
  }

  componentDidMount() {
    this.initMonaco();
  }

  componentDidUpdate(prevProps: SwizzledMonacoEditorProps) {
    const { value, language, theme, height, options, width, className } =
      this.props;
    if(language !== prevProps.language) {
      setTimeout(() => {
        this.registerLanguage()

      },100)
    }
    const { editor } = this;
    // @ts-expect-error
    const model = editor.getModel();

    if (this.props.value != null && this.props.value !== model?.getValue()) {
      this.__prevent_trigger_change_event = true;
      this.editor?.pushUndoStop();
      // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
      if (!model) return;
      // @ts-expect-error
      model.pushEditOperations(
        [],
        [
          {
            range: model?.getFullModelRange(),
            text: value,
          },
        ]
      );
      this.editor?.pushUndoStop();
      this.__prevent_trigger_change_event = false;
    }
    if (prevProps.language !== language) {
      this.props.monaco?.editor.setModelLanguage(model, language);
    }
    if (prevProps.theme !== theme) {
      this.props.monaco.editor.setTheme(theme);
    }
    if (editor && (width !== prevProps.width || height !== prevProps.height)) {
      editor.layout();
    }
    if (prevProps.options !== options) {
      // Don't pass in the model on update because monaco crashes if we pass the model
      // a second time. See https://github.com/microsoft/monaco-editor/issues/2027
      const { model: _model, ...optionsWithoutModel } = options;
      editor.updateOptions({
        ...(className ? { extraEditorClassName: className } : {}),
        ...optionsWithoutModel,
      });
    }
  }

  componentWillUnmount() {
    this.destroyMonaco();
  }

  assignRef = (component: HTMLDivElement) => {
    this.containerElement = component;
  };

  destroyMonaco() {
    if (this.editor) {
      this.editor.dispose();
      const model = this.editor.getModel();
      if (model) {
        model.dispose();
      }
    }
    if (this._subscription) {
      this._subscription.dispose();
    }
  }
  registerLanguage() { 
    const { language, monaco } = this.props;
    if(this.props.language){
        monaco.languages.register({ id: language });

        monaco.languages.registerCompletionItemProvider(language || 'javascript', {
          provideCompletionItems: (model, position) => {
            var textUntilPosition = model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column});
            console.log('provide completions')
            var word = model.getWordUntilPosition(position);
            var range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
          };
          
            const completions = this.props
            .getCompletions(word, textUntilPosition)
            .map((c)=>{
              if(c.insertText.includes('$0')){
                c.kind= monaco.languages.CompletionItemKind.Text
                c.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
              }else{
                c.kind= monaco.languages.CompletionItemKind.Text
              }
              c.range = range
              return c
            })
            return {
              
              suggestions: completions
            }
          }
        });
      // }
      if(this.props.tokens){
        monaco.languages.setMonarchTokensProvider(language || 'javascript', {
          tokenizer: {
            root: this.props.tokens
          }
        });
      }
    }
    // this.setState({completions: true})
   }
  initMonaco() {
    const value =
      this.props.value != null ? this.props.value : this.props.defaultValue;
    const { language, overrideServices, className, monaco } = this.props;
    if (this.containerElement) {
      
      // Before initializing monaco editor
      // const options = { ...this.props.options, ...this.editorWillMount() };
      let model;
      const languageFile =
        language ||
        {
          css: 'css',
          js: 'javascript',
          json: 'json',
          md: 'markdown',
          mjs: 'javascript',
          ts: 'typescript',
          html: 'html',
          py: 'python',
        }[this.props.filename.split('.').pop()] ||
        'javascript';

      model = this.props.monaco.editor.getModel(
        this.props.monaco.Uri.parse(`file:///${this.props.filename}`)
      );
      if (!model) {
        model = this.props.monaco.editor.createModel(
          value || '',
          languageFile,
          this.props.monaco.Uri.parse(`file:///${this.props.filename}`)
        );
      }

      this.editor = this.props.monaco.editor.create(
        this.containerElement,
        {
          value,
          language,
          model,
         
          // ...(className ? { extraEditorClassName: className } : {}),
          // ...options,
          // ...(theme ? { theme } : {}),
        },
        overrideServices
      );
      if(this.props.getCompletions){
        console.log('register')
        this.registerLanguage()

      }
      // setTimeout(() => {
      // },10)
      // setTimeout(() => {
      //   // this.registerLanguage()

      // },1000)

      // After initializing monaco editor
      this.editorDidMount(this.editor);
    }
  }

  editorWillMount() {
    const { editorWillMount } = this.props;
    const options = editorWillMount(this.props.monaco);
    return options || {};
  }

  editorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    this.props.editorDidMount(editor, this.props.monaco);

    this._subscription = editor.onDidChangeModelContent((event) => {
      if (!this.__prevent_trigger_change_event) {
        this.props.onChange(editor.getValue(), event);
      }
    });
  }

  render() {
    const { width, height } = this.props;
    const fixedWidth = processSize(width || '');
    const fixedHeight = processSize(height || '');
    const style = {
      width: fixedWidth,
      height: fixedHeight,
    };

    return (
      <>
      {this.props.language}

      <div
        ref={this.assignRef}
        style={style}
        className="react-monaco-editor-container"
      />
      </>
    );
  }
}

export default MonacoEditor;
