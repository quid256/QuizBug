/* */ 
"format cjs";
import chai from 'chai';
import path from 'path';

import CssUrlRewriter from './CssUrlRewriter';

const expect = chai.expect;

describe('CssUrlRewriter', () => {
  it('rewrites url(resource)', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url(image.png) }';
    const expected = '.test { background: url("node_modules/test-package/image.png") }';

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('rewrites url("resource")', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';
    const expected = '.test { background: url("node_modules/test-package/image.png") }';

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('rewrites url(\'resource\')', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url(\'image.png\') }';
    const expected = '.test { background: url("node_modules/test-package/image.png") }';

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not rewrite inside line comment', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '// .test { background: url(image.png) }';
    const expected = content;

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not rewrite inside block comment', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '/* .test { background: url(image.png) } */';
    const expected = content;

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not resolve if resolver() returned false', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';
    const expected = content;

    const resolver = () => false;

    const rewriter = new CssUrlRewriter({ resolver });
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does default resolving if resolver() returned undefined', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';
    const expected = '.test { background: url("node_modules/test-package/image.png") }';

    const resolver = () => undefined;

    const rewriter = new CssUrlRewriter({ resolver });
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does default resolving if resolver() returned null', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';
    const expected = '.test { background: url("node_modules/test-package/image.png") }';

    const resolver = () => null;

    const rewriter = new CssUrlRewriter({ resolver });
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not resolve "data:" urls with default resolver', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("data:bla-bla-bla") }';
    const expected = content;

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not resolve absolute urls (with proto) with default resolver', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("http://bla-bla-bla") }';
    const expected = content;

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not resolve absolute urls (without proto) with default resolver', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("//bla-bla-bla") }';
    const expected = content;

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does not resolve absolute urls (from root) with default resolver', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("/bla-bla-bla") }';
    const expected = content;

    const rewriter = new CssUrlRewriter();
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('does custom resolving if resolver() returned resolved url', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';
    const expected = '.test { background: url("bla-bla-bla") }';

    const resolver = () => 'bla-bla-bla';

    const rewriter = new CssUrlRewriter({ resolver });
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });

  it('has valid arguments in custom resolver()', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';

    const resolver = (url, srcFilename, options) => {
      expect(url).to.equal('image.png');
      expect(srcFilename).to.equal(filename);
      expect(options.resolver).to.equal(resolver);
    };

    const rewriter = new CssUrlRewriter({ resolver });

    rewriter.rewrite(filename, content);
  });

  it('has valid resolutions after rewrite', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url(image.png) }';

    const rewriter = new CssUrlRewriter();

    expect(rewriter.getResolutions()).to.have.length(0);

    rewriter.rewrite(filename, content);

    expect(rewriter.getResolutions()).to.eql([
      {
        filename: 'node_modules/test-package/test.css',
        fromUrl: 'image.png',
        toUrl: 'node_modules/test-package/image.png',
      },
    ]);
  });

  it('has valid local assets list after rewrite', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url(image.png) }';

    const rewriter = new CssUrlRewriter();

    expect(rewriter.getLocalAssetList()).to.have.length(0);

    rewriter.rewrite(filename, content);

    expect(rewriter.getLocalAssetList()).to.eql([
      {
        fromPath: 'node_modules/test-package/image.png',
        toPath: 'node_modules/test-package/image.png',
      },
    ]);
  });

  it('has valid local assets list after rewrite (with absolute root)', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url(image.png) }';

    const rewriter = new CssUrlRewriter({ root: path.resolve('.') });

    expect(rewriter.getLocalAssetList()).to.have.length(0);

    rewriter.rewrite(filename, content);

    expect(rewriter.getLocalAssetList()).to.eql([
      {
        fromPath: 'node_modules/test-package/image.png',
        toPath: 'node_modules/test-package/image.png',
      },
    ]);
  });

  it('should be able to resolve using publicPath option', () => {
    const filename = 'node_modules/test-package/test.css';
    const content = '.test { background: url("image.png") }';
    const expected = '.test { background: url("http://localhost:8888/path/node_modules/test-package/image.png") }';

    const rewriter = new CssUrlRewriter({ publicPath: 'http://localhost:8888/path/' });
    const actual = rewriter.rewrite(filename, content);

    expect(actual).to.equal(expected);
  });
});
