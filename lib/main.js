'use babel'

import { CompositeDisposable } from 'atom'

export default {

  activate () {
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.commands.add('atom-text-editor:not([mini])', {
        'tasklist-tools:toggle': () => this.task(),
        'tasklist-tools:todo': () => this.task('☐'),
        'tasklist-tools:done': () => this.task('✔'),
        'tasklist-tools:fail': () => this.task('✘'),
      }),
    );
  },

  deactivate () {
    this.disposables.dispose()
  },

  task(mode) {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    editor.mutateSelectedText( (selection) => {
      let rbase = selection.getBufferRange()
      let range =  [[rbase.start.row, 0], [rbase.end.row, selection.isSingleScreenLine() || rbase.end.column>0 ? 1e9 : 0]]
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
  },
}
