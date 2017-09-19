function init () {
  return {type: init.type}
}
init.type = 'INIT'

function loadData (data) {
  return {type: loadData.type, data}
}
loadData.type = 'LOAD_DATA'

function addTodo (text) {
  return {type: addTodo.type, text,}
}
addTodo.type = 'ADD_TODO'

function todoFromServer (text, id, done) {
  return {type: todoFromServer.type, text, id, done}
}
todoFromServer.type = 'TODO_FROM_SERVER'

function deleteTodo (id) {
  return {type: deleteTodo.type, id}
}
deleteTodo.type = 'DELETE_TODO'

function deleteTodoFromServer (id) {
  return {type: deleteTodoFromServer.type, id}
}
deleteTodoFromServer.type = 'DELETE_TODO_FROM_SERVER'

function addTag (id, tagName) {
  return {type: addTag.type, id, tagName}
}
addTag.type = 'ADD_TAG'

function setTagsFromServer (id, tags) {
  return {type: setTagsFromServer.type, id, tags}
}
setTagsFromServer.type = 'SET_TAGS_FROM_SERVER'

module.exports = {
  init,
  loadData,
  addTodo,
  todoFromServer,
  deleteTodo,
  deleteTodoFromServer,
  addTag,
  setTagsFromServer
}