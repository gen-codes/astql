import join from 'array/join';

Params = (params: string[])`{{join params ', '}}`(
  imports`import data from 'some'`
  exports`export {{name}}`
)

body = `
  print('Hello ' + data(text) + '!')
`(
  imports`import data from 'some'`
  exports`some`
)

Function = (name:string, parameters:string[], body:Template)`
{{>imports}}
def {{name}}({{Params params=parameters}}):
  {{body}}

{{>exports}}`(
  imports`import data from 'some'`
  exports`export {{name}}`
)


Function(
  'helloworld',
  ['text', 'age'],
  body
)