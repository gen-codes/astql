import React, { FC } from 'react';
import { Text } from 'ink';
import { Init } from 'astql/Init';
const App: FC<{ config?: string; init?: boolean }> = ({
  config = './astql.config.js',
  init,
}) => {
  if (init) {
    return <Init config={config} />;
  }
  return (
    <Text>
      <Text color="green">astql --init</Text> is only available for now
    </Text>
  );
};

module.exports = App;
export default App;
