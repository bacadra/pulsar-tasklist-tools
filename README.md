# tasklist-tools

A set of tools to work with tasklist. A grammar has been provided by [language-tasklist](https://github.com/bacadra/pulsar-language-tasklist) package.

Press `Alt-Enter` or middle click to toggle state of tasks or create it if doesn't exists.

## Installation

To install `tasklist-tools` search for [tasklist-tools](https://web.pulsar-edit.dev/packages/tasklist-tools) in the Install pane of the Pulsar settings or run `ppm install tasklist-tools`. Alternatively, you can run `ppm install bacadra/pulsar-tasklist-tools` to install a package directly from the Github repository.

## List of commands

A command are available in `atom-text-editor:not([mini])`, but shortcuts are preset only in `atom-text-editor[data-grammar~="tasklist"]:not([mini])` space.

| Shortcut | Command | Description |
| -: | - | - |
| <div style="white-space:nowrap">`Alt-Enter`</div> | <div style="white-space:nowrap">`&:toggle`</div> | add or toggle tick of selected tasks by `▷` `☐` `•` -> `✔` -> `✘` -> `☐` cycle |
| <div style="white-space:nowrap">`Alt-/`</div> | <div style="white-space:nowrap">`&:high`</div> | add or change tick of selected tasks as `▷` |
| <div style="white-space:nowrap">`Alt-*`</div> | <div style="white-space:nowrap">`&:todo`</div> | add or change tick of selected tasks as `☐` |
| <div style="white-space:nowrap">`Alt-+`</div> | <div style="white-space:nowrap">`&:done`</div> | add or change tick of selected tasks as `✔` |
| <div style="white-space:nowrap">`Alt--`</div> | <div style="white-space:nowrap">`&:fail`</div> | add or change tick of selected tasks as `✘` |
| <div style="white-space:nowrap">`Alt-.`</div> | <div style="white-space:nowrap">`&:info`</div> | add or change tick of selected tasks as `•` |
| | <div style="white-space:nowrap">`&:translate`</div> | translate markdown-style ticks and bullets to tasklist-style, e.g. `- [ ]` -> `☐`, `* [X]` -> `✔` |

## Move to header

There are methods to make it easier to navigate through the document.

- `tasklist-tools:move-items-to-next-header`: move selected items to next header
- `tasklist-tools:move-items-to-last-header`: move selected items to last header
- `tasklist-tools:move-to-next-header`: set cursor position equal to next header
- `tasklist-tools:move-to-previous-header`: set cursor position equal to previous header
- `tasklist-tools:move-to-last-header`: set cursor position equal to last header

## Outline

An outline is supported by [navigation-panel](https://github.com/bacadra/pulsar-navigation-panel).

## Archive

There is no explicit definition of archive, but a command `tasklist-tools:move-to-last-header` can used. It move selected lines next to line next to last header.

## Status-bar

![status-bar](https://github.com/bacadra/pulsar-tasklist-tools/blob/master/assets/status-bar.png?raw=true)

Status-bar has counter of each task type. Click on it to move cursor to next one.

# Contributing

If you have any ideas on how to improve the package, spot any bugs, or would like to support the development of new features, please feel free to share them via GitHub.
