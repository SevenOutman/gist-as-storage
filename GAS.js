const axios = require('axios');
const GitHub = require('github-api');
const _isEqual = require('lodash.isequal');

const __GAS_JSON = '__gas.json';
const __STORE_DEFAULT = '__default';

const storeFileName = storeName => `store-${storeName}.json`;

class GAS {
  constructor(token) {
    this._ghApi = new GitHub({ token });

    this._initPromise = new Promise((resolve, reject) => {
      this._ghApi.getUser()
        .listGists()
        .then(({ data }) => {

          for (let gist of data) {
            // GAS found
            if (gist.files[__GAS_JSON]) {
              this._gistApi = this._ghApi.getGist(gist.id);
              this._gistApi.read()
                .then(({ data }) => {
                  this._db = data.files;
                  console.debug('GAS connected');

                  resolve();
                });
              return;
            }
          }

          // no GAS found
          // create a new one
          console.debug(`No ${__GAS_JSON} found in your Gists, creating a new GAS storage...`);
          let gistApi = this._gistApi = this._ghApi.getGist();
          gistApi
            .create({
              public: false,
              description: 'GAS storage',
              files: {
                [__GAS_JSON]: {
                  description: 'GAS config file',
                  content: JSON.stringify({ version: '0.1.0' }),
                },
                [storeFileName(__STORE_DEFAULT)]: {
                  description: 'GAS default store',
                  content: JSON.stringify({}),
                },
              },
            })
            .then(() => gistApi.read())
            .then(({ data }) => {
              this._db = data.files;
              return resolve();
            })
            .catch(reject);
        })
        .catch(reject)
    });
  }

  ready(callback) {
    this._initPromise.then(() => {
      callback(this);
    });
  }

  defaultStore(preload) {
    return this.store(__STORE_DEFAULT, preload);
  }

  store(name, preload = true) {
    return new Promise((resolve, reject) => {
      const __storeFileName = storeFileName(name)
      const storeFile = this._db[__storeFileName];
      if (storeFile) {
        return resolve(new Store(name, JSON.parse(storeFile.content), this._gistApi));
      }
      console.log(`No store named '${name}' found in your GAS, creating a new one...`);
      this._gistApi
        .update({
          files: {
            [__storeFileName]: {
              description: `GAS store '${name}'`,
              content: JSON.stringify({}),
            },
          },
        })
        .then(({ data }) => {
          this._db = data.files;
          return resolve(new Store(name, JSON.parse(this._db[__storeFileName].content), this._gistApi));
        })
        .catch(reject);
    });
  }
}


class Store {
  constructor(name, values, gistApi) {
    this._name = name;
    this._oldValues = values;
    this._values = { ...values };
    this._gistApi = gistApi;
  }

  getItem(key) {
    return this._values[key];
  }

  setItem(key, value) {
    this._values[key] = value;
  }

  flush() {
    if (_isEqual(this._oldValues, this._values)) {
      return Promise.resolve(this);
    }

    return this._gistApi
      .update({
        files: {
          [storeFileName(this._name)]: {
            content: JSON.stringify(this._oldValues),
          },
        },
      });
  }
}

module.exports = GAS;
