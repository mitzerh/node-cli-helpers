# File I/O Generic Helpers

Generic helper functions used for development.

**Install:**

```bash
npm install cli-helper
```

**Include:**

**Include as a constructor class:**

```js
// include as a constructor class
var Helper = require('cli-helper').constructor;

class MyHelper extends Helper {
	. . .
}
```

**Include as an instance:**

```js
var Helper = require('cli-helper').instance;

Helper.getOpt('foo');
```


## Functions

### **`Helper.getOpt([String:id])`**

Get arguments passed using the `--` convention.

```js
// execution
node ./foo.js --foo=bar --bar=baz

// getOpt()
Helper.getOpt('foo');
// -> 'bar'
```

### **`Helper.getOptArg([String:id])`**

Get non key-value pair arguments

```js
// execution
node ./foo.js foo

// getOptArg()
Helper.getOptArg('foo');
// -> true

Helper.getOptArg('bar');
// -> false
```

### **`Helper.getRawArgs()`**

Returns all the raw arguments.

```js
// execution
node ./foo.js foo --bar=lol

// getRawArgs()
Helper.getOptArg('foo');
// -> ['node', './foo.js', 'foo', '--bar=lol']
```

### **`Helper.promiseIterator([Object:target], [Function:next], [Function:done])`**

Iterate over array or object with a **next()** step, promise-like execution.

```js
// promiseIterator()

var list = ['a', 'b', 'c'];

Helper.promiseIterator(list, next, done);

function next(item, i, step, stop) {
	console.log('list item:', item);
    console.log('list index:', i);

    // you can do some async call here
    $.ajax('//feed.com/' + item, function(data) {
    	console.log('got the data!', data);
		// continue to the next iteration
	    step();    
    });

    // or you can break the iteration
    // stop();
}

function done() {
	console.log('iteration done!');
}
```

### **`Helper.shellCmd([String:cmd], [String:basePath], [Boolean:verbose])`**

Run a unix shell command using package: **[shelljs](https://www.npmjs.com/package/shelljs)**


| Arguments | Description |
|:----------|:------------|
| **cmd** | command to run |
| **basePath** | (optional) path where to execute. if not defined, command executes on current dir |
| **verbose** | (optional) non-silent mode |


```js
// shellCmd() - command ls -al output in /usr/local directory
Helper.shellCmd('ls -al', '/usr/local');
```

### **`Helper.isPathExists([String:path])`**

Check if path exists, either if its a **file or directory**.

```js
// isPathExists()
Helper.isPathExists('/urs/local');
// -> true
```

### **`Helper.isFileExists([String:path])`**

Check if the path is a **FILE**.


```js
// isPathExists()
Helper.isFileExists('/urs/local');
// -> false

Helper.isFileExists('/urs/local/foo.txt');
// -> true
```

### **`Helper.createDir([String:path])`**

Creates a directory.

```js
// createDir()
Helper.createDir('/usr/local/new-dir');
```

### **`Helper.readFile([String:path])`**

Read file (utf-8).

```js
// readFile()
Helper.readFile('/usr/local/foo.txt');
// -> {String} contents
```

### **`Helper.writeFile([String:path], [String:content])`**

Write file (utf-8).

```js
// writeFile()
Helper.writeFile('/usr/local/foo.txt', 'hello world!');
// -> {String} contents
```

### **`Helper.base64([String:str], [Boolean:dec = false])`**

Base64 encode/decode.

```js
// base64()

// encode
Helper.base64('encode me');
// -> {String} encoded string

// decode
Helper.base64('ZW5jb2RlIG1l', true);
// -> {String} decoded string
```
