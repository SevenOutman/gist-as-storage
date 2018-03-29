<template>
  <div id="app">
    <h1>GAS - Gist as Storage</h1>
    <p>Enter your GitHub personal token with
    <pre style="display: inline;background: #eee;padding: 5px;border-radius: 3px">gist</pre>
    scope and click 'Connect GAS'
    </p>
    <GASBrowser />
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

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
