import axios from 'axios';
import { ApiRequest, Methods } from "./api-request";

interface IPostRequest {
    method: Methods.post,
    url: string
    header: Record<string, string>
    params?: Record<string, string>
    data?: Record<string, any>
}

class PostRequest extends ApiRequest<IPostRequest> {

    method: IPostRequest["method"] = Methods.post
    url: IPostRequest['url']
    declare header: IPostRequest['header']
    private params?: IPostRequest['params']
    private data?: IPostRequest['data']

    constructor(url: IPostRequest['url'] = 'https://postman-echo.com/post', params?: IPostRequest['params']) {
        super();
        this.url = url
        if (params) this.params = params
    }

    setBody(body: IPostRequest['data']) {
        if (!body) {
            this.data = {}
            return this
        }
        this.data = body
        return this
    }

    setHeader(header: IPostRequest['header']) {
        if (!header) {
            this.header = {}
            return this
        }
        this.header = header

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

        console.log(data);


        return data
    }
}

export { PostRequest }