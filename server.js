const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.send('This is only a test.')
})

console.log('listening at localhost:3000')
app.listen(3000)
