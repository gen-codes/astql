/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

class Reference {
  parent: any;
  key: any;
  constructor(parent, key) {
    this.parent = parent;
    this.key = key;
  }
  replace = (node) => {
    this.parent[this.key] = node;
  };

  remove = () => {
    if (Array.isArray(this.parent)) {
      this.parent.splice(this.key, 1);
      return true;
    } else {
      this.replace(null);
      return false;
    }
  };
}

function NodeElement(this: any, node, path, wrap, ref) {
  this.node = node;
  this.path = path;
  this.wrap = wrap;
  this.ref = ref;
}
const BREAK = {};
const SKIP = {};
const REMOVE = {};
class Controller {
  __current: any;
  __leavelist: any;
  __state: null;
  __worklist: any;
  __keys: any;
  __fallback: any;
  visitor: any;
  root: any;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  // API:
  // return property path array from root to current node
  path = () => {
    let i, iz, j, jz, element;

    function addToPath(result, path) {
      if (Array.isArray(path)) {
        for (j = 0, jz = path.length; j < jz; ++j) {
          result.push(path[j]);
        }
      } else {
        result.push(path);
      }
    }

    // root node
    if (!this.__current.path) {
      return null;
    }

    // first node is sentinel, second node is root element
    const result = [];
    for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
      element = this.__leavelist[i];
      addToPath(result, element.path);
    }
    addToPath(result, this.__current.path);
    return result;
  };

  // API:
  // return type of current node
  type = () => {
    const node = this.current();
    return node._type || this.__current.wrap;
  };

  // API:
  // return array of parent elements
  parents = () => {
    let i, iz;

    // first node is sentinel
    const result: any = [];
    for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
      result.push(this.__leavelist[i].node);
    }

    return result;
  };

  // API:
  // return current node
  current = () => {
    return this.__current.node;
  };

  __execute = (callback, element) => {
    let result;

    result = undefined;

    const previous = this.__current;
    this.__current = element;
    this.__state = null;
    if (callback) {
      result = callback.call(
        this,
        element.node,
        this.__leavelist[this.__leavelist.length - 1].node
      );
    }
    this.__current = previous;

    return result;
  };

  // API:
  // notify control skip / break
  notify = (flag) => {
    this.__state = flag;
  };

  // API:
  // skip child nodes of current node
  skip = () => {
    this.notify(SKIP);
  };
  // API:
  // remove node
  remove = () => {
    this.notify(REMOVE);
  };
  traverse = (root, visitor) => {
    let element,
      node,
      nodeType,
      ret,
      key,
      current,
      current2,
      candidates,
      candidate;

    this.__initialize(root, visitor);

    const sentinel = {};

    // reference
    const worklist = this.__worklist;
    const leavelist = this.__leavelist;

    // initialize
    worklist.push(new NodeElement(root, null, null, null));
    leavelist.push(new NodeElement(null, null, null, null));

    while (worklist.length) {
      element = worklist.pop();

      if (element === sentinel) {
        element = leavelist.pop();

        ret = this.__execute(visitor.leave, element);

        if (this.__state === BREAK || ret === BREAK) {
          return;
        }
        continue;
      }

      if (element.node) {
        ret = this.__execute(visitor.enter, element);

        if (this.__state === BREAK || ret === BREAK) {
          return;
        }

        worklist.push(sentinel);
        leavelist.push(element);

        if (this.__state === SKIP || ret === SKIP) {
          continue;
        }

        node = element.node;
        nodeType = node._type || element.wrap;
        candidates = this.__keys[nodeType];
        if (!candidates) {
          if (this.__fallback) {
            candidates = this.__fallback(node);
          } else {
            throw new Error(`Unknown node type ${nodeType}.`);
          }
        }

        current = candidates.length;
        while ((current -= 1) >= 0) {
          key = candidates[current];
          candidate = node[key];
          if (!candidate) {
            continue;
          }

          if (Array.isArray(candidate)) {
            current2 = candidate.length;
            while ((current2 -= 1) >= 0) {
              if (!candidate[current2]) {
                continue;
              }

              if (candidateExistsInLeaveList(leavelist, candidate[current2])) {
                continue;
              }

              if (isNode(candidate[current2])) {
                element = new NodeElement(
                  candidate[current2],
                  [key, current2],
                  null,
                  null
                );
              } else {
                continue;
              }
              worklist.push(element);
            }
          } else if (isNode(candidate)) {
            if (candidateExistsInLeaveList(leavelist, candidate)) {
              continue;
            }

            worklist.push(new NodeElement(candidate, key, null, null));
          }
        }
      }
    }
  };

  replace = (root, visitor) => {
    let node,
      nodeType,
      target,
      element,
      current,
      current2,
      candidates,
      candidate,
      key;

    function removeElem(element) {
      let i, key, nextElem, parent;

      if (element.ref.remove()) {
        // When the reference is an element of an array.
        key = element.ref.key;
        parent = element.ref.parent;

        // If removed from array, then decrease following items' keys.
        i = worklist.length;
        while (i--) {
          nextElem = worklist[i];
          if (nextElem.ref && nextElem.ref.parent === parent) {
            if (nextElem.ref.key < key) {
              break;
            }
            --nextElem.ref.key;
          }
        }
      }
    }

    this.__initialize(root, visitor);

    const sentinel = {};

    // reference
    const worklist = this.__worklist;
    const leavelist = this.__leavelist;

    // initialize
    const outer = {
      root,
    };
    element = new NodeElement(root, null, null, new Reference(outer, 'root'));
    worklist.push(element);
    leavelist.push(element);

    while (worklist.length) {
      element = worklist.pop();

      if (element === sentinel) {
        element = leavelist.pop();

        target = this.__execute(visitor.leave, element);

        // node may be replaced with null,
        // so distinguish between undefined and null in this place
        if (
          target !== undefined &&
          target !== BREAK &&
          target !== SKIP &&
          target !== REMOVE
        ) {
          // replace
          element.ref.replace(target);
        }

        if (this.__state === REMOVE || target === REMOVE) {
          removeElem(element);
        }

        if (this.__state === BREAK || target === BREAK) {
          return outer.root;
        }
        continue;
      }

      target = this.__execute(visitor.enter, element);

      // node may be replaced with null,
      // so distinguish between undefined and null in this place
      if (
        target !== undefined &&
        target !== BREAK &&
        target !== SKIP &&
        target !== REMOVE
      ) {
        // replace
        element.ref.replace(target);
        element.node = target;
      }

      if (this.__state === REMOVE || target === REMOVE) {
        removeElem(element);
        element.node = null;
      }

      if (this.__state === BREAK || target === BREAK) {
        return outer.root;
      }

      // node may be null
      node = element.node;
      if (!node) {
        continue;
      }

      worklist.push(sentinel);
      leavelist.push(element);

      if (this.__state === SKIP || target === SKIP) {
        continue;
      }

      nodeType = node._type || element.wrap;
      candidates = this.__keys[nodeType];
      if (!candidates) {
        if (this.__fallback) {
          candidates = this.__fallback(node);
        } else {
          throw new Error(`Unknown node type ${nodeType}.`);
        }
      }

      current = candidates.length;
      while ((current -= 1) >= 0) {
        key = candidates[current];
        candidate = node[key];
        if (!candidate) {
          continue;
        }

        if (Array.isArray(candidate)) {
          current2 = candidate.length;
          while ((current2 -= 1) >= 0) {
            if (!candidate[current2]) {
              continue;
            }
            if (isNode(candidate[current2])) {
              element = new NodeElement(
                candidate[current2],
                [key, current2],
                null,
                new Reference(candidate, current2)
              );
            } else {
              continue;
            }
            worklist.push(element);
          }
        } else if (isNode(candidate)) {
          worklist.push(
            new NodeElement(candidate, key, null, new Reference(node, key))
          );
        }
      }
    }

    return outer.root;
  };

  __initialize = (root, visitor) => {
    this.visitor = visitor;
    this.root = root;
    this.__worklist = [];
    this.__leavelist = [];
    this.__current = null;
    this.__state = null;
    this.__fallback = null;
    if (visitor.fallback === 'iteration') {
      this.__fallback = Object.keys;
    } else if (typeof visitor.fallback === 'function') {
      this.__fallback = visitor.fallback;
    }

    this.__keys = {};
    if (visitor.keys) {
      this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
    }
    // API:
    // break traversals
    this['break'] = () => {
      this.notify(BREAK);
    };
  };
}

function isNode(node) {
  if (node == null) {
    return false;
  }
  return typeof node === 'object' && typeof node._type === 'string';
}

function candidateExistsInLeaveList(leavelist, candidate) {
  for (let i = leavelist.length - 1; i >= 0; --i) {
    if (leavelist[i].node === candidate) {
      return true;
    }
  }
  return false;
}

function traverse(root, visitor) {
  const controller = new Controller();
  return controller.traverse(root, visitor);
}

function replace(root, visitor) {
  const controller = new Controller();
  return controller.replace(root, visitor);
}

export default {
  traverse,
  replace,
  Controller,
};
