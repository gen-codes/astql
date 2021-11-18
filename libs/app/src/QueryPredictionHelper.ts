let DomPredictionHelper;
import { diff_match_patch } from "google-diff-match-patch-js";

module.exports = class DomPredictionHelper {
  recursiveNodes(e: { nodeName: any; parentNode: any; }) {
    let n: { push: (arg0: any) => void; };
    if (e.nodeName && e.parentNode && (e !== document.body)) {
      n = this.recursiveNodes(e.parentNode);
    } else {
      n = new Array();
    }
    n.push(e);
    return n;
  }

  escapeCssNames(name: { replace: (arg0: {}, arg1: string) => { (): any; new(): any; replace: { (arg0: {}, arg1: string): { (): any; new(): any; replace: { (arg0: {}, arg1: (e: any) => string): { (): any; new(): any; replace: { (arg0: {}, arg1: string): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; }) {
    if (name) {
      try {
        return name.replace(/\bselectorgadget_\w+\b/g, '').replace(/\\/g, '\\\\').
             replace(/[\#\;\&\,\.\+\*\~\'\:\"\!\^\$\[\]\(\)\=\>\|\/]/g, (e: string) => '\\' + e).replace(/\s+/, '');
      } catch (error) {
        const e = error;
        if (window.console) {
          console.log('---');
          console.log("exception in escapeCssNames");
          console.log(name);
          console.log('---');
        }
        return '';
      }
    } else {
      return '';
    }
  }

  childElemNumber(elem: { previousSibling: any; nodeType: number; }) {
    let count = 0;
    while (elem.previousSibling && (elem = elem.previousSibling)) {
      if (elem.nodeType === 1) { count++; }
    }
    return count;
  }

  siblingsWithoutTextNodes(e: { parentNode: { childNodes: any; }; }) {
    const nodes = e.parentNode.childNodes;
    const filtered_nodes = [];
    for (let node of Array.from(nodes)) {
      if (node.nodeName.substring(0, 1) === "#") { continue; }
      if (node === e) { break; }
      filtered_nodes.push(node);
    }
    return filtered_nodes;
  }

  pathOf(elem: any) {
    let path = "";
    for (let e of Array.from(this.recursiveNodes(elem))) {
      if (e) {
        const siblings = this.siblingsWithoutTextNodes(e);
        if (e.nodeName.toLowerCase() !== "body") {
          // Only look at 2 previous siblings.
          let j = (siblings.length - 2) < 0 ? 0 : siblings.length - 2;
          while (j < siblings.length) {
            if (siblings[j] === e) { break; }
            if (!siblings[j].nodeName.match(/^(script|#.*?)$/i)) {
              path += this.cssDescriptor(siblings[j], true) + ((j + 1) === siblings.length ? "+ " : "~ ");
            }
            j++;
          }
        }
        path += this.cssDescriptor(e) + " > ";
      }
    }
    return this.cleanCss(path);
  }

  cssDescriptor(node: { nodeName: { toLowerCase: () => string; }; id: any; className: string; }, includeContents: boolean) {
    let path = node.nodeName.toLowerCase();
    let escaped = node.id && this.escapeCssNames(new String(node.id));
    if (escaped && (escaped.length > 0)) { path += '#' + escaped; }

    if (node.className && (typeof node.className === 'string') && (node.className !== '')) {
      for (let cssName of Array.from(node.className.split(" "))) {
        escaped = this.escapeCssNames(cssName);
        if (cssName && (escaped.length > 0)) {
          path += '.' + escaped;
        }
      }
    }

    if (includeContents && (jQuerySG(node).contents().length < 5)) { // Not too many children.
      const text = jQuerySG.trim(jQuerySG(node).text().replace(/\s+/g, ' '));
      if ((text.length < 35) && (text.length > 4) && (text.indexOf("\"") === -1)) {
        path += ":contains(\"" + this.encodeContentString(text) + "\")";
      }
    }

    if (node.nodeName.toLowerCase() !== "body") { // nth-child needs to be last.
      path += ':nth-child(' + (this.childElemNumber(node) + 1) + ')';
    }

    return path;
  }

  encodeContentString(str: { replace: (arg0: {}, arg1: string) => any; length: any; charCodeAt: (arg0: number) => any; }) {
    str = str.replace(/\"/, '\\"');
    const out = [];
    for (let i = 0, end = str.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      out.push(str.charCodeAt(i));
    }
    return out.join('-');
  }

  decodeContentString(str: { split: (arg0: string) => any; }) {
    const parts = str.split('-');
    let out = "";
    for (let i = 0, end = parts.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      out += String.fromCharCode(parseInt(parts[i]));
    }
    return out;
  }

  decodeAllContentStrings(str: { replace: (arg0: {}, arg1: (s: any, substr: any) => string) => any; }) {
    return str.replace(/:contains\(\"([\d\-]+)\"\)/gi, (s: any, substr: any) => {
      return ":contains(\"" + this.decodeContentString(substr) + "\")";
    });
  }

  cssDiff(array: { length?: any; }) {
    let dmp: { diff_main: (arg0: any, arg1: any) => any; };
    try {
      dmp = new diff_match_patch();
    } catch (e) {
      throw "Please include the diff_match_patch library.";
    }

    if ((typeof array === 'undefined') || (array.length === 0)) { return ''; }

    const existing_tokens = {};
    const encoded_css_array = this.encodeCssForDiff(array, existing_tokens);

    let collective_common = encoded_css_array.pop();
    for (let cssElem of Array.from(encoded_css_array)) {
      const diff = dmp.diff_main(collective_common, cssElem);
      collective_common = '';
      for (let part of Array.from(diff)) {
        if (part[0] === 0) { collective_common += part[1]; }
      }
    }
    return this.decodeCss(collective_common, existing_tokens);
  }

  tokenizeCss(css_string: any) {
    let skip = false;
    let word = '';
    const tokens = [];

    for (let char of Array.from(this.cleanCss(css_string))) {
      if (skip) {
        skip = false;
      } else if (char === '\\') {
        skip = true;
      } else if ((char === '.') || (char === ' ') || (char === '#') || (char === '>') || (char === ':') || (char === ',') || (char === '+') || (char === '~')) {
        if (word.length > 0) { tokens.push(word); }
        word = '';
      }
      word += char;
      if ((char === ' ') || (char === ',')) {
        tokens.push(word);
        word = '';
      }
    }
    if (word.length > 0) { tokens.push(word); }
    return tokens;
  }

  // Same as tokenizeCss, except that siblings are treated as single tokens.
  tokenizeCssForDiff(css_string: any) {
    let combined_tokens = [];
    let block = [];

    for (let token of Array.from(this.tokenizeCss(css_string))) {
      block.push(token);
      if ((token === ' ') && (block.length > 0)) {
        combined_tokens = combined_tokens.concat(block);
        block = [];
      } else if ((token === '+') || (token === '~')) {
        block = [block.join('')];
      }
    }
    if (block.length > 0) {
      return combined_tokens.concat(block);
    } else {
      return combined_tokens;
    }
  }

  decodeCss(string: { split: (arg0: string) => any; }, existing_tokens: {}) {
    const inverted = this.invertObject(existing_tokens);
    let out = '';
    for (let character of Array.from(string.split(''))) {
      out += inverted[character];
    }
    return this.cleanCss(out);
  }

  // Encode css paths for diff using unicode codepoints to allow for a large number of tokens.
  encodeCssForDiff(strings: any, existing_tokens: { [x: string]: any; }) {
    let codepoint = 50;
    const strings_out = [];
    for (let string of Array.from(strings)) {
      let out = new String();
      for (let token of Array.from(this.tokenizeCssForDiff(string))) {
        if (!existing_tokens[token]) {
          existing_tokens[token] = String.fromCharCode(codepoint++);
        }
        out += existing_tokens[token];
      }
      strings_out.push(out);
    }
    return strings_out;
  }

  tokenPriorities(tokens: {}) {
    const epsilon = 0.001;
    const priorities = new Array();
    let i = 0;
    for (let token of Array.from(tokens)) {
      let first = token.substring(0, 1);
      const second = token.substring(1, 2);
      if ((first === ':') && (second === 'n')) { // :nth-child
        priorities[i] = 0;
      } else if ((first === ':') && (second === 'c')) { // :contains
        priorities[i] = 1;
      } else if (first === '>') { // >
        priorities[i] = 2;
      } else if ((first === '+') || (first === '~')) { // + and ~
        priorities[i] = 3;
      } else if ((first !== ':') && (first !== '.') && (first !== '#') && (first !== ' ') &&
              (first !== '>') && (first !== '+') && (first !== '~')) { // elem, etc.
          priorities[i] = 4;
      } else if (first === '.') { // classes
        priorities[i] = 5;
      } else if (first = '#') { // ids
        priorities[i] = 6;
        if (token.match(/\d{3,}/)) {
          priorities[i] = 2.5;
        }
      } else {
        priorities[i] = 0;
      }
      priorities[i] += i * epsilon;
      i++;
    }
    return priorities;
  }

  orderFromPriorities(priorities: { [x: string]: any; length: any; }) {
    let i: number;
    let asc: boolean, end: number;
    let asc1: boolean, end1: number;
    const tmp = new Array();
    const ordering = new Array();
    for (i = 0, end = priorities.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      tmp[i] = { value: priorities[i], original: i };
    }
    tmp.sort((a: { value: number; }, b: { value: number; }) => a.value - b.value);
    for (i = 0, end1 = priorities.length, asc1 = 0 <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
      ordering[i] = tmp[i].original;
    }
    return ordering;
  }

  simplifyCss(css: string, selected: any, rejected: any) {
    const parts = this.tokenizeCss(css);
    const priorities = this.tokenPriorities(parts);
    const ordering = this.orderFromPriorities(priorities);
    const selector = this.decodeAllContentStrings(this.cleanCss(css));
    const look_back_index = -1;
    let best_so_far = "";
    if (this.selectorGets('all', selected, selector) && this.selectorGets('none', rejected, selector)) { best_so_far = selector; }
    let got_shorter = true;
    while (got_shorter) {
      got_shorter = false;
      for (let i = 0, end = parts.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        const part = ordering[i];

        if (parts[part].length === 0) { continue; }
        const first = parts[part].substring(0, 1);
        const second = parts[part].substring(1, 2);
        if (first === ' ') { continue; }
        if (this.wouldLeaveFreeFloatingNthChild(parts, part)) { continue; }

        this._removeElements(part, parts, first, (selector: string) => {
          if (this.selectorGets('all', selected, selector) && this.selectorGets('none', rejected, selector) &&
             ((selector.length < best_so_far.length) || (best_so_far.length === 0))) {
            best_so_far = selector;
            got_shorter = true;
            return true;
          } else {
            return false;
          }
        });
      }
    }
    return this.cleanCss(best_so_far);
  }

  // Remove some elements depending on whether this is a sibling selector or not, and put them back if the block returns false.
  _removeElements(part: number, parts: { [x: string]: any; slice?: any; join?: any; }, firstChar: string, callback: { (selector: any): boolean; (arg0: any): any; }) {
    let j: number, look_back_index: number;
    let asc: boolean, end: number;
    if ((firstChar === '+') || (firstChar === '~')) {
      look_back_index = this.positionOfSpaceBeforeIndexOrLineStart(part, parts);
    } else {
      look_back_index = part;
    }

    const tmp = parts.slice(look_back_index, part + 1); // Save a copy of these parts.
    for (j = look_back_index, end = part, asc = look_back_index <= end; asc ? j <= end : j >= end; asc ? j++ : j--) {
      parts[j] = '';
    } // Clear it out.

    const selector = this.decodeAllContentStrings(this.cleanCss(parts.join('')));

    if ((selector === '') || !callback(selector)) {
      let asc1: boolean, end1: number;
      for (j = look_back_index, end1 = part, asc1 = look_back_index <= end1; asc1 ? j <= end1 : j >= end1; asc1 ? j++ : j--) {
        parts[j] = tmp[j - look_back_index];
      } // Put it back.
    }

    return parts;
  }

  positionOfSpaceBeforeIndexOrLineStart(part: any, parts: { [x: string]: string; }) {
    let i = part;
    while ((i >= 0) && (parts[i] !== ' ')) {
      i--;
    }
    if (i < 0) { i = 0; }
    return i;
  }

  // Has to handle parts with zero length.
  wouldLeaveFreeFloatingNthChild(parts: { [x: string]: string; length?: any; }, part: number) {
    let nth_child_is_on_right: boolean;
    let space_is_on_left = (nth_child_is_on_right = false);

    let i = part + 1;
    while ((i < parts.length) && (parts[i].length === 0)) {
      i++;
    }
    if ((i < parts.length) && (parts[i].substring(0, 2) === ':n')) { nth_child_is_on_right = true; }

    i = part - 1;
    while ((i > -1) && (parts[i].length === 0)) {
      i--;
    }
    if ((i < 0) || (parts[i] === ' ')) { space_is_on_left = true; }

    return space_is_on_left && nth_child_is_on_right;
  }

  // Not intended for user CSS, does destructive sibling removal.  Expects strings to be escaped, such as in :contains.
  cleanCss(css: string) {
    let cleaned_css = css;
    let last_cleaned_css = null;
    while (last_cleaned_css !== cleaned_css) {
      last_cleaned_css = cleaned_css;
      cleaned_css = cleaned_css.replace(/(^|\s+)(\+|\~)/, '').replace(/(\+|\~)\s*$/, '').replace(/>/g, ' > ').
                                replace(/\s*(>\s*)+/g, ' > ').replace(/,/g, ' , ').replace(/\s+/g, ' ').
                                replace(/^\s+|\s+$/g, '').replace(/\s*,$/g, '').replace(/^\s*,\s*/g, '').replace(/\s*>$/g, '').
                                replace(/^>\s*/g, '').replace(/[\+\~\>]\s*,/g, ',').replace(/[\+\~]\s*>/g, '>').replace(/\s*(,\s*)+/g, ' , ');
    }
    return cleaned_css;
  }

  // Takes wrapped
  getPathsFor(nodeset: any) {
    const out = [];
    for (let node of Array.from(nodeset)) {
      if (node && node.nodeName) {
        out.push(this.pathOf(node));
      }
    }
    return out;
  }

  // Takes wrapped
  predictCss(s: { length: number; }, r: any) {
    if (s.length === 0) { return ''; }
    const selected_paths = this.getPathsFor(s);
    const css = this.cssDiff(selected_paths);
    const simplest = this.simplifyCss(css, s, r);

    // Do we get off easy?
    if (simplest.length > 0) { return simplest; }

    // Okay, then make a union and possibly try to reduce subsets.
    let union = '';
    for (let selected of Array.from(s)) {
      union = this.pathOf(selected) + ", " + union;
    }
    union = this.cleanCss(union);

    return this.simplifyCss(union, s, r);
  }

  // Assumes list is jQuery node-set.  Todo: There is room for memoization here.
  selectorGets(type: string, list: { length: number; not: (arg0: any) => { (): any; new(): any; length: number; }; is: (arg0: any) => any; }, the_selector: string) {
    if ((list.length === 0) && (type === 'all')) { return false; }
    if ((list.length === 0) && (type === 'none')) { return true; }

    try {
      if (type === 'all') {
        return list.not(the_selector).length === 0;
      } else { // none
        return !(list.is(the_selector));
      }
    } catch (e) {
      if (window.console) { console.log("Error on selector: " + the_selector); }
      throw e;
    }
  }

  invertObject(object: { [x: string]: any; }) {
    const new_object = {};
    for (let key in object) {
      const value = object[key];
      new_object[value] = key;
    }
    return new_object;
  }

  cssToXPath(css_string: any) {
    const tokens = this.tokenizeCss(css_string);
    if (tokens[0] && (tokens[0] === ' ')) { tokens.splice(0, 1); }
    if (tokens[tokens.length - 1] && (tokens[tokens.length - 1] === ' ')) { tokens.splice(tokens.length - 1, 1); }

    let css_block = [];
    let out = "";

    for (let token of Array.from(tokens)) {
      if (token === ' ') {
        out += this.cssToXPathBlockHelper(css_block);
        css_block = [];
      } else {
        css_block.push(token);
      }
    }

    return out + this.cssToXPathBlockHelper(css_block);
  }

  // Process a block (html entity, class(es), id, :nth-child()) of css
  cssToXPathBlockHelper(css_block: { length?: any; }) {
    if (css_block.length === 0) { return '//'; }
    let out = '//';
    let first = css_block[0].substring(0,1);

    if (first === ',') { return " | "; }

    if ([':', '#', '.'].includes(first)) { out += '*'; }

    const expressions = [];
    let re = null;

    for (let current of Array.from(css_block)) {
      first = current.substring(0,1);
      const rest = current.substring(1);

      if (first === ':') {
        // We only support :nth-child(n) at the moment.
        if (re = rest.match(/^nth-child\((\d+)\)$/)) {
          expressions.push('(((count(preceding-sibling::*) + 1) = ' + re[1] + ') and parent::*)');
        }
      } else if (first === '.') {
        expressions.push('contains(concat( " ", @class, " " ), concat( " ", "' + rest + '", " " ))');
      } else if (first === '#') {
        expressions.push('(@id = "' + rest + '")');
      } else if (first === ',') {
      } else {
        out += current;
      }
    }

    if (expressions.length > 0) { out += '['; }
    for (let i = 0, end = expressions.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      out += expressions[i];
      if (i < (expressions.length - 1)) { out += ' and '; }
    }
    if (expressions.length > 0) { out += ']'; }
    return out;
  }
};