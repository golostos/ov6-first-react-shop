// es modules
import express, { ErrorRequestHandler } from "express";
require('express-async-errors');
import bcryptjs from "bcryptjs";
import { z, ZodError } from "zod";
import { db } from "./db";
import { Prisma } from "@prisma/client";
import createHttpError, { HttpError } from "http-errors";

const app = express()
app.use(express.json())

// const validator: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
//     const user = req.body
//     if (typeof user.name === 'string'
//         && typeof user.email === 'string'
//         && typeof user.password === 'string'
//         && Object.keys(user).length === 3) return next()
//     res.send({ error: "Wrong user" })
// }

app.post('/api/users/signup', async (req, res, next) => {
    const User = z.object({
        name: z.string().optional(),
        email: z.string().email(),
        password: z.string(),
    });
    const user = await User.parseAsync(req.body)
    const userFromDb = await db.user.create({
        data: {
            name: user.name || null,
            email: user.email,
            passwordHash: await bcryptjs.hash(user.password, 10),
        },
        select: {
            email: true,
            name: true,
            id: true,
        }
    })
    res.send(userFromDb)
})

app.post('/api/users/login', async (req, res) => {
    const User = z.object({
        email: z.string().email(),
        password: z.string(),
    });
    const user = await User.parseAsync(req.body)
    const userFromDb = await db.user.findUnique({
        where: {
            email: user.email
        }
    })
    if (userFromDb) {
        if (await bcryptjs.compare(user.password, userFromDb.passwordHash)) {
            // Cookies TODO
            return res.send('Ok')
        }
    }
    throw new createHttpError.Unauthorized('Wrong user\'s credentials')
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) res.status(400)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') res.status(409)
    }
    if (err instanceof HttpError) res.status(err.status)
    console.error(err)
    res.send(err)
}

app.use(errorHandler)

app.listen(4000)