'use babel'

import { CompositeDisposable, Disposable } from 'atom'

export default {

  config: {
    mouseToggle: {
      order: 1,
      title: "Toggle task by mouse click",
      description: "Middle click to toggle state of task",
      type: "boolean",
      default: true,
    },
  },

  activate () {
    this.eventHandlerBinded = this.eventHandler.bind(this)
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.commands.add('atom-text-editor:not([mini])', {
        'tasklist-tools:toggle': () => this.task(),
        'tasklist-tools:info': () => this.task('•'),
        'tasklist-tools:high': () => this.task('▷'),
        'tasklist-tools:todo': () => this.task('☐'),
        'tasklist-tools:done': () => this.task('✔'),
        'tasklist-tools:fail': () => this.task('✘'),
        'tasklist-tools:translate': () => this.translate()
      }),
      atom.config.observe('tasklist-tools.mouseToggle', (value) => {
        value ? this.activateHandler() : this.deactivateHandler()
      }),
    );
  },

  deactivate () {
    this.disposables.dispose()
    this.deactivateHandler()
  },

  task(mode) {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.mutateSelectedText( (selection) => {
      let rbase = selection.getBufferRange()
      let range = [[rbase.start.row, 0], [rbase.end.row, selection.isSingleScreenLine() || rbase.end.column>0 ? 1e9 : 0]]
      if (selection.isEmpty()) {
        let lineText = editor.getTextInBufferRange(range)
        if (!lineText.match(/^( *)(•|▷|☐|✔|✘)/mg)) {
          let symbol = mode ? mode : '☐'
          let indent = lineText.match(/^( *)/)[1].length
          editor.setTextInBufferRange([[range[0][0], indent], [range[1][0], indent]], symbol+' ')
          return
        }
      }
      editor.scanInBufferRange(/^( *)(•|▷|☐|✔|✘)/mg, range, (iterator) => {
        let symbol
        if (mode) {
          symbol = mode
        } else if ('•▷☐'.includes(iterator.match[2])) {
          symbol = `✔`
        } else if (iterator.match[2]==='✔') {
          symbol = `✘`
        } else if (iterator.match[2]==='✘') {
          symbol = `☐`
        }
        editor.setTextInBufferRange([[iterator.range.end.row, iterator.range.end.column-1], iterator.range.end], symbol)
      })
    })
  },

  translate() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.transact(() => {
      editor.scan(/^( *)[-\*] \[ \]/mg, (iterator) => {
        iterator.replace(`${iterator.match[1]}☐`)
      })
      editor.scan(/^( *)[-\*] \[x\]/mgi, (iterator) => {
        iterator.replace(`${iterator.match[1]}✔`)
      })
      editor.scan(/^( *)[-\*]/mg, (iterator) => {
        iterator.replace(`${iterator.match[1]}•`)
      })
    })
  },

  eventHandler(e) {
    if (e.which!=2 || !e.srcElement.closest('atom-text-editor')) { return }
    for (let i = 0 ; i < e.path.length ; i++) {
      if (e.path[i] && e.path[i].classList && e.path[i].classList.contains('line')) {
        if (e.path[i].querySelector('.syntax--tasklist.syntax--task')) {
          setTimeout(this.task, 10)
          break
        }
      }
    }
  },

  activateHandler() {
    atom.workspace.getElement().addEventListener("mousedown", this.eventHandlerBinded)
  },

  deactivateHandler() {
    atom.workspace.getElement().removeEventListener("mousedown", this.eventHandlerBinded)
  },
}
