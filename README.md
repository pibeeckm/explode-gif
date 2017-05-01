# explode-gif

Explode gif into png frames


## Installation
```
$ npm install explode-gif --save
```

## Usage
```
var explode = require("explode-gif");
```
```
explode("src.gif", "./dest", function(err, frames) {
    if (err) {
        console.log("something went wrong", err);
        return;
    }
    console.log("Got frames: ", frames);
});
```