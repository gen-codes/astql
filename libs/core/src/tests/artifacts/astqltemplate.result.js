import {join} from 'array';

export const Params(params: string[]): string {
  const {file, partial} = useContext(FileContext)
  hb.registerHelper('join', join)
  const template = file.compile(`{{join params ', '}}`)
  return template({ params}) 
}

export const body = new Template(`
print('Hello ' + data(text) + '!')
`, {
  imports: `import data from 'some'`,
  exports: ``
})

export const Function = (
  name:string, 
  params:string[], 
  body:Template, 
  above: Template, 
  below: Template
) => {
  const {file, partial} = useContext(FileContext)
  file.registerSlot('imports', ()=> return metadata(body, above, below))
  file.registerSlot('exports', ()=>return metadata(body, above, below))
  hb.registerHelper('Params', Params)
  const template = file.compile(`{{>imports}}
function {{name}}({{Params params}}){
  {{body}}
}
{{>exports}}`)
  return template({name, params, body}) 
}

export default Function(
  'helloworld',
  ['text', 'age'],
  body
)