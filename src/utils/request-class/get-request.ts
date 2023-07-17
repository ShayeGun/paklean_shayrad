import { ApiRequest, Methods } from "./api-request";
import axios from "axios";
import { Token } from "../token"

interface IGetRequest {
    method: Methods.get,
    url: string
    header: Record<string, string>
    params?: Record<string, string>
}

class GetRequest extends ApiRequest<IGetRequest> {

    method: IGetRequest["method"] = Methods.get
    url: IGetRequest['url']
    declare header: IGetRequest['header']
    private params?: IGetRequest['params']

    constructor(url: IGetRequest['url'] = 'https://postman-echo.com/status/200', params?: IGetRequest['params']) {
        super();
        this.url = url
        if (params) this.params = params
    }

    setHeader(header: IGetRequest['header']) {
        this.header = header
    }

    async call(): Promise<any> {
        let requestConfig: IGetRequest = {
            url: this.url,
            method: this.method,
            header: this.header,
        }

        if (this.params) requestConfig.params = this.params
        const { data } = await axios(requestConfig)

        return data
    }
}

export { GetRequest }