export function getCompletions(visitorKeys: Record<string, string[]>) {
  return ({ word }: { word: string; }, line: string) => {
    console.log(word)
    if (line.match(/:[a-z]*$/)) {
      return [
        {
          label: 'has',
          insertText: 'has($0)',
        },
        {
          label: 'not',
          insertText: 'not($0)',
        },
        {
          label: 'matches',
          insertText: 'matches($1, $0)',
        },
        {
          label: 'nth-child',
          insertText: 'nth-child($0)',
        },
        {
          label: 'nth-last-child',
          insertText: 'nth-last-child($0)',
        },
        {
          label: 'first-child',
          insertText: 'first-child',
        },
        {
          label: 'last-child',
          insertText: 'last-child',
        },
      ];
    }
    const match = line.match(/([a-zA-Z0-9-_]+)(\[.*?\])*(\[(\[?[^\]]*(?<!=[a-zA-Z]*)$))/);
    if (match) {
      const [, name, ,] = match;
      if (visitorKeys[name]) {
        return visitorKeys[name].map(prop => ({
          label: prop,
          insertText: prop
        }));
      }
    }
    let matches = [] as any;


    if (!word) {
      matches = Object
        .keys(visitorKeys)
        .map(prop => ({
          label: prop,
          insertText: prop
        }));
    } else {
      matches = Object
        .keys(visitorKeys)
        .filter(key => key.startsWith(word))
        .map(prop => ({
          label: prop,
          insertText: prop
        }));

    }
    return matches;
  };
}


