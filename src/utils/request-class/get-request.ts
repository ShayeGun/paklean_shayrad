import { ApiRequest, Methods } from "./api-request";
import axios from "axios";
import { IToken } from "../token"
import { generateUniqueNumber } from "../generate-unique-number";

interface IGetRequest {
    method: Methods.get,
    url: string
    headers: Record<string, string>
    params?: Record<string, string>
}

class GetRequest extends ApiRequest<IGetRequest> {

    method: IGetRequest["method"] = Methods.get
    url: IGetRequest['url']
    headers: IGetRequest['headers']
    private params?: IGetRequest['params']

    constructor(url: IGetRequest['url'] = 'https://postman-echo.com/status/200', token: IToken, params?: IGetRequest['params']) {
        super();
        this.url = url
        this.params = params ? params : {};

        // default headers
        const t = token.getToken();
        this.headers = { "Authorization": `${t.tokenType} ${t.accessToken}` }
    }

    setHeader(header: IGetRequest['headers']) {
        this.headers = { ...this.headers, ...header }

        return this
    }

    async call(): Promise<any> {
        this.setHeader({ activityId: generateUniqueNumber() });

        let requestConfig: IGetRequest = {
            url: this.url,
            method: this.method,
            headers: this.headers,
        }

        if (this.params) requestConfig.params = this.params
        const { data } = await axios(requestConfig)

        return data
    }
}

export { GetRequest }