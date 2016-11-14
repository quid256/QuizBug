# CSS URL Rewriter #

## Features ##

- Designed to be used as dependency for other libraries (sass, less, stylus etc)
- Rewrite CSS URLs to project root path with default resolver
- Rewrite CSS URLs with custom URL resolver
- Track all processed URLs
- Could be used in combination with `css-asset-copier` library

## TODO ##

- By default this rewriter modify code only inside lines, so it source code
  line number is preserved but column could be different, but precise column
  level mapping for css has no benefits while debugging. But it could be
  implemented using `source-map` npm package.
- Implement more precise parser using `css` npm package.

## Installation ##

```shell
npm install css-url-rewriter-ex
```

## Usage ##

### Default Resolver ###

- `root`: specify path to project root folder which will be used to resolve all
  relative urls.
- `publicPath`: set to target public path to prefix relative paths with it.
  Required for `<link href="blob:..."/>` or `<link href="data:..."/>` style
  injections for some browsers, for example, for Chrome 54.x (otherwise Chrome
  will not be able to resolve relative urls).

```javascript
var CssUrlRewriter = require('css-url-rewriter-ex');
var rewriter = new CssUrlRewriter({ root: path.resolve('.') });
var fixedContent = rewriter.rewrite(filename, originalContent);
```

### Custom Resolver ###

- Pass `resolver` option as `function resolver(url, filename, option) { ... }`
- absolute and data urls are not resolved by default
- return `false` to skip rewrite
- return `undefined` or null to use default resolver
- return `string` with resolved url to use it

```javascript
var CssUrlRewriter = require('css-url-rewriter-ex');

var rewriter = new CssUrlRewriter({
  root: SystemJS.baseURL,
  resolver: function (url, filename, options) {
    // resolve jspm: paths here and use default for all others
    if (url.match(/^jspm:/)) {
      return SystemJS.normalizeSync(url.substr(5));
    }
  }
});

var fixedContent = rewriter.rewrite(filename, originalContent);
```
