'use babel'

import { CompositeDisposable } from 'atom'
import date from 'date-and-time'

export default {

  config: {
    timestamp: {
      order: 1,
      title: 'Timestamp format',
      description: 'For full list of tokens check [date-and-time](https://www.npmjs.com/package/date-and-time#formatdateobj-arg-utc) package',
      type: 'string',
      default: 'YYYY/MM/DD HH:mm:ss',
    },
    autostamp: {
      order: 2,
      title: 'Auto stamp after state change',
      description: 'Please note stamps can be added/updated/deleted manually',
      type: 'boolean',
      default: false,
    },
  },

  activate () {
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.commands.add('atom-text-editor', {
        'tasklist-tools:toggle': () => this.setTask(),
        'tasklist-tools:todo'  : () => this.setTask('☐'),
        'tasklist-tools:done'  : () => this.setTask('✔'),
        'tasklist-tools:fail'  : () => this.setTask('✘'),
        'tasklist-tools:stamp' : () => this.setStamp(),
        'tasklist-tools:clean' : () => this.clean(),
      }),
      atom.config.observe('tasklist-tools.timestamp', (value) => {
        this.timestamp = value
      }),
      atom.config.observe('tasklist-tools.autostamp', (value) => {
        this.autostamp = value
      }),
    );
  },

  deactivate () {
    this.disposables.dispose()
  },

  setTask(mode) {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.mutateSelectedText( (selection) => {
      let range = this.getRange(selection)
      if (selection.isEmpty()) {
        let lineText = editor.getTextInBufferRange(range)
        if (!lineText.match(/^( *)(☐|✔|✘)/mg)) {
          let symbol = mode ? mode : '☐'
          let indent = lineText.match(/^( *)/)[1].length
          editor.setTextInBufferRange([[range[0][0], 0], [range[1][0], indent]], ' '.repeat(indent)+symbol+' ')
          return
        }
      }
      editor.scanInBufferRange(/^( *)(☐|✔|✘)/mg, range, (iterator) => {
        let symbol
        if (mode) {
          symbol = mode
        } else if (iterator.match[2]==='☐') {
          symbol = `✔`
        } else if (iterator.match[2]==='✔') {
          symbol = `✘`
        } else if (iterator.match[2]==='✘') {
          symbol = `☐`
        }
        iterator.replace(`${iterator.match[1]}${symbol}`)
      })
    })
    if (this.autostamp) { this.setStamp() }
  },

  setStamp() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.mutateSelectedText( (selection) => {
      let range = this.getRange(selection)
      editor.scanInBufferRange(/^( *)(☐|✔|✘)( \[.+?\])?/mg, range, (iterator) => {
        let timestamp = date.format(new Date(), this.timestamp)
        iterator.replace(`${iterator.match[1]}${iterator.match[2]} [${timestamp}]`)
      })
    })
  },

  clean() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.mutateSelectedText( (selection) => {
      let range = this.getRange(selection)
      editor.scanInBufferRange(/^( *)(☐|✔|✘)( \[.+?\])?/mg, range, (iterator) => {
        iterator.replace(`${iterator.match[1]}${iterator.match[2]}`)
      })
    })
  },

  getRange(selection) {
    let rbase = selection.getBufferRange()
    return [[rbase.start.row, 0], [rbase.end.row, selection.isSingleScreenLine() || rbase.end.column>0 ? 1e9 : 0]]
  }
}
