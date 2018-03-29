<template>
  <div id="app">
    <header>
      <h1>GAS - Gist as Storage</h1>
      <p>Enter your GitHub personal token with
      <pre style="display: inline;background: #eee;padding: 0 5px;border-radius: 3px">gist</pre>
      scope and click 'Connect GAS'
      </p>
    </header>
    <main>
      <GASBrowser />
    </main>
    <footer>
      GAS Browser by SevenOutman
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
