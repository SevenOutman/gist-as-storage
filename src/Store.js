import _isEqual from 'lodash.isequal';

const storeFileName = storeName => `store-${storeName}.json`;

class Store {
  constructor(name, values, gistApi) {
    this._name = name;
    this._oldValues = values;
    this._values = { ...values };
    this._gistApi = gistApi;
  }

  get name() {
    return this._name;
  }

  getItem(key) {
    return this._values[key];
  }

  setItem(key, value) {
    this._values[key] = value;
  }

  removeItem(key) {
    delete this._values[key];
  }

  getAll() {
    return { ...this._values };
  }

  hasChanged() {
    return !_isEqual(this._oldValues, this._values);
  }

  diff() {
    if (!this.hasChanged()) {
      return null
    }

    let diff = {
      added: {},
      changed: {},
      removed: {}
    }
    Object.keys(this._values).forEach(key => {
      if (!this._oldValues.hasOwnProperty(key)) {
        diff.added[key] = { value: this._values[key] }
      } else if (!_isEqual(this._values[key], this._oldValues[key])) {
        diff.changed[key] = { value: this._values[key], oldValue: this._oldValues[key] }
      }
    })

    Object.keys(this._oldValues).forEach(key => {
      if (!this._values.hasOwnProperty(key)) {
        diff.removed[key] = { oldValue: this._oldValues[key] }
      }
    })
    return diff
  }

  async flush() {
    if (!this.hasChanged()) {
      return this;
    }

    await this._gistApi
      .update({
        files: {
          [storeFileName(this._name)]: {
            content: JSON.stringify(this._values),
          },
        },
      });

    this._oldValues = { ...this._values }

    return this
  }
}

export default Store;
