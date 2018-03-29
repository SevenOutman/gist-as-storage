import GitHub from 'github-api';
import Store from './Store'

const __GAS_JSON = '__gas.json';
const __STORE_DEFAULT = '__default';

const storeFileName = storeName => `store-${storeName}.json`;

class GAS {

  _isReady = false
  _readyCallbacks = []

  constructor(token, logger = console) {
    this._ghApi = new GitHub({ token })
    this._logger = logger;
    this._init()
  }

  async _init() {

    const ghUser = this._ghApi.getUser()
    this._logger.log('Connecting GAS...');
    const { data: gists } = await ghUser.listGists()

    for (let gist of gists) {
      // GAS found
      if (gist.files[__GAS_JSON]) {
        this._gistApi = this._ghApi.getGist(gist.id);

        const { data } = await this._gistApi.read()
        this._db = data.files;
        this._logger.log('GAS connected');
        return this._fireReadyCallbacks()
      }
    }

    // no GAS found
    // create a new one
    this._logger.log(`No ${__GAS_JSON} found in your Gists, creating a new GAS storage...`);
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
    this._db = createdGist.files;
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

  async store(name) {
    const __storeFileName = storeFileName(name)
    const storeFile = this._db[__storeFileName];
    if (storeFile) {
      this._logger.log(`Using store ${name}`)
      return new Store(name, JSON.parse(storeFile.content), this._gistApi)
    }

    this._logger.log(`No store named '${name}' found in your GAS, creating a new one...`);

    const { data: updatedGist } = await this._gistApi
      .update({
        files: {
          [__storeFileName]: {
            description: `GAS store '${name}'`,
            content: JSON.stringify({}),
          },
        },
      })

    this._db = updatedGist.files;
    this._logger.log(`Using store ${name}`)
    return new Store(name, JSON.parse(this._db[__storeFileName].content), this._gistApi)
  }

  stores() {
    return Object.keys(this._db).filter(name => name !== __GAS_JSON).map(fileName => fileName.match(/^store-(.*?)(?=\.json$)/)[1]);
  }

  async flush() {
    return await this.store();
  }
}

export default GAS;
