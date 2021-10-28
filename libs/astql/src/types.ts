/**
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
