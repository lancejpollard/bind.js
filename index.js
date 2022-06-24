
const merge = require('lodash.merge')

class ChangeManager {
  constructor(start = {}) {
    this.start = start
    this.changes = {}
    this.actions = {}
    this.bindings = {
      callbacks: [],
      children: {},
    }
  }

  commit() {
    merge(this.start, this.changes)
    this.changes = {}
    this.actions = {}
  }

  isDirty() {
    return Object.keys(this.changes).length
  }

  set(path, value) {
    const start = this.getStart(path)
    const change = this.getChange(path)

    if (typeof change !== 'undefined') {
      if (typeof start !== 'undefined') {
        if (start === value) {
          this.removeChange(path)
          this.trigger(path)
          return
        }
      }
    }

    this.setAction(path, 'set')
    this.setChange(path, value)
    this.trigger(path)
  }

  get(path) {
    const change = this.getChange(path)

    if (typeof change !== 'undefined') {
      return change
    }

    const start = this.getStart(path)
    return start
  }

  remove(path) {
    const start = this.getStart(path)
    const change = this.getChange(path)

    if (typeof change !== 'undefined') {
      if (typeof start !== 'undefined') {
        this.setChange(path, null)
        this.setAction(path, 'remove')
      } else {
        this.removeChange(path)
        this.removeAction(path)
      }
    } else if (typeof start !== 'undefined') {
      this.setChange(path, null)
      this.setAction(path, 'remove')
    }

    this.trigger(path)
  }

  removeAction(path) {
    let i = 0
    let action = this
    while (i < path.length) {
      const isEnd = i === path.length - 1
      const node = path[i++]
      const key = node.item ? node.i : node.key
      if (isEnd) {
        delete action?.actions[key]
      } else {
        action = action?.actions[key]
      }
    }
  }

  removeChange(path) {
    let i = 0
    let changes = this.changes
    while (i < path.length) {
      const isEnd = i === path.length - 1
      const node = path[i++]
      const key = node.item ? node.i : node.key
      if (isEnd) {
        if (node.item) {
          changes?.splice(key, 1)
        } else {
          delete changes?.[key]
        }
      } else {
        changes = changes?.[key]
      }
    }
  }

  bind(path, callback) {
    let i = 0
    let { bindings } = this
    while (i < path.length) {
      const node = path[i++]
      const key = node.item ? node.i : node.key
      bindings = bindings.children[key] = bindings.children[key] ?? {
        children: {},
        callbacks: []
      }
    }
    bindings.callbacks.push(callback)
    callback(this.get(path))
  }

  trigger(path) {
    let i = 0
    let { bindings } = this
    while (i < path.length && bindings) {
      const node = path[i++]
      const key = node.item ? node.i : node.key
      bindings = bindings.children[key]
    }

    const value = this.get(path)
    bindings?.callbacks.forEach(callback => callback(value))
  }

  unbind(path, callback) {
    let i = 0
    let { bindings } = this
    while (i < path.length && bindings) {
      const node = path[i++]
      const key = node.item ? node.i : node.key
      bindings = bindings.children[key]
    }
    const index = bindings.callbacks.indexOf(callback)
    bindings.callbacks.splice(index, 1)
  }

  getStart(path) {
    let i = 0
    let value = this.start
    while (i < path.length) {
      const node = path[i++]
      const key = node.item ? node.i : node.key
      value = value?.[key]
    }
    return value
  }

  getChange(path) {
    let i = 0
    let changes = this.changes
    while (i < path.length) {
      const node = path[i++]
      const key = node.item ? node.i : node.key
      changes = changes?.[key]
    }
    return changes
  }

  getAction(path) {
    let i = 0
    let node = path[i]
    let action = this
    while (node && action) {
      const key = node.item ? node.i : node.key
      action = action.actions[key]
      i++
      node = path[i]
    }
    return action?.type
  }

  setAction(path, type) {
    let i = 0
    let action = this
    while (i < path.length) {
      const isEnd = i === path.length - 1
      const node = path[i++]
      const key = node.item ? node.i : node.key
      if (isEnd) {
        action = action.actions[key] = action.actions[key] ?? {
          actions: {},
        }
        action.type = type
      } else {
        action = action.actions[key] = action.actions[key] ?? {
          actions: {},
          type: 'set',
        }
      }
    }
  }

  setChange(path, value) {
    let i = 0
    let changes = this.changes
    while (i < path.length) {
      const isEnd = i === path.length - 1
      const node = path[i++]
      const key = node.item ? node.i : node.key
      if (isEnd) {
        changes[key] = value
      } else {
        if (!changes[key]) {
          const child = node.list
            ? []
            : {}
          changes[key] = child
        }
        changes = changes[key]
      }
    }
    return changes
  }
}

module.exports = ChangeManager
