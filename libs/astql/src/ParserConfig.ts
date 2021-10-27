import { ASTNode } from "./CodeParser";

export default interface ParserConfig {
  showInMenu: boolean;
  _ignoredProperties: Set<any>;
  locationProps: Set<any>;
  typeProps: Set<string>;
  loadParser(callback: (parser: any)=>void): void
  parse(parser: any, code: string,options?: any): ASTNode | ASTNode[];
  visitorKeys: Record<string, string[]>;
  /**
   * Whether or not the provided node should be automatically expanded.
   */
  opensByDefault(_node: any, _key: any): boolean;
  /**
   * The start and end indicies of the node in the source text. The return value
   * is an array of form `[start, end]`. This is used for highlighting source
   * text and focusing nodes in the tree.
   */
  nodeToRange(node: any): any;
  /**
   * A more or less human readable name of the node.
   */
  getNodeName(node: any): any;
  /**
   * A generator to iterate over each "property" of the node. Overwriting this
   * function allows a parser to expose information from a node if the node
   * is not implemented as plain JavaScript object.
   */
  forEachProperty(node: any): Generator<{
    value: any;
    key: string;
    computed: boolean;
  }, void, unknown>;
  /**
   * Many parsers accept settings, usually as plain JavaScript
   * objects, with simple values (boolean, string, number) assigned to
   * properties. We provided a way to describe these options to automatically
   * render a UI for them.
   *
   * The settings configuration object can describe
   *   - boolean options, rendered as checkboxes
   *   - list options, rendered as selectors
   *   - nested option objects.
   *
   * A settings configuration object has the following properties:
   *
   *   - title: A heading that should be rendered above the options, useful
   *            for nested settings objects.
   *   - fields: An array of settings definitions, see blow.
   *   - required: A set of option names whose value cannot change, but should
   *               be shown in the UI to inform the user.
   *   - update: An optional function that gets passed the current settings
   *             object the name of a setting and the new value of the setting.
   *             It should return an updated settings object.
   *             This is mostly useful for nested options where the settings
   *             value should not just be assigned to the name.
   *   - key: Property name in the parent object to which a nested settings
   *          object should be assigned.
   *
   * Field definitions: The `fields` array can contain the following values
   *
   *   - string: A simple boolean option, will be rendered as checkbox
   *   - array: An array of the form
   *            `[<setting name>, <setting values>, <optional value mapper>]`
   *            Will be rendered as selector.
   *      - <setting name>: The name of the setting on the settings object.
   *      - <setting values>: An array of available options
   *      - <value mapper>: An optional function that converts the value
   *                        received from the selector to the correct value
   *                        set on the settings object (useful for e.g. numbers)
   *   - a settings configuration object: Same structured as described above,
   *                                      used to describe nested options.
   *
   */
  _getSettingsConfiguration(defaultOptions: any): {
    fields: string[];
  };
  hasSettings(): boolean;
  /**
   * A complete settings object passed to the parser that defines the default
   * value for each option.
   */
  getDefaultOptions(): {};
  /**
   * Defines how to merge default options into current options. While this may
   * not seem necessary, we don't know which version of the options are stored
   * in a snippet or the client browser, so this function is called to ensure
   * that all options are set.
   */
  _mergeDefaultOptions(currentOptions: any, defaultOptions: any): any;
}
