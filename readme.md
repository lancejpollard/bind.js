
A binding library to make react forms more performant.

```
npm install @lancejpollard/bind.js
```

```js
const Access = require('@lancejpollard/bind.js')
const a = new Access
a.set([{key:'x'}], 10)
console.log(a.value)
console.log(a.get([{key:'x'}]))
a.bind([{key:'x'}], () => console.log('change 1'))
a.set([{key:'x'}], 20)
const handle2 = () => console.log('change 2')
const handle2b = () => console.log('change 2b')
a.bind([{key:'y'},{key:'z'}], handle2)
a.bind([{key:'y'},{key:'z'}], handle2b)
a.set([{key:'y'},{key:'z'}], 30)
a.set([{key:'y'},{key:'z'}], 35)
a.set([{key:'y'},{key:'z'}], 35)
a.unbind([{key:'y'},{key:'z'}], handle2)
a.set([{key:'y'},{key:'z'}], 40)
a.set([{key:'z',list:true},{item:true,i:0},{key:'foo'}], 100)
console.log(a.value)
a.set([{key:'z',list:true},{item:true,i:0},{key:'foo'}], undefined)
console.log(a.value)
a.set([{key:'z',list:true},{item:true,i:0}], undefined)
console.log(a.value)
```
