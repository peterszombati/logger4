import {isObject} from './isObject'

export class JsonError extends Error {
  public params: any

  constructor(message: string, params: any = {}) {
    super(message)
    this.params = isObject(params) ? params : {params}
  }
}