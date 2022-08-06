import { GetPublicKeyOrSecret, Jwt, JwtPayload, Secret, sign, SignOptions, verify, VerifyOptions } from "jsonwebtoken";

export function signAsync(payload: string | Buffer | object,
    secretOrPrivateKey: Secret,
    options: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        sign(payload, secretOrPrivateKey, options, (err, token) => {
            if (err) return reject(err)
            if (token) resolve(token)
            else reject(new Error('Wrong token'))
        })
    })
}

type Payload = {
    userId: number
} & JwtPayload

export function verifyAsync(token: string, 
    secret: Secret): Promise<Payload> {
    return new Promise((resolve, reject) => {
        verify(token, secret, (err, decodedToken) => {
            if (err) return reject(err)
            if (decodedToken) resolve(decodedToken as Payload)
            else reject(new Error('Wrong token'))
        })
    })
}