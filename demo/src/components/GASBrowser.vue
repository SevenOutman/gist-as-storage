<template>
  <div class="gas-browser">
    <div class="toolbar">
      <input type="text" id="token" v-model="token">
      <button @click="connectGAS">Connect GAS</button>
    </div>
    <div class="panels">
      <div class="panel stores">
        <ul>
          <li v-for="store of stores" :key="store">
            {{ store }}
          </li>
        </ul>
      </div>
      <div class="panel table">
        <div class="row" v-for="(entry, index) of entries" :key="index">
          <div class="cell">{{ entry[0]}}</div>
          <div class="cell">{{ entry[1]}}</div>
        </div>
      </div>
      <div class="panel logs">
        <pre v-for="(line, index) of logs" :key="index">{{line}}</pre>
      </div>
    </div>
  </div>
</template>

<script>
  import GAS from 'gist-as-storage'

  export default {
    name: "GASBrowser",
    data() {
      return {
        token: '',
        logs: [],
        stores: [],
        entries: [],
      }
    },
    methods: {
      log(message) {
        this.logs.push(message)
      },
      connectGAS() {
        this.gas = new GAS(this.token, this)
          .ready(async (gas) => {
            this.stores = gas.stores()
            const store1 = await gas.store('store1')
            store1.setItem('key', 'valuepp')
            await store1.flush()
            this.entries = store1.getAll()

          });
      },
    },
  }
</script>

<style lang="less" scoped>
  * {
    box-sizing: border-box;
  }
  .gas-browser {
    display: flex;
    flex-direction: column;

    background-color: #eee;

    .toolbar {
      display: flex;
      #token {
        flex-grow: 1;
      }
    }
    .panels {
      flex-grow: 1;
      display: flex;

      min-height: 50vh;

      .panel {
        text-align: start;
      }

      .stores {
        padding: 15px;
        flex-basis: 25%;
        ul {
          list-style: none;
          padding: 0;
          margin: 0;

        }
      }

      .table {
        flex-grow: 1;
        .row {
          display: flex;
          .cell {
            flex-grow: 1;
          }
        }
      }
      .logs {
        padding: 0 15px;
        flex-basis: 25%;
        background-color: black;
        color: green;
      }
    }
  }
</style>
