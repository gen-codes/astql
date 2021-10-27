export function getTransformerByID(id: any): any;
export class Parser {
    constructor(id: any, options: any);
    id: any;
    cache: {};
    categoryByID: {};
    parserByID: {};
    category: any;
    parser: any;
    parse: (source: any, options?: any) => any;
    getParserByID(id: any): any;
    loadCategory(catName: any): any;
    getDefaultParser(category: any): any;
}
