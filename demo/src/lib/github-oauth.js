const OAUTH_URL = 'https://github.com/login/oauth/authorize';
const FETCH_TOKEN_URL = 'https://github.com/login/oauth/access_token';

class OAuth {
  constructor(config) {
    const { client_id, client_secret } = config;
    if (!client_id || !client_secret) {
      throw new Error();
    }
    this.__config = config;
    this._receiveCode();
  }

  _receiveCode() {
    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    const code = getParameterByName('code');
    if (code) {
      const { client_id, client_secret } = this.__config;
      fetch(FETCH_TOKEN_URL, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code,
        }),
      })
        .then((res) => res.json())
        .then(({ access_token }) => {
          if (window.opener) {
            window.opener.postMessage(access_token, location.origin);
          }
        })
    }
  }

  _createMessageCallback = (resolve, reject) => {
    const callback = ({ data }) => {
      const token = data;
      this.authWindow.close();
      window.removeEventListener('message', callback);
      return resolve(data);
    };
    return callback;
  };

  login() {
    const { client_id, redirect_uri = location.href, scopes = [] } = this.__config;
    const queryString = [
      `client_id=${client_id}`,
      `redirect_uri=${redirect_uri}`,
      `scope=${encodeURIComponent(scopes.join(' '))}`,
    ].join('&');

    const width = 960;
    const height = 600;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    // @see https://github.com/netlify/netlify-auth-providers/blob/0e82265f248d3354a642d326815aac7cccbed9e5/src/netlify.js#L108
    this.authWindow = window.open(
      `${OAUTH_URL}?${queryString}`,
      "GitHub Authorization",
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, " +
      ("width=" + width + ", height=" + height + ", top=" + top + ", left=" + left + ");"),
    );

    return new Promise((resolve, reject) => {
      window.addEventListener('message', this._createMessageCallback(resolve, reject), false);
    });
  }
}

export default OAuth;
