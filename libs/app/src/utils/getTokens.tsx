export function getTokens(visitorKeys: Record<string, string[]>): { tokens: any; } {
  return Object.keys(visitorKeys)
    .reduce((tokens, node) => {
      tokens.push([node, 'string']);

      const props = new Set();
      visitorKeys[node].forEach(prop => {
        props.add(prop);

      });
      tokens.push([/[A-Z][a-zA-z]*/, 'string'])

      return tokens;
    }, [[/=[a-zA-Z0-9-_]*/, 'keyword.control']] as any);
}
