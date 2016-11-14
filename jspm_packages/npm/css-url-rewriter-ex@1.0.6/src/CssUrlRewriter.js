/* */ 
"format cjs";
import path from 'path';

export default class CssUrlRewriter {
  /* eslint-disable */
  urlRe = /\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r\n|\r|\n|$)|([\s,:])url\(\s*("[^"]+"|'[^']+'|[^)]+)\s*\)/ig;
  /* eslint-enable */

  /**
   * Constructor.
   *
   * @param {Object}    options
   * @prop  {String}    root
   * @prop  {String}    publicPath
   * @prop  {Function}  function resolver(url, filename, options)
   *                    - return false to skip resolving
   *                    - return undefined or null to use default resolver
   *                    - return resolved url to use it
   */
  constructor(options) {
    this.options = Object.assign({ root: '.' }, options);
    this.reset();
  }

  /**
   * Rewrite all URLs in source file.
   *
   * @param   {String}  filename
   * @param   {String}  originalContent
   *
   * @returns {String}  fixedContent
   */
  rewrite(filename, content) {
    if (!this.options.root && !this.options.resolver) {
      return content;
    }

    return content.replace(this.urlRe, (match, prefix, rawUrl) => {
      if (prefix === undefined) {
        // looks like block/line comment is found, so bypass it
        return match;
      }

      const url = this.cleanUrl(rawUrl);

      let newUrl = this.options.resolver
        ? this.options.resolver(url, filename, this.options)
        : undefined;

      if (newUrl === undefined || newUrl === null) {
        newUrl = this.defaultResolver(url, filename, this.options);
      } else if (newUrl === false) {
        newUrl = url;
      }

      if (newUrl) {
        this.resolutions[filename] = this.resolutions[filename] || {};
        this.resolutions[filename][url] = newUrl;
      }

      return `${prefix}url("${newUrl}")`;
    });
  }

  /**
   * Clear internal state.
   */
  reset() {
    this.resolutions = {};
  }

  /**
   * Get list of all resolved URLs for all files.
   *
   * @returns {Array[{ filename, fromUrl, toUrl }]}
   */
  getResolutions() {
    const result = [];

    Object.entries(this.resolutions)
      .forEach(([filename, urls]) => {
        Object.entries(urls)
          .forEach(([fromUrl, toUrl]) => {
            result.push({ filename, fromUrl, toUrl });
          });
      });

    return result;
  }

  /**
   * Get list of unique assets used in during resolving.
   *
   * @returns {Array[{ fromPath, toPath }]}
   */
  getLocalAssetList() {
    const uniqueMap = this.getResolutions()
      .map((record) => {
        const isDataUrl = record.fromUrl.startsWith('data:');
        const isAbsUrl = !isDataUrl && this.isAbsoluteUrl(record.fromUrl);

        if (isAbsUrl || isDataUrl) {
          return false;
        }

        const baseDir = path.dirname(record.filename);
        const assetPath = path.join(baseDir, this.getAssetPath(record.fromUrl));

        const fromPath = path.relative(this.options.root, assetPath);
        const toPath = this.getAssetPath(record.toUrl);

        return { fromPath, toPath };
      })
      .filter(record => !!record)
      .reduce((result, record) => {
        result[record.fromPath] = record; // eslint-disable-line no-param-reassign
        return result;
      }, {});

    return Object.values(uniqueMap);
  }

  defaultResolver(url, filename, options) {
    const isDataUrl = url.startsWith('data:');
    const isAbsUrl = !isDataUrl && this.isAbsoluteUrl(url);

    if (isAbsUrl || isDataUrl) {
      return url;
    }

    const baseUrl = path.relative(options.root, path.dirname(filename));
    const relUrl = path.join(baseUrl, url);

    return options.publicPath ? options.publicPath + relUrl : relUrl;
  }

  isAbsoluteUrl(url) {
    return /^([a-z0-9_]+:)?\/\//i.test(url) || path.isAbsolute(url);
  }

  cleanUrl(url) {
    let result = url;

    if ((url.startsWith('"') && url.endsWith('"'))
      || (url.startsWith("'") && url.endsWith("'"))
    ) {
      result = result.substr(1, url.length - 2);
    }

    return result.trim();
  }

  getAssetPath(url) {
    return url.replace(/[#?].*$/, '');
  }
}
