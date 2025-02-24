const { CompositeDisposable, Point } = require('atom')
const { TasklistStatus } = require('./status')

module.exports = {

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
        'tasklist-tools:move-items-to-next-header': () => this.moveItemsToNextHeader(),
        'tasklist-tools:move-items-to-last-header': () => this.moveItemsToLastHeader(),
        'tasklist-tools:move-to-next-header': () => this.moveToNextHeader(),
        'tasklist-tools:move-to-previous-header': () => this.moveToPreviousHeader(),
        'tasklist-tools:move-to-last-header': () => this.moveToLastHeader(),
      }),
      atom.config.observe('tasklist-tools.mouseToggle', (value) => {
        value ? this.activateHandler() : this.deactivateHandler()
      }),
      atom.config.onDidChange('tasklist-tools.statusBar', (e) => {
        e.newValue ? this.activateStatusBar() : this.deactivateStatusBar()
      }),
    )
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
        if (!lineText.match(/^([\t ]*)(▷|☐|✔|✘|•)/mg)) {
          let symbol = mode ? mode : '☐'
          let indent = lineText.match(/^([\t ]*)/)[1].length
          editor.setTextInBufferRange([[range[0][0], indent], [range[1][0], indent]], symbol+' ')
          return
        }
      }
      this.tickMutate(editor, range, mode)
    })
  },

  tickMutate(editor, range, mode) {
    editor.scanInBufferRange(/^([\t ]*)(•|▷|☐|✔|✘)/mg, range, (iterator) => {
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
      editor.scan(/^([\t ]*)[-\*] \[ \]/mg, (iterator) => {
        iterator.replace(`${iterator.match[1]}☐`)
      })
      editor.scan(/^([\t ]*)[-\*] \[x\]/mgi, (iterator) => {
        iterator.replace(`${iterator.match[1]}✔`)
      })
      editor.scan(/^([\t ]*)[-\*]/mg, (iterator) => {
        iterator.replace(`${iterator.match[1]}•`)
      })
    })
  },

  moveItemsToBufferRow(editor, selection, destinationRow) {
    editor.transact(() => {
      let rbase = selection.getBufferRange()
      selection.setBufferRange([[rbase.start.row, 0], [rbase.end.row+(selection.isSingleScreenLine() || rbase.end.column>0), 0]])
      let lineText = selection.getText()
      if (!lineText.endsWith('\n')) { lineText = lineText+'\n' }
      editor.setTextInBufferRange([[destinationRow, 0], [destinationRow, 0]], lineText)
      selection.delete()
    })
  },

  moveItemsToLastHeader() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.backwardsScanInBufferRange(/^[\t ]*([^▷☐✔✘• \n].*?) *(:) *$/, [Point.ZERO, Point.INFINITY], (iterator) => {
      editor.transact(() => {
        for (let selection of editor.getSelections()) {
          this.moveItemsToBufferRow(editor, selection, iterator.range.start.row+1)
        }
        iterator.stop()
      })
    })
  },

  moveItemsToNextHeader() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.transact(() => {
      for (let selection of editor.getSelections()) {
        let rbase = selection.getBufferRange()
        editor.scanInBufferRange(/^[\t ]*([^▷☐✔✘• \n].*?) *(:) *$/, [rbase.start, Point.INFINITY], (iterator) => {
          this.moveItemsToBufferRow(editor, selection, iterator.range.start.row+1)
          iterator.stop()
        })
      }
    })
  },

  moveToLastHeader() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.backwardsScanInBufferRange(/^[\t ]*([^▷☐✔✘• \n].*?) *(:) *$/, [Point.ZERO, Point.INFINITY], (iterator) => {
      editor.setCursorBufferPosition([iterator.range.start.row, Point.INFINITY.column])
      iterator.stop()
    })
  },

  moveToNextHeader() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    let cursor = editor.getLastCursor()
    let bufferPosition = cursor.getBufferPosition()
    editor.scanInBufferRange(/^[\t ]*([^▷☐✔✘• \n].*?) *(:) *$/, [[bufferPosition.row+1, 0], Point.INFINITY], (iterator) => {
      editor.setCursorBufferPosition([iterator.range.start.row, Point.INFINITY.column])
      iterator.stop()
    })
  },

  moveToPreviousHeader() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    let cursor = editor.getLastCursor()
    let bufferPosition = cursor.getBufferPosition()
    editor.backwardsScanInBufferRange(/^[\t ]*([^▷☐✔✘• \n].*?) *(:) *$/, [Point.ZERO, [bufferPosition.row-1, Point.INFINITY.column]], (iterator) => {
      editor.setCursorBufferPosition([iterator.range.start.row, Point.INFINITY.column])
      iterator.stop()
    })
  },

  eventHandler(e) {
    const element = e.srcElement.closest('atom-text-editor')
    if (e.which!=2 || !element) { return }
    let line = event.target.closest('.line[data-screen-row]')
    if (!line) { return }
    const editor = element.getModel()
    if (!editor) { return }
    e.stopPropagation()
    let screenRow = parseInt(line.getAttribute('data-screen-row'))
    let row = editor.bufferPositionForScreenPosition([screenRow, 0]).row
    this.tickMutate(editor, [[row, 0], [row, 1e9]])
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
