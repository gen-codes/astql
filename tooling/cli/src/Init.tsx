import React, { FC, useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import fs from 'fs';
import MultiSelectInput from 'ink-multi-select';
import Spinner from 'ink-spinner';
import { languages } from '@astql/core';
import fetch from 'node-fetch';

export const Init: FC<{ config: string }> = ({ config }) => {
  const [langs, setLangs] = useState<[]>([]);
  const [currentLang, setCurrentLang] = useState(null);
  const [currentParsers, setCurrentParsers] = useState([]);
  const [parsers, setParsers] = useState([]);
  const handleLangSubmit = (items) => {
    setLangs(items.map(({ value }) => value));
    setCurrentLang(items[0].value);
  };
  const handleParsersSubmit = (items) => {
    const newCurrentLang =
      langs[langs?.findIndex((v) => v === currentLang) + 1];
    setParsers(parsers.concat(items.map((v) => v.value)));
    setCurrentLang(newCurrentLang);
    setCurrentParsers([]);
  };
  useEffect(() => {
    if (!currentLang && langs.length) {
      fs.writeFileSync(
        config,
        JSON.stringify(
          {
            parsers,
          },
          null,
          2
        )
      );
    }
  }, [currentLang]);
  const langOptions = useMemo(() => {
    return Object.keys(languages).map((lang) => ({
      value: lang,
      label: languages[lang].displayName,
    }));
  }, []);
  useEffect(() => {
    fetch(
      `https://www.npmjs.com/search/suggestions?q=@astql/${currentLang}`,
      {}
    ) //+keywords:${currentLang}
      .then((res) => res.json())
      .then((npmResponse) => {
        const validatedPackages = npmResponse.filter((pkg) =>
          pkg.name.startsWith(`@astql/${currentLang}.`)
        );
        if (validatedPackages.length === 1) {
          handleParsersSubmit([{ value: validatedPackages[0].name }]);
        } else {
          setCurrentParsers(
            npmResponse
              .reduce(
                (accParsers, parser) => [
                  ...accParsers,
                  parser.name.startsWith(`@astql/${currentLang}.`) && {
                    label: `${parser.name.replace(
                      `@astql/${currentLang}.`,
                      ''
                    )} ${parser.description ? `-- ${parser.description}` : ''}`,
                    value: parser.name,
                  },
                ],
                []
              )
              .filter((p) => p)
          );
        }
      });
  }, [currentLang]);
  return (
    <Box>
      {!langs.length && (
        <>
          <Text>Select languages:</Text>
          <MultiSelectInput
            items={langOptions}
            onSubmit={handleLangSubmit}
            limit={10}
          />
        </>
      )}
      {currentLang && (
        <>
          <Text>Select parser for {currentLang}</Text>
          {currentParsers.length ? (
            <MultiSelectInput
              items={currentParsers}
              onSubmit={handleParsersSubmit}
            ></MultiSelectInput>
          ) : (
            <Spinner type="triangle" />
          )}
        </>
      )}
      {!currentLang && langs.length && (
        <Text>
          Astql configuration saved successfully in{' '}
          <Text color="green">./astql.config.js</Text>
        </Text>
      )}
    </Box>
  );
};
