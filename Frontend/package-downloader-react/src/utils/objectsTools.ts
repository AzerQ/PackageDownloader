export function objectsAreEqual(first: any, second: any): boolean {
   return Object.keys({ ...first, ...second }).every(key => first[key] === second[key]);
}

export function cloneObject<T, U extends T = T>(object: T, sourceObject?: U | undefined) : U {
   return Object.assign(
      sourceObject != undefined ?
         sourceObject :
         Object.create(Object.getPrototypeOf(object)),
      object);
}