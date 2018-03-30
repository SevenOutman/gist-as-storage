<template>
  <div id="app">
    <header>
      <h1>GAS - Gist as Storage</h1>
      <p>
        Server-less, charge-free, space-unlimited storage for every GitHub user
      </p>
    </header>
    <main>
      <GASBrowser />
    </main>
    <footer>
      <a href="https://github.com/SevenOutman/gist-as-storage" target="_blank">Documentation</a>
      ·
      <a href="https://github.com/SevenOutman/gist-as-storage" target="_blank">GitHub</a>
      ·
      <a href="https://github.com/SevenOutman/gist-as-storage" target="_blank">How it works?</a>
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
    color: #2c3e50;

    height: 100vh;
    width: 100vw;
    max-width: 64rem;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    header {
      padding-top: 54px;
      text-align: center;
    }
    main {
      flex-grow: 1;
      display: flex;
    }

    footer {
      padding: 24px;
      text-align: center;
    }
  }
</style>
