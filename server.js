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
      res.status(200).send({
        'data': notes.map((note => ({
          'type': 'note',
          'id': note._id,
          'attributes': {
            'title': note.title,
            'content': note.content,
          }
        })))
      })
    })
    .catch((error) => {
      console.error('failed to GET all notes', error)
      res.status(500).send({
        'errors': [{
          'status': '551',
          'title': 'internal error'
        }]
      })
    })
})

app.post('/note', (req, res) => {
  if (!req.body.data) {
    console.warn('incomplete POST request', req.body)
    res.status(400).send({
      'errors': [{
        'status': '452',
        'title': 'invalid body'
      }]
    })
    return
  }
  const note = new Note({
    'title': req.body.data.attributes.title,
    'content': req.body.data.attributes.content,
  })
  note.save()
    .then((newNote) => {
      res.status(201).send({
        'data': {
          'type': 'note',
          'id': newNote._id,
          'attributes': {
            'title': newNote.title,
            'content': newNote.content,
          }
        }
      })
    })
    .catch((error) => {
      console.error('failed to POST new note', error)
      res.status(500).send({
        'errors': [{
          'status': '552',
          'title': 'internal error'
        }]
      })
    })
})

app.put('/note', (req, res) => {
  if (!req.body.data) {
    console.warn('incomplete POST request', req.body)
      res.status(400).send({
        'errors': [{
          'status': '453',
          'title': 'invalid body'
        }]
      })
    return
  }
  Note.findOne({ '_id': req.body.data._id })
    .then((note) => {
      note.title = req.body.data.attributes.title
      note.content = req.body.data.attributes.content
      note.save()
        .then((updatedNote) => {
          res.status(200).send({
            'data': {
              'type': 'note',
              'id': updatedNote._id,
              'attributes': {
                'title': updatedNote.title,
                'content': updatedNote.content,
              }
            }
          })
        })
        .catch((error) => {
          console.error('failed to update note', req.body)
          res.status(500).send({
            'errors': [{
              'status': '553',
              'title': 'internal error'
            }]
          })
        })
    })
    .catch((error) => {
      console.error('failed to find note to update', error)
      res.status(404).send({
        'errors': [{
          'status': '404',
          'title': 'note not found'
        }]
      })
    })
})

app.delete('/note', (req, res) => {
  if (!req.body.title) {
    console.warn('incomplete DELETE request', req.body)
      res.status(400).send({
        'errors': [{
          'status': '454',
          'title': 'invalid body'
        }]
      })
    return
  }
  Note.findOne({ '_id': req.body.data._id })
    .then((note) => {
      note.remove()
        .then(() => {
          res.status(200).send()
        })
        .catch((error) => {
          console.error('failed to delete note', error)
          res.status(500).send({
            'errors': [{
              'status': '554',
              'title': 'internal error'
            }]
          })
        })
    })
    .catch((error) => {
      console.error('failed to find note to delete', error)
      res.status(404).send({
        'errors': [{
          'status': '404',
          'title': 'note not found'
        }]
      })
    })
})

console.log('listening at localhost:3000')
app.listen(3000)
