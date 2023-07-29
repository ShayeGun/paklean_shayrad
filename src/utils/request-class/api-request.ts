import { IToken } from "../token"

enum Methods {
    post = 'post',
    get = 'get',
    delete = 'delete',
}

interface IRequest {
    method: Methods,
    url: string,
    headers: {}
}

abstract class ApiRequest<T extends IRequest>{
    protected abstract method: T['method']
    protected abstract url: T["url"]
    protected abstract headers: T["headers"]

    abstract call(token: IToken): Promise<any>
}

export { ApiRequest, Methods }