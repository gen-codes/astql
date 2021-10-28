export default function multiquire(deps,callback){
  const resolved: any = [];
  for(let i = 0; i < deps.length; i++){
    resolved.push(require(deps[i]));
  }
  callback(...resolved);
};