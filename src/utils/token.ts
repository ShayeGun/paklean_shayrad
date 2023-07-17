import axios from 'axios'
import env from 'dotenv'

env.config({ path: `${__dirname}/../.env` });

interface IToken {
    accessToken: string;
    createdAt: number;
    expiresIn: number;
    tokenType: string;
    scope: string;
}

class Token {
    private static instance: Token;
    declare private createdAt: IToken["createdAt"];
    declare private accessToken: IToken["accessToken"];
    declare private tokenType: IToken["tokenType"];
    declare private expiresIn: IToken["expiresIn"];
    declare private scope: IToken["scope"];

    private constructor() { }

    public static build(): Token {
        if (!Token.instance) {
            Token.instance = new Token();
        }
        return Token.instance;
    }

    // FIX:
    private async login() {
        const { data } = await axios.post(`${process.env.TOKEN_URL}`, {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: process.env.GRANT_TYPE
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        )

        this.createdAt = Date.now();

        this.accessToken = data.accessToken
        // convert seconds milliseconds
        this.expiresIn = data.expires_in * 1000
        this.tokenType = data.token_type
        this.scope = data.scope
    }

    // FIX:
    public async checkValidity() {

        if ((Date.now() - this.createdAt) > this.expiresIn || !this.accessToken)
            await this.login();

    }

    public getToken() {
        return {
            accessToken: this.accessToken,
            tokenType: this.tokenType,
            scope: this.scope,
            createdAt: this.createdAt,
            expiresIn: this.expiresIn
        }
    }

}

const token = Token.build();

export { token, Token }
