<template>
  <div id="app">
    <header>
      <h1>Gistore</h1>
      <h2>
        Server-less, charge-free, space-unlimited storage for every GitHub user
      </h2>
    </header>
    <main>
      <gistore-gui />
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
  import GistoreGUI from './components/GUI';

  export default {
    name: 'App',
    components: {
      'gistore-gui': GistoreGUI,
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
      text-align: center;

      h1 {
        font-size: 48px;
        position: relative;
        display: inline-block;
        margin-bottom: 0;
        &::before {
          content: '';
          background-image: url(./assets/logo.png);
          position: absolute;
          left: -53px;
          top: 0;
          height: 48px;
          width: 48px;
          background-size: contain;
          display: block;
        }
      }
      h2 {
        margin-top: 0;
        font-weight: normal;
      }
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
