import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id)

  const [user, todos, posts, randomQuote, weatherInfo] = await Promise.all([
    prisma.user.findFirst({ where: { id: id } }),
    fetch(`https://jsonplaceholder.typicode.com/todos?userId=${id}`).then(
      resp => resp.json()
    ),
    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`).then(
      resp => resp.json()
    ),
    fetch('https://web-series-quotes-api.deta.dev/quote').then(resp =>
      resp.json()
    ),
    fetch(
      'https://www.7timer.info/bin/astro.php?lon=113.2&lat=23.1&ac=0&unit=metric&output=json&tzshift=0'
    ).then(resp => resp.json())
  ])

  res.send({ ...user, todos, posts, randomQuote, weatherInfo })
})

app.listen(4000, () => {
  console.log(`API running: http://localhost:4000`)
})
