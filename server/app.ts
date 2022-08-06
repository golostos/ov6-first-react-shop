// es modules
import express, { ErrorRequestHandler } from "express";
require('express-async-errors');
import bcryptjs from "bcryptjs";
import { z, ZodError } from "zod";
import { db } from "./db";
import { Prisma } from "@prisma/client";
import createHttpError, { HttpError } from "http-errors";
import { signAsync, verifyAsync } from "./auth";

// const signAsync = promisify<string | Buffer | object, Secret, SignOptions | undefined>(sign)

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
    const user = User.parse(req.body)
    const userFromDb = await db.user.findUnique({
        where: {
            email: user.email
        }
    })
    if (userFromDb) {
        if (await bcryptjs.compare(user.password, userFromDb.passwordHash)) {
            // stateless - JWT - XSS 
            const token = await signAsync(
                { 
                    userId: userFromDb.id,
                    role: userFromDb.role
                },
                'secret',
                { expiresIn: '1h' })
            // console.log(token)
            return res.send({ token: 'bearer ' + token })
        }
    }
    throw new createHttpError.Unauthorized('Wrong user\'s credentials')
})

app.post('/api/products', async (req, res) => {
    const Product = z.object({
        name: z.string(),
        price: z.number()
    })
    const token = req.header('Authorization')
    if (token) {
        const decodedToken = await verifyAsync(token.replace(/bearer\s+/, ''), 'secret')
        const product = await Product.parseAsync(req.body)
        // const token = await verifyAsync()
        // const user = await db.user.findUnique({
        //     where: {
        //         id: decodedToken.userId
        //     }
        // })
        if (decodedToken?.role === 'ADMIN') {
            const newProduct = await db.product.create({
                data: product
            })
            return res.send(newProduct)
        } else {
            throw new createHttpError.Forbidden()
        }        
    }
    throw new createHttpError.Unauthorized()
})

app.get('/api/products', async (req, res) => {
    const products = await db.product.findMany()
    res.send(products)
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