import GitHub from 'github-api';
import _debug, { warn as _warn } from './debug'
import Store from './Store'
import File from './File'

const __GISTORE_JSON = '__gistore.json';
const __STORE_DEFAULT = '__default';
const __FILE_DEFAULT = 'Welcome.md';

const storeFileName = storeName => `store-${storeName}.json`;
const fileFileName = fileName => `file-${fileName}`;

class Gistore {

  _readyCalled = false
  _isReady = false
  _readyCallbacks = []

  _gasConfig = {}
  _stores = {}
  _files = {}

  constructor(auth) {
    this._ghApi = new GitHub(auth)
  }

  async _connect() {

    const ghUser = this._userApi = this._ghApi.getUser()
    _debug('Connecting Gistore...');
    const { data: gists } = await ghUser.listGists()

    for (let gist of gists) {
      // GAS found
      if (gist.files[__GISTORE_JSON]) {
        this._gistApi = this._ghApi.getGist(gist.id);

        const { data: retrievedGist } = await this._gistApi.read()

        const gasConfig = this._gasConfig = JSON.parse(retrievedGist.files[__GISTORE_JSON].content)

        this._stores = Object.keys(gasConfig.stores || {}).reduce((stores, storeName) => {
          const file = retrievedGist.files[storeFileName(storeName)]
          stores[storeName] = new Store(storeName, JSON.parse(file.content), this._gistApi)
          return stores;
        }, {});

        this._files = Object.keys(gasConfig.files || {}).reduce((files, fileName) => {
          const file = retrievedGist.files[fileFileName(fileName)]
          files[fileName] = new File(fileName, file.content, this._gistApi)
          return files;
        }, {});

        _debug('Gistore connected');
        return this._fireReadyCallbacks()
      }
    }

    // no Gistore found
    // create a new one
    _debug(`No ${__GISTORE_JSON} found in your Gists, creating a new Gistore storage...`);
    let gistApi = this._gistApi = this._ghApi.getGist();
    await gistApi
      .create({
        public: false,
        description: 'Gistore storage',
        files: {
          [__GISTORE_JSON]: {
            description: 'Gistore config file',
            content: JSON.stringify({
              version: '0.2.0', stores: {
                [__STORE_DEFAULT]: storeFileName(__STORE_DEFAULT)
              }, files: {
                [__FILE_DEFAULT]: fileFileName(__FILE_DEFAULT)
              }
            }),
          },
          [storeFileName(__STORE_DEFAULT)]: {
            description: 'Gistore default store',
            content: JSON.stringify({}),
          },
          [fileFileName(__FILE_DEFAULT)]: {
            content: '## Welcome to use Gistore!'
          }
        },
      })

    const { data: createdGist } = await gistApi.read()

    const gasConfig = this._gasConfig = JSON.parse(createdGist.files[__GISTORE_JSON].content)

    this._stores = Object.entries(gasConfig.stores).reduce((stores, [storeName, storeFile]) => {
      const file = createdGist.files[storeFile]
      if (!file) {
        _warn(`Cannot find file '${storeFile}' for store '${storeName}', check your gist at ${createdGist.url}`)
        return stores
      }
      return {
        ...stores,
        [storeName]: new Store(storeName, JSON.parse(file.content), this._gistApi)
      };
    }, {});

    this._files = Object.keys(gasConfig.files || {}).reduce((files, fileName) => {
      const file = createdGist.files[fileFileName(fileName)]
      files[fileName] = new File(fileName, file.content, this._gistApi)
      return files;
    }, {});

    _debug('GAS connected');
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
    if (!this._readyCalled) {
      this._readyCalled = true
      this._connect()
    }
    return this;
  }

  async defaultStore() {
    return await this.store(__STORE_DEFAULT);
  }

  async store(name, createIfNone = false) {
    if (this._stores[name]) {
      _debug(`Using store ${name}`)
      return this._stores[name];
    }

    if (!createIfNone) {
      throw new Error(`No store named '${name}' found in your Gistore`)
    }

    _debug(`No store named '${name}' found in your Gistore, creating one...`);

    const { data: updatedGist } = await this._gistApi
      .update({
        files: {
          [__GISTORE_JSON]: {
            content: JSON.stringify({
              ...this._gasConfig,
              stores: {
                ...this._gasConfig.stores,
                [name]: storeFileName(name)
              }
            })
          },
          [storeFileName(name)]: {
            description: `Gistore store '${name}'`,
            content: JSON.stringify({}),
          },
        },
      });

    _debug(`Using store ${name}`)
    return this._stores[name] = new Store(name, {}, this._gistApi)
  }

  stores() {
    return this._stores;
  }

  async file(name, createIfNone = false) {
    if (this._files[name]) {
      _debug(`Using file ${name}`)
      return this._files[name]
    }

    if (!createIfNone) {
      throw new Error(`No file named '${name} found in your Gistore`)
    }

    _debug(`No file named '${name}' found in your Gistore, creating one...`);

    const { data: updatedGist } = await this._gistApi
      .update({
        files: {
          [__GISTORE_JSON]: {
            content: JSON.stringify({
              ...this._gasConfig,
              files: {
                ...this._gasConfig.files,
                [name]: fileFileName(name)
              }
            })
          },
          [fileFileName(name)]: {
            content: ''
          },
        },
      });

    _debug(`Using file ${name}`)
    return this._files[name] = new File(name, {}, this._gistApi)
  }

  files() {
    return this._files
  }

  async owner() {
    const { data: profile } = await this._userApi.getProfile()
    return profile
  }
}

export default Gistore;
