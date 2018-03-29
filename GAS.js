const axios = require('axios');
const GitHub = require('github-api');

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
              this._gasGist = this._gistApi = this._ghApi.getGist(gist.id);
              this._db = gist.files;
              console.log('GAS connected');
              return resolve();
            }
          }

          // no GAS found
          console.debug(`No ${__GAS_JSON} found in your Gists, creating a new GAS storage...`);
          let gistApi = this._gistApi = this._ghApi.getGist();
          gistApi
            .create({
              public: false,
              description: 'GAS storage',
              files: {
                [__GAS_JSON]: {
                  content: JSON.stringify({}),
                },
                [storeFileName(__STORE_DEFAULT)]: {
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

  defaultStore(preload) {
    return this.store(__STORE_DEFAULT, preload);
  }

  store(name, preload = true) {
    return new Promise((resolve, reject) => {
      this._initPromise.then(() => {
        const __storeFileName = storeFileName(name)
        const storeFile = this._db[__storeFileName];
        if (storeFile) {
          return axios(storeFile.raw_url)
            .then(({ data }) => {
              return resolve(new Store(name, data, this._gasGist));
            })
            .catch(reject);
        }
        console.log(`No store named '${name}' found in your GAS, creating a new one...`);
        this._gasGist
          .update({
            files: {
              [__storeFileName]: {
                content: JSON.stringify({}),
              },
            },
          })
          .then(({ data }) => {
            this._db = data.files;
            return axios(this._db[__storeFileName].raw_url)
              .then(({ data }) => {
                return resolve(new Store(name, data, this._gasGist));
              })
              .catch(reject);
          })
          .catch(reject);
      })
    });
  }
}


class Store {
  constructor(name, values, gistApi) {
    this._name = name;
    this._values = values;
    this._gistApi = gistApi;
  }

  getItem(key) {
    return this._values[key];
  }

  setItem(key, value) {
    this._values[key] = value;
  }

  flush() {
    return this._gistApi
      .update({
        files: {
          [storeFileName(this._name)]: {
            content: JSON.stringify(this._values),
          },
        },
      });
  }
}

module.exports = GAS;
