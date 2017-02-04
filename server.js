const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

try {
  mongoose.connect(`mongodb://${process.env.dbuser}:${process.env.dbpass}@ds011923.mlab.com:11923/reservations`)
  mongoose.Promise = global.Promise
  console.log('db connected')
} catch (err) {
  console.error('db connect failed', err)
}

const app = express()
app.use(bodyParser.json())

const Note = require('./models/note')

app.get('/note', (req, res) => {
  Note.find({}, 'title content')
    .then((notes) => {
      res.status(200).send(notes)
    })
    .catch((error) => {
      console.error('failed to GET all notes', error)
      res.send(500).send({ 'message': 'internal error' })
    })
})

app.post('/note', (req, res) => {
  if (!req.body.title || !req.body.content) {
    console.warn('incomplete POST request', req.body)
    res.status(400).send({ 'message': 'invalid body' })
    return
  }
  const note = new Note({
    title: req.body.title,
    content: req.body.content,
  })
  note.save()
    .then((newNote) => {
      res.status(201).send({
        title: newNote.title,
        content: newNote.content,
      })
    })
    .catch((error) => {
      console.error('failed to POST new note', error)
      res.status(500).send({ 'message': 'internal error' })
    })
})

app.put('/note', (req, res) => {
  if (!req.body.title || !req.body.content) {
    console.warn('incomplete POST request', req.body)
    res.status(400).send({ 'message': 'invalid body' })
    return
  }
  Note.findOne({ 'title': req.body.title })
    .then((note) => {
      note.content = req.body.content
      note.save()
        .then((updatedNote) => {
          res.status(200).send({
            title: updatedNote.title,
            content: updatedNote.title,
          })
        })
        .catch((error) => {
          console.error('failed to update note', req.body)
          res.status(500).send({ 'message': 'internal error' })
        })
    })
    .catch((error) => {
      console.error('failed to find note to update', error)
      res.status(404).send({ 'message': 'note not found' })
    })
})

app.delete('/note', (req, res) => {
  if (!req.body.title) {
    console.warn('incomplete DELETE request', req.body)
    res.status(400).send({ 'message': 'invalid body' })
    return
  }
  Note.findOne({ 'title': req.body.title })
    .then((note) => {
      note.remove()
        .then(() => {
          res.status(200).send({ 'message': 'note deleted' })
        })
        .catch((error) => {
          console.error('failed to delete note', error)
          res.status(500).send({ 'message': 'internal error' })
        })
    })
    .catch((error) => {
      console.error('failed to find note to delete', error)
      res.status(404).send({ 'message': 'note not found' })
    })
})

console.log('listening at localhost:3000')
app.listen(3000)
