# tasklist-tools

A superset of commands to improve tasklist workflow. A grammar supply package is required, e.g. [language-tasklist](https://github.com/asiloisad/pulsar-language-tasklist).

## Installation

To install `tasklist-tools` search for [tasklist-tools](https://web.pulsar-edit.dev/packages/tasklist-tools) in the Install pane of the Pulsar settings or run `ppm install tasklist-tools`. Alternatively, you can run `ppm install asiloisad/pulsar-tasklist-tools` to install a package directly from the Github repository.

## Commands

A command are available in `atom-text-editor:not([mini])`, but shortcuts are preset only in `atom-text-editor[data-grammar~="tasklist"]:not([mini])` space.

Command | Shortcut | Description
-: | - | -
`.toggle` | `Alt-Enter` | add or toggle tick of selected tasks by `▷` `☐` `•` -> `✔` -> `✘` -> `☐` cycle
`.high` | `Alt-/` | add or change tick of selected tasks as `▷`
`.todo` | `Alt-*` | add or change tick of selected tasks as `☐`
`.done` | `Alt-+` | add or change tick of selected tasks as `✔`
`.fail` | `Alt--` | add or change tick of selected tasks as `✘`
`.info` | `Alt-.` | add or change tick of selected tasks as `•`
`.translate` | | translate markdown-style ticks and bullets to tasklist-style, e.g. `- [ ]` -> `☐`, `* [X]` -> `✔`

## Mouse support

Press MiddleClick to toggle state of tasks or create it if doesn't exists.

## Move item to header

There are methods to make it easier to navigate through the document.

- `tasklist-tools:move-items-to-next-header`: move selected items to next header
- `tasklist-tools:move-items-to-last-header`: move selected items to last header
- `tasklist-tools:move-to-next-header`: set cursor position equal to next header
- `tasklist-tools:move-to-previous-header`: set cursor position equal to previous header
- `tasklist-tools:move-to-last-header`: set cursor position equal to last header

## Outline

An outline is supported by [navigation-panel](https://github.com/asiloisad/pulsar-navigation-panel).

## Archive

There is no explicit definition of archive, but a command `tasklist-tools:move-to-last-header` can used. It move selected lines next to line next to last header.

## Status-bar

![status-bar](https://github.com/asiloisad/pulsar-tasklist-tools/blob/master/assets/status-bar.png?raw=true)

Status-bar has counter of each task type. Click on it to move cursor to next one.

# Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub — any feedback’s welcome!
