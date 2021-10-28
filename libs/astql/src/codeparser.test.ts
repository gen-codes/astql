import { Query } from '.';
import { Code } from './CodeParser';
const text = `/**
* @ui-type molecule
* @ui-group Layout/Page
*
* @link https://devs.pages.grnet.gr/digigov/digigov-sdk/docs/styles/layout#common-layouts
* @link https://devs.pages.grnet.gr/digigov/digigov-sdk/docs/start-pages
* @description
*
* A common two-third/one-third page layout. [hello](/lala)
*
* 
* @slot header
* The header section of the page.
* Do not place any logos here.
* 
* @slot main
* The main section of the page (2/3)
* 
*/
export interface Test extends Component {
 props: {
   /**
    * the ratio of the main  
   */
   ratio: string,
 };
 children: [
   /**
    * @slot header
    * 
    * The header section of the page.
    * Do not place any logos here.
    */
   Header,
   /**
    * The main section of the page.
    * Do not place any logos here.
    */
   Slot<'main', MainCol>,
   /**
    * @slot side
    * The side section of the page.
    * Do not place any logos here.
    */
   Slot<'side', SideCol>,
   Slot<'footer', H1 | Paragraph>,
   Slot<'footer2', (H1 | Paragraph)[]>,
   Slot<'footer3', [H1 , Paragraph]>,
   Slot<'footer3', [H1 , Paragraph][]>,
}
`
const code = new Code('src/types.ts', text, {
  parser: 'js.typescript',
});
const objectKey = (key)=>{
  return (arr)=>{
    return arr.reduce((acc, obj) => {
      const objKey = obj[key];
      return {
        ...acc,
        [objKey]: obj,
      };
    },{});

  };
};
const jsDocTagName = (slot) => slot.comment.split('\n')[0].trim();
const jsDocTagDescription = (slot) => slot.comment.split('\n').slice(1).join('\n').trim();

const queries: Query = {

  interfaces: [
    {
      selector: 'InterfaceDeclaration:has(ExportKeyword)',
      data: {
        name: '>Identifier.escapedText',

        props: [
          {
            selector:
              'PropertySignature[name.escapedText=props] PropertySignature',
            data: {
              name: '>Identifier.escapedText',
              description: 'JSDocComment.comment',
            },
          },
        ],
        //     children: [
        //       {
        //         selector: 'PropertySignature[name.escapedText=children]',
        //         data: {
        //           tuple: [
        //             {
        //               selector: 'TupleType',
        //               data: {
        //                 __data: '',
        //                 name: 'Identifier.escapedText',
        //                 string: 'StringKeyword',
        //                 type: 'TypeReference',
        //                 optional: 'OptionalType',
        //               },
        //             },
        //           ],
        //           array: [
        //             {
        //               selector: 'ArrayType',
        //               data: {
        //                 __data: '',
        //                 name: 'Identifier.escapedText',
        //                 string: 'StringKeyword',
        //                 type: 'TypeReference',
        //                 optional: 'OptionalType',
        //               },
        //             },
        //           ],
        //           union: ['ParanthesizedType'],
        //           // name: '>Identifier.escapedText',
        //         },
        //       },
        //     ],
        slots: [{
          selector: 'JSDocTag[tagName.escapedText=slot]',
          data: {
            name: [jsDocTagName],
            description: [jsDocTagDescription],
          }
        }],
        slots__fromChildrenClass: [{
          selector: `PropertySignature[name.escapedText=children]
           TypeReference:has(Identifier[escapedText=Slot])
          `,
          data: {
            name: 'LiteralType StringLiteral.text',
            description: {
              __anyOf: [
                {
                  value: 'JSDocTag[tagName.escapedText=slot]',
                  transform: jsDocTagDescription,    
                },
                {
                  value: 'JSDocComment.comment',
                  // transform: (value) => value.comment,
                },
              ]
            },
            components: [{
              selector: 'TypeReference',
              data: {
                name: '>Identifier.escapedText',
              }
            }]
          },
          transform: objectKey('name'),
        }],
      
        slots__fromChildrenJSDoc: [{
          selector: `PropertySignature[name.escapedText=children]
           TypeReference:has(JSDocTag[tagName.escapedText=slot])
          `,
          data: {
            name: {
              value: 'JSDocTag[tagName.escapedText=slot]',
              transform: jsDocTagName,
            },
            description: {
              value: 'JSDocTag[tagName.escapedText=slot]',
              transform: jsDocTagDescription,
            },

            components: [{
              selector: 'TypeReference',
              data: {
                name: 'JSDocTag[tagName.escapedText=slot]',
                components: '>Identifier.escapedText',
              }
            }]
          }
        }],
        type: 'JSDocTag[tagName.escapedText=ui-type].comment',
        skip: 'JSDocTag[tagName.escapedText=doc-skip]',
        links: 'JSDocTag[tagName.escapedText=link].comment',
        group: 'JSDocTag[tagName.escapedText=ui-group].comment',
        position: 'JSDocTag[tagName.escapedText=ui-position].comment',
        description: 'JSDocTag[tagName.escapedText=description].comment',
      },
    },
  ],
};
export async function test(){
  await code.parse();
  const result = await code.query(queries);
  return result
}

describe('match', function() {

  it('unknown selector type', async function() {
    expect(await test()).toMatchSnapshot();
  });
});