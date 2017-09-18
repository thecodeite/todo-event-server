const fetch = require('node-fetch')
const actions = require('./actions')

const database = 'http://localhost:5984'

class TodoServer {
  constructor (latency) {
    this.latency = latency
    this.state = {
      'sam': {
        nextId: 4,
        todos: [
          { id: 1, text: 'S first to do', done: false },
          { id: 2, text: 'S second to do', done: true },
          { id: 3, text: 'S third to do', done: false }
        ]
      }
    }
  }

  onAction (action, username) {
    return Promise.resolve()
      .then(() => {
        console.log('action:', action)
        if (!action || !action.type) return []

        switch (action.type.toUpperCase()) {
          case actions.addTodo.type: return this.onAddTodo(action, username)
          case actions.init.type: return this.onInit(action, username)
          case actions.deleteTodo.type: return this.onDeleteTodo(action, username)
          default: return [] // Do nothing
        }
      })
      .then(result => {
        if(this.latency > 0) {
          return new Promise((resolve, reject) => setTimeout(() => resolve(result), this.latency))
        } else {
          return result
        }
      })
  }

  getUser(username) {
    const path = database + '/todo/' + username
    return fetch(path)
      .then(res => {
        if (res.status === 404) {
          return {nextId: 1, todos: []}
        } else {
          return res.json().then(user => {
            if (!user.nextId > 0) user.nextId = 1
            if (!Array.isArray(user.todos)) user.todos = []
            return user
          })
        }
      })
  }

  saveUser (username, user) {
    const path = database + '/todo/' + username
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    }
    return fetch(path, options)
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {throw new Error('Error: ' + res.status + ' ' + text)})
        }
      })
  }

  onInit(action, username) {
    return this.getUser(username)
      .then(user => {
        return [actions.loadData(user.todos)]
      })
  }

  onAddTodo (action, username) {
    return this.getUser(username)
      .then(user => {
        const newTodo = {
          id: user.nextId++,
          text: action.text,
          done: false
        }
        user.todos.push(newTodo)
        return this.saveUser(username, user).then(() => newTodo)
      })
      .then(newTodo => {
        return [actions.todoFromServer(newTodo.text, newTodo.id, newTodo.done)]
      })
      .catch(err => {
        console.log('Error while adding todo:', err)
        throw err
      })
  }

  onDeleteTodo (action, username) {
    return this.getUser(username)
      .then(user => {
        user.todos = user.todos.filter(x => x.id !== action.id)
        return this.saveUser(username, user).then(() => action.id)
      })
      .then(id => {
        return [actions.deleteTodoFromServer(id)]
      })
      .catch(err => {
        console.log('Error while adding todo:', err)
        throw err
      })
  }

  // onAddTodo (action, username) {
  //   if (!this.state[username]) {
  //     this.state[username] = {nextId: 1, todos: []}
  //   }

  // }
}

module.exports = TodoServer
