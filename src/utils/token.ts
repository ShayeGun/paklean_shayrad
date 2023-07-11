import axios from 'axios'
import env from 'dotenv'

env.config({ path: `${__dirname}/../.env` });

interface IToken {
    accessToken: string;
    expiresIn: Date;
    tokenType: string;
    scope: "api_scope";
}

class Token {
    private static instance: Token;
    declare private accessToken: IToken["accessToken"]
    declare private tokenType: IToken["tokenType"]
    declare private expiresIn: IToken["expiresIn"]
    private scope: IToken["scope"] = "api_scope"

    private constructor() { }

    public static build(): Token {
        if (!Token.instance) {
            Token.instance = new Token();
        }
        return Token.instance;
    }

    // FIX:
    public async login() {
        const { data } = await axios.post(`${process.env.TOKEN_URL}`, {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "client_credentials"
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        )

        this.accessToken = data.accessToken
        this.tokenType = data.expire

    }

    // FIX:
    public async refresh() {
        try {

            // const date = new Date();
            // if (date.toISOString() > this.expiresIn.toISOString()) this.login();

        } catch (err: any) {
            console.error(err);
        }

    }

    public getToken() {
        return {
            accessToken: this.accessToken,
            tokenType: this.tokenType,
            scope: this.scope,
            expiresIn: this.expiresIn
        }
    }

}

const token = Token.build();

export { token }
