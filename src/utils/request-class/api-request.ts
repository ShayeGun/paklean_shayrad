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

    abstract call(): Promise<any>
}

export { ApiRequest, Methods }