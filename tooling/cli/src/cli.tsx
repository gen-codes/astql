#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './App';

const cli = meow(
  `
	Usage
	  $ astql <files>

	Options
		--config <configPath>  Path to astql configuration file (default: ./astql.config.js)
    --init Initialize astql
	Examples
	  $ astql --config=../astql.common.js
	  $ astql --init
	  
`,
  {
    flags: {
      config: {
        type: 'string',
      },
      init: {
        type: 'boolean',
      },
    },
  }
);

render(<App {...cli.flags} />);
