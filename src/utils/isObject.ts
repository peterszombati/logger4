export function isObject(obj: any) {
  return obj && obj.constructor && obj.constructor.name === "Object"
}
