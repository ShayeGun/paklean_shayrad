import { Token } from "../token"

enum Methods {
    post = 'POST',
    get = 'GET',
    delete = 'DELETE',
}

interface IRequest {
    method: Methods,
    url: string,
    header: {}
}

abstract class ApiRequest<T extends IRequest>{
    protected abstract method: T['method']
    protected abstract url: T["url"]
    protected abstract header: T["header"]

    abstract call(token: Token): Promise<any>
}

export { ApiRequest, Methods }