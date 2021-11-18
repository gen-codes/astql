
import join from 'array/join';
import join from 'array/join';

export const  Params(params: string[]): string {
  const {file, partial} = useContext(FileContext)
  const template = file.compile(`{{join params ', '}}`)
  return template({ params}) 
}

export const  Function(name:string, parameters:string[], body:Template): string {
  const {file, partial} = useContext(FileContext)
  const template = file.compile(`
{{>imports}}
def {{name}}({{Params params=parameters}}):
  {{body}}

{{>exports}}`)
  return template({ params}) 
})}  
