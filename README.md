# reference-count
count references to resources and clean up after sweeps

## Usage

```js
var Context = require('reference-count');

var context = new Context();

context.on('garbage', function(resource) {
  // clean up the resource here
});

context.sweep('actor1')
  .count('resource1')
  .count(['resource2', 'resource3'])
  .done();

context.sweep('actor1')
  .count('resource1')
  .count('resource2'])
  .done();

context.destory('actor1');
```
