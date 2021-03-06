export default `# Paste or drop some GraphQL queries or schema
# definitions here and explore the syntax tree
# created by the GraphQL parser.

query GetUser($userId: ID!) {
  user(id: $userId) {
    id,
    name,
    isViewerFriend,
    profilePicture(size: 50)  {
      ...PictureFragment
    }
  }
}

fragment PictureFragment on Picture {
  uri,
  width,
  height
}
`;
