import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import { nanoid } from 'nanoid';
import crypto from "crypto"
import { db } from "./db";
import createHttpError from "http-errors";
import { User } from "@prisma/client";

export async function createPasswordHash(password: string) {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function comparePassword(password: string, hash: string) {
  if (typeof password === 'string') {
    const result = await bcryptjs.compare(password, hash)
    return result
  }
  else return false
}

export async function createSession(res: Response, userId: number) {
  const sid = nanoid() // Example: WKlEdLMwTjJE9cSfOuniI
  const token = sign(sid, process.env.SECRET || 'WKlEdLMwTjJE9cSfOuniI') // WKlEdLMwTjJE9cSfOuniI.KKF2QT4fwpMeJf36POk6yJV_adQssw5c // DB + JWT
  res.cookie('sid', token, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 })
  const session = await db.session.create({
    data: {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      sessionToken: sid,
      userId
    }
  })
  return session
}

export async function checkSession(req: Request, res: Response, next: NextFunction) {
  const sidCookie: string = req.cookies['sid']
  if (sidCookie) {
    const sid = unsign(sidCookie, process.env.SECRET || 'WKlEdLMwTjJE9cSfOuniI')
    if (typeof sid === 'string') {
      const session = await db.session.findUnique({
        where: { sessionToken: sid },
        include: { User: true }
      })
      if (session) {
        if (+session.expires > Date.now()) {
          req.user = session.User as User
          return next()
        }
        await db.session.delete({ where: { sessionToken: sid } })
        res.clearCookie('sid')
      }
    }
  }
  next(new createHttpError.Unauthorized())
  // res.status(401).send({ status: 'Wrong session' })
}

function sign(token: string, secret: string) {
  return token + '.' + crypto
    .createHmac('sha256', secret)
    .update(token)
    .digest('base64')
    .replace(/\=+$/, '');
};

export function unsign(val: string, secret: string) {
  const token = val.slice(0, val.lastIndexOf('.'));
  const mac = sign(token, secret);
  return sha1(mac) === sha1(val) ? token : false;
};

function sha1(str: string) {
  return crypto.createHash('sha1').update(str).digest('hex');
}



// import { GetPublicKeyOrSecret, Jwt, JwtPayload, Secret, sign, SignOptions, verify, VerifyOptions } from "jsonwebtoken";

// export function signAsync(payload: string | Buffer | object,
//     secretOrPrivateKey: Secret,
//     options: SignOptions): Promise<string> {
//     return new Promise((resolve, reject) => {
//         sign(payload, secretOrPrivateKey, options, (err, token) => {
//             if (err) return reject(err)
//             if (token) resolve(token)
//             else reject(new Error('Wrong token'))
//         })
//     })
// }

// type Payload = {
//     userId: number
// } & JwtPayload

// export function verifyAsync(token: string,
//     secret: Secret): Promise<Payload> {
//     return new Promise((resolve, reject) => {
//         verify(token, secret, (err, decodedToken) => {
//             if (err) return reject(err)
//             if (decodedToken) resolve(decodedToken as Payload)
//             else reject(new Error('Wrong token'))
//         })
//     })
// }
