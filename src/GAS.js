import GitHub from 'github-api';
import Store from './Store'

const __GAS_JSON = '__gas.json';
const __STORE_DEFAULT = '__default';

const storeFileName = storeName => `store-${storeName}.json`;

class GAS {

  _isReady = false
  _readyCallbacks = []
  _stores = {}

  _logger

  constructor(token, logger) {
    this._ghApi = new GitHub({ token })
    this._logger = logger
    this._init()
  }

  _debug(message) {
    this._logger && this._logger.log(message)
  }

  async _init() {

    const ghUser = this._userApi = this._ghApi.getUser()
    this._debug('Connecting GAS...');
    const { data: gists } = await ghUser.listGists()

    for (let gist of gists) {
      // GAS found
      if (gist.files[__GAS_JSON]) {
        this._gistApi = this._ghApi.getGist(gist.id);

        const { data: retrievedGist } = await this._gistApi.read()

        this._stores = Object.keys(retrievedGist.files).reduce((stores, fileName) => {
          if (fileName !== __GAS_JSON) {
            const file = retrievedGist.files[fileName]
            const storeName = fileName.match(/^store-(.*?)(?=\.json$)/)[1]
            stores[storeName] = new Store(storeName, JSON.parse(file.content), this._gistApi)
          }
          return stores;
        }, {});

        this._debug('GAS connected');
        return this._fireReadyCallbacks()
      }
    }

    // no GAS found
    // create a new one
    this._debug(`No ${__GAS_JSON} found in your Gists, creating a new GAS storage...`);
    let gistApi = this._gistApi = this._ghApi.getGist();
    await gistApi
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

    const { data: createdGist } = await gistApi.read()

    this._stores = Object.keys(createdGist.files).reduce((stores, fileName) => {
      if (fileName !== __GAS_JSON) {
        const file = createdGist.files[fileName]
        const storeName = fileName.match(/^store-(.*?)(?=\.json$)/)[1]
        stores[storeName] = new Store(storeName, JSON.parse(file.content), this._gistApi)
      }
      return stores;
    }, {});
    this._debug('GAS connected');
    this._fireReadyCallbacks()
  }

  _fireReadyCallbacks() {
    this._isReady = true

    let callback
    while (callback = this._readyCallbacks.shift()) {
      callback(this)
    }
  }

  ready(callback) {
    if (this._isReady) {
      callback(this)
    } else {
      this._readyCallbacks.push(callback);
    }
    return this;
  }

  async defaultStore() {
    return await this.store(__STORE_DEFAULT);
  }

  async store(name, createIfNone = false) {
    if (this._stores[name]) {
      this._debug(`Using store ${name}`)
      return this._stores[name];
    }

    if (!createIfNone) {
      throw new Error(`No store named '${name}' found in your GAS`)
    }

    this._debug(`No store named '${name}' found in your GAS, creating a new one...`);

    const { data: updatedGist } = await this._gistApi
      .update({
        files: {
          [storeFileName(name)]: {
            description: `GAS store '${name}'`,
            content: JSON.stringify({}),
          },
        },
      });

    this._debug(`Using store ${name}`)
    return this._stores[name] = new Store(name, {}, this._gistApi)
  }

  stores() {
    return this._stores;
  }

  async owner() {
    const { data: profile } = await this._userApi.getProfile()
    return profile
  }
}

export default GAS;
