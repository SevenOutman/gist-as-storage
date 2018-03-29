<template>
  <div class="gas-browser">
    <div class="toolbar">
      <!--<div class="logo">GAS Browser</div>-->
      <input type="text" id="token" placeholder="Token" v-model="token">
      <button type="button" @click="connectGAS">Connect GAS</button>
    </div>
    <div class="panels">
      <div class="panel stores">
        <div class="panel-header">
          GAS
        </div>
        <div class="panel-body">
          <ul v-if="owner">
            {{ owner.login }}
            <li
              v-for="store of stores"
              :key="store.name"
              :class="{'current': store === currentStore}"
              @click="currentStore = store"
            >
              {{ store.name }}
            </li>
          </ul>
          <p class="placeholder" v-else>No GAS Connection</p>
        </div>
      </div>
      <div class="panel table">
        <div class="panel-header">
          Store {{ currentStore && currentStore.name }}
        </div>
        <div class="panel-body">
          <table v-if="currentStore">
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            <tr v-for="(entry, index) of currentStore.getAll()" :key="index">
              <td>{{ entry[0]}}</td>
              <td>{{ entry[1]}}</td>
            </tr>
          </table>
          <p class="placeholder" v-else>No store specified</p>
        </div>
      </div>
      <div class="panel logs">
        <div class="panel-header">Logs</div>
        <div class="panel-body">
          <p v-for="(line, index) of logs" :key="index">{{line}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import GAS from 'gist-as-storage'

  export default {
    name: 'GASBrowser',
    data() {
      return {
        token: '',
        owner: null,
        logs: [],
        stores: [],
        entries: [],
        currentStore: null
      }
    },
    methods: {
      log(message) {
        this.logs.push(message)
      },
      connectGAS() {
        this.log('Connecting GAS...')
        this.gas = new GAS(this.token)
          .ready(async (gas) => {
            this.owner = await gas.owner()
            this.log('GAS connected')
            this.stores = gas.stores()

            const store1 = await gas.store('store1')
            store1.setItem('app', 'GAS Browser')
          })
      },
    },
    mounted() {
      this.log(`GAS browser launched at ${new Date()}`)
    }
  }
</script>

<style lang="less">
  .gas-browser {
    flex-grow: 1;

    display: flex;
    flex-direction: column;

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 12px 0;

      .logo {
        padding: 16px;
      }
      input {
        flex-grow: 1;

        -webkit-appearance: none;
        border: none;
        outline: none;

        padding: 16px;
        border-radius: 4px;
        background-color: rgb(239, 239, 239);

        font-size: 16px;
        font-weight: 600;

        &[readonly] {
          color: #888;
        }

        ::-webkit-input-placeholder {
          color: #888;
          letter-spacing: 0.015625em;
          font-weight: 600;
        }
      }
      button {
        -webkit-appearance: none;
        outline: none;

        border-radius: 4px;
        padding: 16px;
        font-size: 16px;
        margin-left: 12px;

        font-weight: 600;

        cursor: pointer;

        color: #fff;
        border: 1px solid rgba(27, 31, 35, 0.2);
        user-select: none;
        background: #28a745 linear-gradient(-180deg, #34d058 0%, #28a745 90%) repeat-x -1px -1px;
        background-size: 110% 110%;
        &:hover {
          background: #269f42 linear-gradient(-180deg, #2fcb53 0%, #269f42 90%) -.5em;
          border-color: rgba(27, 31, 35, 0.5);
        }
        &:active {
          background: #279f43 none;
          border-color: rgba(27, 31, 35, 0.5);
          box-shadow: inset 0 0.15em 0.3em rgba(27, 31, 35, .15);
        }
      }
    }
    .panels {
      flex-grow: 1;
      display: flex;
      .panel {
        display: flex;
        flex-direction: column;
        text-align: start;

        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #eee;
        background-color: #fff;

        .panel-header {
          height: 24px;
          padding: 0 10px;
          background-color: #eee;
        }
        .panel-body {
          flex-grow: 1;
          padding: 15px;

          .placeholder {
            text-align: center;
          }
        }
      }

      .stores {
        flex-basis: 25%;
        .panel-body {
          padding: 15px 0 0;
          ul {
            margin: -15px 0 0;
            list-style: none;
            padding: 0 0 0 10px;
            user-select: none;
            line-height: 1.5;
            li {
              padding-left: 1em;
              &.current {
                background: #f6f8fa;
              }
            }
          }
        }
      }

      .table {
        flex-grow: 1;
        margin: 0 12px;
        .panel-body {
          padding: 15px 0;
          table {
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: -15px;
            tr:nth-child(odd):not(:first-child) {
              background: #f6f8fa;
            }
            th,
            td {
              padding: 0 10px;

              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              border: solid #eee;
              border-width: 0 1px 1px 1px;
              &:first-child {
                border-left: none;
              }
              &:last-child {
                border-right: none;
              }
            }
          }
        }
      }
      .logs {
        width: 25%;
        .panel-body {
          p {
            margin-top: 0;
            font-family: monospace;
          }
        }
      }
    }
  }
</style>
