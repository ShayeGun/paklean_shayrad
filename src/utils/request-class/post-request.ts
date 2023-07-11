import axios from 'axios';
import { ApiRequest, Methods } from "./api-request";

interface IPostRequest {
    method: Methods.post,
    url: string
    header: {}
    params?: {}
    data?: {}
}

const header = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

class PostRequest extends ApiRequest<IPostRequest> {

    method: IPostRequest["method"] = Methods.post
    url: IPostRequest['url']
    header: IPostRequest['header'] = header;
    private params?: IPostRequest['params']
    private data?: IPostRequest['data']

    constructor(url: IPostRequest['url'] = 'https://postman-echo.com/post', params?: IPostRequest['params']) {
        super();
        this.url = url
        if (params) this.params = params
    }

    body(body: IPostRequest['data']) {
        if (!body) {
            this.data = {}
            return this
        }
        this.data = body
        return this
    }

    async call(): Promise<any> {
        let requestConfig: IPostRequest = {
            url: this.url,
            method: this.method,
            header: this.header,
        }

        if (this.params) requestConfig.params = this.params
        if (this.data) requestConfig.data = this.data

        const { data } = await axios(requestConfig)

        return data
    }
}

export { PostRequest }