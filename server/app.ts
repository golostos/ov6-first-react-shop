// es modules
import express from "express";

const app = express()

app.get('/api/hello', (req, res) => {
    res.send('Hello')
})

app.listen(4000)