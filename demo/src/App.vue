<template>
  <div id="app">
    <header>
      <h1>GAS - Gist as Storage</h1>
      <p>Enter your <a href="https://github.com/settings/tokens" target="_blank">GitHub personal access token</a> with
      <pre style="display: inline;background: #eee;padding: 0 5px;border-radius: 3px">gist</pre>
      scope and click 'Connect GAS'
      </p>
    </header>
    <main>
      <GASBrowser />
    </main>
    <footer>
      <a href="https://github.com/SevenOutman/gist-as-storage/tree/master/demo" target="_blank">GAS Browser</a> by <a
      href="https://github.com/SevenOutman" target="_blank">SevenOutman</a>
    </footer>
  </div>
</template>

<script>
  import GASBrowser from './components/GASBrowser';

  export default {
    name: 'App',
    components: {
      GASBrowser,
    },
  }
</script>

<style lang="less">

  * {
    box-sizing: border-box;
    font-family: 'Source Sans Pro', 'Lucida Grande', sans-serif;
  }

  html,
  body {
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  a {
    color: #41b883;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    height: 100vh;
    width: 100vw;
    max-width: 64rem;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    header {
      padding-top: 54px;
    }
    main {
      flex-grow: 1;
      display: flex;
    }

    footer {
      padding: 24px;
    }
  }
</style>
