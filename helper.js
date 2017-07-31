/*eslint-env es6, node */
'use strict';

const shell = require('shelljs');
const stripAnsi = require('strip-ansi');
const mkdirp = require('mkdirp');
const fs = require('fs');
const _ = require('lodash');
const log = console.log;

const PARAM_ARGV = process.argv;
const PARAM_ARGS = (() => {
    const args = {};
    PARAM_ARGV.forEach((val, index, array) => {
        let sp = val.split('='),
            param = sp[0] || '',
            data = sp[1];
        if (param.length > 0 && /^--/i.test(param) && typeof data !== 'undefined') {
            data = (data === 'true') ? true : (data === 'false') ? false : data;
            args[param.replace(/^--/i, '')] = data;
        }
    });
    return args;
})();

/**
 * @class Helper
 */
class Helper {

    /**
     * Get arguments passed using the `--` convention
     *
     * ```
     * ./foo.js --foo=bar --bar=baz
     * ```
     * @param  {String} id argument key
     */
    getOpt(id) {
        return (id) ? PARAM_ARGS[id] : undefined;
    }

    /**
     * Get non key-value pair arguments
     *
     * ```
     * ./foo.js bar baz
     * ```
     *
     * @param  {String} id argument key
     */
    getOptArg(id) {
        const ret = _.some(PARAM_ARGV, (arg) => {
            return (arg === id) ? true : false;
        });
        return ret;
    }

    /**
     * Returns all the raw arguments
     */
    getRawArgs() {
        return PARAM_ARGV || [];
    }

    /**
     * Run a unix shell command using **[shelljs](https://www.npmjs.com/package/shelljs)**
     *
     * @param  {String} cmd command to run
     * @param  {String} basePath (optional) path where to execute. if not defined, command executes on current dir
     * @param  {Boolean} verbose (optional) non-silent mode
     * @return String command output
     */
    shellCmd(cmd, basePath, verbose) {
        const cmdArr = [];
        if (basePath) {
            cmdArr.push("cd " + basePath);
        }
        cmdArr.push(cmd);
        const res = shell.exec(cmdArr.join(" && "), { silent: (verbose) ? false : true });
        return stripAnsi((res.output || res.stdout || "").trim());
    }

    /**
     * Check if path exists, either if its a file or directory
     *
     * @param  {String} path path to file/directory
     * @return Boolean
     */
    isPathExists(path) {
        let stat = true;
        try {
            stat = fs.existsSync(path);
        } catch(err1) {
            try {
                stat = fs.statSync(path);
            } catch(err2) {
                stat = false;
            }
        }
        return stat;
    }

    /**
     * Check if the path is a file
     *
     * @param  {String} path path to file
     * @return Boolean
     */
    isFileExists(path) {
        let ret = false;
        if (path && this.isPathExists(path)) {
            const stat = fs.statSync(path);
            if (stat.isFile()) {
                ret = true;
            }
        }
        return ret;
    }

    /**
     * Creates a directory
     *
     * @param  {String} path target path
     */
    createDir(path) {
        if (!this.isPathExists(path)) {
            mkdirp.sync(path, { encoding: 'utf8' });
        }
    }

    /**
     * Read file (utf-8)
     *
     * @param  {String} path path to utf-8 file
     * @return String
     */
    readFile(path) {
        let ret = false;
        if (this.isPathExists(path)) {
            ret = fs.readFileSync(path, { encoding: 'utf8' });
        }
        return ret;
    }

    /**
     * Write file (utf-8)
     *
     * @param  {String} path target file path
     * @param  {String} content file contents
     */
    writeFile(path, content) {
        fs.writeFileSync(path, content, { encoding: 'utf8' });
    }

    /**
     * Base64 encode/decode
     *
     * @param  {String}  str string contents
     * @param  {Boolean} [dec] decode/encode mode (defaults to encode)
     * @return String
     */
    base64(str, dec) {
        dec = (typeof dec === 'boolean' && dec) ? true : false;
        return (dec) ? (new Buffer(str, 'base64').toString('ascii')) : (new Buffer(str).toString('base64'));
    }

    /**
     * Iterate over array or object with a next() step via promise
     *
     * ```
     * var list = ['a', 'b', 'c'];
     * promiseIterator(list, function(item, i, step, done){
     *   // do something asynchronous here
     *   var feed = '//foo.com/json/' + item;
     *   // trigger step to proceed to next iteration
     *   step();
     *
     *   // or if you need to break out of the loop mid-iteration
     *   // done();
     * }, function(){
     *   console.log('done!');
     * });
     * ```
     *
     * @param  {Object}   target array or object
     * @param  {Function} next function to execute every step
     * @param  {Function} done function to execute after finish
     */
    promiseIterator(target, next, done) {
        let list = [];
        let type = null;

        if (Array.isArray(target)) {
            type = 'array';
            list = target;
        } else if (typeof target === 'object') {
            type = 'object';
            for (let id in target) {
                list.push({
                    id: id,
                    data: target[id]
                });
            }
        } else {
            log('[CLI-HELPER] promiseIterator(error): target is not iterable');
            return done();
        }

        // requires next function
        if (typeof next !== 'function') {
            log('[CLI-HELPER] promiseIterator(error): missing next()');
            return done();
        }

        let iter = 0;
        let len = list.length;

        trigger();

        function trigger() {
            if (iter < len) {
                let item = (type === 'object') ? list[iter].data : list[iter];
                // pass to next function
                next(item, (type === 'object') ? list[iter].id : iter, () => {
                    iter++;
                    trigger();
                }, () => { // done (break loop if you need to)
                    fin();
                });
            } else {
                fin();
            }
        }

        function fin() {
            if (typeof done === 'function') {
                done();
            }
        }
    }

}

var instance = new Helper();

module.exports = {
    constructor: Helper,
    instance: instance
};
