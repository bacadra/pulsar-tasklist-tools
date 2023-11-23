'use babel'

import { CompositeDisposable, Point } from 'atom'
import { TasklistStatus } from './status'

export default {

  config: {
    mouseToggle: {
      order: 1,
      title: "Toggle task by mouse click",
      description: "Middle click to toggle state of task",
      type: "boolean",
      default: true,
    },
    statusBar: {
      order: 2,
      title: "Status bar icons",
      description: "Show tasks summary in status bar",
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
        'tasklist-tools:high': () => this.task('▷'),
        'tasklist-tools:todo': () => this.task('☐'),
        'tasklist-tools:done': () => this.task('✔'),
        'tasklist-tools:fail': () => this.task('✘'),
        'tasklist-tools:info': () => this.task('•'),
        'tasklist-tools:translate': () => this.translate(),
        'tasklist-tools:move-to-last-header': () => this.moveToLastHeader(),
      }),
      atom.config.observe('tasklist-tools.mouseToggle', (value) => {
        value ? this.activateHandler() : this.deactivateHandler()
      }),
      atom.config.onDidChange('tasklist-tools.statusBar', (e) => {
        e.newValue ? this.activateStatusBar() : this.deactivateStatusBar()
      }),
    );
  },

  deactivate () {
    this.disposables.dispose()
    this.deactivateHandler()
    this.deactivateStatusBar()
  },

  task(mode) {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.mutateSelectedText( (selection) => {
      let rbase = selection.getBufferRange()
      let range = [[rbase.start.row, 0], [rbase.end.row, selection.isSingleScreenLine() || rbase.end.column>0 ? 1e9 : 0]]
      if (selection.isEmpty()) {
        let lineText = editor.getTextInBufferRange(range)
        if (!lineText.match(/^( *)(▷|☐|✔|✘|•)/mg)) {
          let symbol = mode ? mode : '☐'
          let indent = lineText.match(/^( *)/)[1].length
          editor.setTextInBufferRange([[range[0][0], indent], [range[1][0], indent]], symbol+' ')
          return
        }
      }
      this.tickMutate(editor, range, mode)
    })
  },

  tickMutate(editor, range, mode) {
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

  moveRowsToBufferRow(editor, selection, destinationRow) {
    editor.transact(() => {
      let rbase = selection.getBufferRange()
      selection.setBufferRange([[rbase.start.row, 0], [rbase.end.row+(selection.isSingleScreenLine() || rbase.end.column>0), 0]])
      let lineText = selection.getText()
      if (!lineText.endsWith('\n')) { lineText = lineText+'\n' }
      editor.setTextInBufferRange([[destinationRow, 0], [destinationRow, 0]], lineText)
      selection.delete()
    })
  },

  moveToLastHeader() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.backwardsScanInBufferRange(/^ *(.+?) *(:) *$/, [Point.ZERO, Point.INFINITY], (iterator) => {
      let destinationRow = iterator.range.start.row+1
      editor.transact(() => {
        for (let selection of editor.getSelections()) {
          this.moveRowsToBufferRow(editor, selection, destinationRow)
        }
        iterator.stop()
      })
    })
  },

  eventHandler(e) {
    const element = e.srcElement.closest('atom-text-editor')
    if (e.which!=2 || !element) { return }
    for (let i = 0 ; i < e.path.length ; i++) {
      if (e.path[i] && e.path[i].classList && e.path[i].classList.contains('line')) {
        if (e.path[i].querySelector('.syntax--tasklist.syntax--task')) {
          e.stopPropagation()
          if (!e.path[i].hasAttribute('data-screen-row')) { return }
          const editor = element.getModel()
          if (!editor) { return }
          let screenRow = parseInt(e.path[i].getAttribute('data-screen-row'))
          let row = editor.bufferPositionForScreenPosition([screenRow, 0]).row
          this.tickMutate(editor, [[row, 0], [row, 1e9]])
          break
        }
      }
    }
  },

  activateHandler() {
    atom.workspace.getElement().addEventListener("mousedown",
      this.eventHandlerBinded, { capture:true, passive:true }
    )
  },

  deactivateHandler() {
    atom.workspace.getElement().removeEventListener("mousedown",
      this.eventHandlerBinded, { capture:true, passive:true }
    )
  },

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar
    if (!atom.config.get('tasklist-tools.statusBar')) { return }
    this.activateStatusBar()
  },

  activateStatusBar() {
    if (!this.statusBar) { return }
    this.tasklistStatus = new TasklistStatus()
    this.statusBar.addLeftTile({ item:this.tasklistStatus, priority:0 })
  },

  deactivateStatusBar() {
    if (!this.tasklistStatus) { return }
    this.tasklistStatus.destroy()
  },
}
