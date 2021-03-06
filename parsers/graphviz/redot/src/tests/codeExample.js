export default `/**
 * Copy paste in a GraphViz dot file to explore the syntax tree
 */

digraph {
  rankdir=LR
  a [fillcolor=green]
  c [fillcolor=red]
  a -> b
  c -> a [dir="back"]
}
`;
