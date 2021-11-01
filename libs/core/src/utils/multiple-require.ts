export default async function multiquire(deps, callback) {
  const resolved: any = [];
  for (let i = 0; i < deps.length; i++) {
    resolved.push(await import(deps[i]));
  }
  callback(...resolved);
}
