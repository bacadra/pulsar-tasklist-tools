'use babel'

export class TasklistStatus extends HTMLElement {

  constructor() {
    super()
    this.classList.add('tasklist-status')
    this.ticks = []
    this.createTick('high', '▷')
    this.createTick('todo', '☐')
    this.createTick('done', '✔')
    this.createTick('fail', '✘')
    this.createTick('info', '•')
    this.editor = null
    this.subscribe()
  }

  subscribe() {
    this.oateSub = atom.workspace.observeActiveTextEditor((editor) => {
      if (this.odscSub) { this.odscSub.dispose() }
      if (editor && editor.getGrammar().scopeName==='text.tasklist') {
        this.editor = editor
        this.update()
        this.odscSub = editor.onDidStopChanging(() => { this.update() })
      } else {
        this.hide()
      }
    })
  }

  destroy() {
    this.editor = null
    this.oateSub.dispose()
    if (this.odscSub) { this.odscSub.dispose() }
    this.remove()
  }

  createTick(name, tick) {
    let el = document.createElement('span')
    el.id = `${name}-counter`
    el.classList.add('inline-block')
    el.name = name ; el.tick = tick ; el.count = 0
    el.regExp = new RegExp("^ *"+el.tick, "gm")
    el.onclick = () => this.onClickTick(el)
    this.appendChild(el) ; this.ticks.push(el)
  }

  updateTick(el, text) {
    el.count = (text.match(el.regExp) || []).length
    el.textContent = `${el.tick}  ${el.count}`
  }

  onClickTick(el) {
    let curPos = this.editor.getCursorBufferPosition()
    this._pass = false
    this.editor.scanInBufferRange(el.regExp, [[curPos.row+1, 0], [1e9, 1e9]], (iterator) => {
      this.editor.setCursorBufferPosition([iterator.range.end.row, 1e9], { autoscroll:true })
      iterator.stop()
      this._pass = true
    })
    if (!this._pass) {
      this.editor.scanInBufferRange(el.regExp, [[0, 0], [curPos.row+1, 0]], (iterator) => {
        this.editor.setCursorBufferPosition([iterator.range.end.row, 1e9], { autoscroll:true })
        iterator.stop()
        this._pass = true
      })
    }
  }

  update() {
    if (!this.editor) { return this.hide() }
    let text = this.editor.getText()
    for (let el of this.ticks) { this.updateTick(el, text) }
    this.style.display = 'inline-block'
  }

  hide() {
    this.style.display = 'none'
  }

}

customElements.define('tasklist-status', TasklistStatus)
