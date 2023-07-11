import { ApiRequest, Methods } from "./api-request";
import axios from "axios";

interface IGetRequest {
    method: Methods.get,
    url: string
    header: {}
    params?: {}
}

const header = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

class GetRequest extends ApiRequest<IGetRequest> {

    method: IGetRequest["method"] = Methods.get
    url: IGetRequest['url']
    header: IGetRequest['header'] = header;
    private params?: IGetRequest['params']

    constructor(url: IGetRequest['url'] = 'https://postman-echo.com/status/200', params?: IGetRequest['params']) {
        super();
        this.url = url
        if (params) this.params = params
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