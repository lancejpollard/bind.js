
class Access {
  constructor(json = {}) {
    this.value = json
    this.bindings = {}
  }

  get(path) {
    let i = 0
    let node = path[i]
    let v = this.value
    while (v && typeof v === 'object' && node) {
      const key = node.item ? node.i : node.key
      v = v[key]
      i++
      node = path[i]
    }
    return v
  }

  set(path, x) {
    let i = 0
    let node = path[i]
    let v = this.value
    let z = this.bindings
    while (node) {
      const isEnd = i === path.length - 1
      const key = node.item ? node.i : node.key
      const child = isEnd
        ? x
        : node.list
          ? []
          : {}
      if (isEnd) {
        if (v[key] === child) {
          z = undefined
        } else {
          if (typeof child === 'undefined') {
            if (node.item) {
              v.splice(key, 1)
            } else {
              delete v[key]
            }
          } else {
            v = v[key] = child
          }
          if (z && z[key]) {
            const { callbacks } = z[key]
            callbacks.forEach(call => call())
          }
          return
        }
      } else {
        v = v[key] = v[key] || child
        if (z && z[key]) {
          z = z[key].children
        }
      }
      i++
      node = path[i]
    }
    return v
  }

  bind(path, call) {
    let i = 0
    let node = path[i]
    let z = this.bindings
    while (node) {
      const isEnd = i === path.length - 1
      const key = node.item ? node.i : node.key
      const child = node.list ? [] : {}
      const binding = z[key] = z[key] || { children: child, callbacks: [] }
      if (isEnd) {
        binding.callbacks.push(call)
      } else {
        z = binding.children
      }
      i++
      node = path[i]
    }
  }

  unbind(path, call) {
    let i = 0
    let node = path[i]
    let z = this.bindings
    while (node) {
      const isEnd = i === path.length - 1
      const key = node.item ? node.i : node.key
      const binding = z[key]
      if (!z[key]) {
        return
      } else {
        if (isEnd) {
          const index = binding.callbacks.indexOf(call)
          binding.callbacks.splice(index, 1)
          return
        } else {
          z = binding.children
        }
      }
      i++
      node = path[i]
    }
  }
}

module.exports = Access
