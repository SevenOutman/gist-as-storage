<template>
  <div class="gas-browser">

    <div class="panels">
      <div class="overlay" v-show="!token">
        <div style="margin: 0 auto 200px; text-align: center">
          <p>You need to</p>
          <button type="button" @click="requireOAuth">
            <svg class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
            <span>Login with GitHub</span>
          </button>
          <p>to connect to your Gistore.</p>
        </div>
      </div>
      <div class="panel stores">
        <div class="panel-header">
          Connection
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
          <p class="placeholder" v-else>No Gistore Connection</p>
        </div>
      </div>
      <div class="panel table">
        <div class="panel-header">
          Store {{ currentStore && currentStore.name }}
          <template v-if="currentStoreDiff">
            - {{ Object.keys(currentStoreDiff.added).length}} added, {{ Object.keys(currentStoreDiff.changed).length}}
            changed, {{ Object.keys(currentStoreDiff.removed).length}} removed
            <a href role="button" tabindex="-1" @click.prevent="commitStoreChanges">commit changes</a>
          </template>
        </div>
        <div class="panel-body">
          <table v-if="currentStore">
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            <tr
              v-for="(entry, index) of Object.entries(currentStore.getAll())"
              :key="index"
              :class="{
                'added': currentStoreDiff && currentStoreDiff.added[entry[0]],
                'changed': currentStoreDiff && currentStoreDiff.changed[entry[0]]
              }"
            >
              <td>{{ entry[0]}}</td>
              <td>{{ entry[1]}}</td>
            </tr>
            <tr>
              <td class="new">
                <input type="text" v-model="newKey" @keydown.enter="onNewItem">
              </td>
              <td class="new">
                <input type="text" v-model="newValue" :readonly="!newKey" @keydown.enter="onNewItem"
                       @keydown.tab.prevent="onNewItem">
              </td>
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
    <div class="footer">
      <a href="https://github.com/SevenOutman/gist-as-storage/tree/master/demo" target="_blank">
        Gistore GUI by SevenOutman
      </a>
      · Version {{version}}
    </div>
  </div>
</template>

<script>
  import GAS from 'gistore'
  import Authenticator from 'netlify-auth-providers'

  export default {
    name: 'GistoreGUI',
    data() {
      return {
        version: VERSION,
        token: localStorage.getItem('access_token'),
        owner: null,
        logs: [],
        stores: [],
        entries: [],
        currentStore: null,

        currentStoreDiff: null,

        newKey: '',
        newValue: '',
      }
    },
    methods: {
      onNewItem() {
        this.currentStore.setItem(this.newKey, this.newValue)
        this.newKey = ''
        this.newValue = ''
        this.currentStoreDiff = this.currentStore.diff()
      },
      log(message) {
        this.logs.push(message)
      },
      requireOAuth() {
        new Authenticator({ site_id: 'gistore.netlify.com' }).authenticate({
          provider: 'github',
          scope: 'gist'
        }, (err, data) => {
          if (err) {
            console.log(err)
            return
          }
          this.token = data.token
          localStorage.setItem('access_token', this.token)
        })
      },
      connectGAS() {
        this.log('Connecting GAS...')
        this.gas = new GAS(this.token)
          .ready(async (gas) => {
            this.owner = await gas.owner()
            this.log('GAS connected')
            this.stores = gas.stores()
          })
      },
      async commitStoreChanges() {
        if (this.currentStore) {
          await this.currentStore.flush()
          this.currentStoreDiff = this.currentStore.diff()
        }
      },
    },
    mounted() {
      this.log(`Gistore Browser launched at ${new Date()}`)
      if (this.token) {
        this.connectGAS()
      }
    },
  }
</script>

<style lang="less">
  .gas-browser {
    flex-grow: 1;

    display: flex;
    flex-direction: column;

    position: relative;
    .overlay {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      display: flex;
      align-items: center;

      background-color: rgba(255, 255, 255, .7);

      .octicon {
        margin-right: 10px;
        vertical-align: middle;
        display: inline-block;
        fill: currentColor;
      }

    }

    .toolbar, .overlay {
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
        letter-spacing: 0.015625em;

        &[readonly] {
          color: #888;
        }
        &[type="password"] {
          letter-spacing: .5em;
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

        line-height: 24px;

        font-weight: 600;

        color: #fff;
        border: 1px solid rgba(27, 31, 35, 0.2);
        user-select: none;
        background: #28a745 linear-gradient(-180deg, #34d058 0%, #28a745 90%) repeat-x -1px -1px;
        background-size: 110% 110%;

        span {
          vertical-align: middle;
        }

        &[disabled] {
          opacity: .5;
        }
        &:not([disabled]) {
          cursor: pointer;

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
          line-height: 24px;
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
              cursor: pointer;
              &:hover {
                background: #f6f8fa;
              }
              &.current {
                background: #f6f8fa;
                position: relative;
                &::before {
                  content: ' ';
                  position: absolute;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  top: 50%;
                  left: 5px;
                  margin-top: -3px;
                  display: block;
                  background: rgba(255, 255, 255, 1);
                  box-shadow: inset 0 0 10px 2px rgba(105, 255, 135, 1), 0 0 8px 1px rgba(117, 255, 182, 1);
                }
              }
            }
            &:hover {
              li.current:not(:hover) {
                background-color: transparent;
              }
            }
          }
        }
      }

      .table {
        width: 50%;
        margin: 0 12px;
        .panel-body {
          padding: 15px 0;
          table {
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: -15px;

            tr {
              &.added {
                background-color: rgba(0, 255, 0, .1);
              }
              &.changed {
                background-color: rgba(0, 0, 255, .1);
              }
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
                width: 60%;
              }

              &.new {
                padding: 0;
                input {
                  height: 100%;
                  width: 100%;
                  padding: 0 10px;
                  border: none;
                }
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
    .footer {
      border-bottom: 1px solid #eee;
      font-size: 14px;
      padding: 5px 0;
      color: #ccc;

      a {
        color: #ccc;
        &:hover {
          color: #41b883;
          text-decoration: none;
        }
      }
    }
  }
</style>
