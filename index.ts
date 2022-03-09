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

  // We can make any query to any API of our choosing, for example:

  // Get our user from Prisma
  const user = await prisma.user.findFirst({ where: { id: id } })

  // Get todos for this user from JSONPlaceholder
  const todos = await fetch(
    `https://jsonplaceholder.typicode.com/todos?userId=${id}`
  ).then(resp => resp.json())

  // Get posts from this user from JSON Placeholder, too
  const posts = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${id}`
  ).then(resp => resp.json())

  // Get a random quote from a different API
  const randomQuote = await fetch(
    'https://web-series-quotes-api.deta.dev/quote'
  ).then(resp => resp.json())

  // Get weather info from yet another API
  const weatherInfo = await fetch(
    'https://www.7timer.info/bin/astro.php?lon=113.2&lat=23.1&ac=0&unit=metric&output=json&tzshift=0'
  ).then(resp => resp.json())

  // We package it all together and send it to our user :)
  res.send({ ...user, todos, posts, randomQuote, weatherInfo })
})

/*
Async vs Sequential
The code above looks cleaner, but it has a flaw, it is running sequentially
This is fine if you need to wait for response A before you get B
But in our case this is not needed, and we are just wasting time

The code below uses Promise.all to get all of the data at the same time

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

So, for example, if we had 5 requests, and they all took between 1 and 3 seconds
With the first example, the time would be something like:
3s
2s
3s
1s
Total: 9s

But with Promise.all it will be something like:
3s 2s 3s 1s (they all happen in parallel)
Total: 3s (because that's how long the slowest one took)

So in this example we're giving a response to our user *6 seconds* faster, wow!
All this, just by rearranging our code a little

*/

app.listen(4000, () => {
  console.log(`API running: http://localhost:4000`)
})
