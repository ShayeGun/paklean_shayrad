import axios from 'axios';
import { ApiRequest, Methods } from "./api-request";
import { Token } from '../token';

interface IPostRequest {
    method: Methods.post,
    url: string
    headers: Record<string, string>
    params?: Record<string, string>
    data: Record<string, any>
}

class PostRequest extends ApiRequest<IPostRequest> {

    method: IPostRequest["method"] = Methods.post
    url: IPostRequest['url']
    headers: IPostRequest['headers'];
    private params?: IPostRequest['params'];
    private data: IPostRequest['data'] = {};

    constructor(url: IPostRequest['url'] = 'https://postman-echo.com/post', token: Token, params?: IPostRequest['params']) {
        super();
        this.url = url
        this.params = params ? params : {};

        // default headers
        const t = token.getToken();
        this.headers = { "Authorization": `${t.tokenType} ${t.accessToken}`, "Content-Type": "application/json" }
    }

    setBody(data: IPostRequest['data']) {
        this.data = { ...this.data, ...data }

        return this
    }

    setHeader(header: IPostRequest['headers']) {
        this.headers = { ...this.headers, ...header }

        return this
    }

    async call(): Promise<any> {
        let requestConfig: IPostRequest = {
            url: this.url,
            method: this.method,
            headers: this.headers,
            data: this.data
        }

        if (this.params) requestConfig.params = this.params

        const { data } = await axios(requestConfig)

        return data
    }
}

export { PostRequest }