import _isEqual from 'lodash.isequal';
const storeFileName = storeName => `store-${storeName}.json`;

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

  getAll() {
    return Object.entries(this._values);
  }

  async flush() {
    if (_isEqual(this._oldValues, this._values)) {
      return this;
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

export default Store;
