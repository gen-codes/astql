import 'array/join';
import 'str/lowerCase';


Params = (params: string[])`{{join params ', '}}``
body = `
  print('Hello ' + data(text) + '!')
`(
  imports`import data from 'some'`
  exports``
)

Function = (name:string, parameters:string[], body:Template)`
{{>imports}}
def {{name}}({{Params params=parameters}}):
  {{body}}

{{>exports}}``


Function(
  helloworld,
  ['text', 'age'],
  body
)

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