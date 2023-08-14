import classNames from 'classnames'

import HistoryFileTreeDoc from './history-file-tree-doc'
import HistoryFileTreeFolder from './history-file-tree-folder'
import { ReactNode, useCallback } from 'react'
import type { HistoryFileTree, HistoryDoc } from '../../utils/file-tree'
import { useHistoryContext } from '../../context/history-context'
import { FileDiff } from '../../services/types/file'
import { fileFinalPathname } from '../../utils/file-diff'

type HistoryFileTreeFolderListProps = {
  folders: HistoryFileTree[]
  docs: HistoryDoc[]
  rootClassName?: string
  children?: ReactNode
}

function HistoryFileTreeFolderList({
  folders,
  docs,
  rootClassName,
  children,
}: HistoryFileTreeFolderListProps) {
  const {
    selection,
    setSelection,
    shouldShowVisualSelection,
    setShouldShowVisualSelection,
  } = useHistoryContext()

  const handleTopLevelClick = () => {
    setShouldShowVisualSelection(false)
  }

  const handleEvent = useCallback(
    (file: FileDiff, event: React.UIEvent) => {
      event.stopPropagation()
      setShouldShowVisualSelection(true)
      setSelection(prevSelection => {
        if (file.pathname !== prevSelection.selectedFile?.pathname) {
          return {
            ...prevSelection,
            selectedFile: file,
            previouslySelectedPathname: file.pathname,
          }
        }

        return prevSelection
      })
    },
    [setSelection, setShouldShowVisualSelection]
  )

  const handleClick = useCallback(
    (file: FileDiff, event: React.MouseEvent<HTMLLIElement>) => {
      handleEvent(file, event)
    },
    [handleEvent]
  )

  const handleKeyDown = useCallback(
    (file: FileDiff, event: React.KeyboardEvent<HTMLLIElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleEvent(file, event)
      }
    },
    [handleEvent]
  )

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <ul
      className={classNames('list-unstyled', rootClassName)}
      role="tree"
      onClick={handleTopLevelClick}
    >
      {folders.map(folder => (
        <HistoryFileTreeFolder
          key={folder.name}
          name={folder.name}
          folders={folder.folders}
          docs={folder.docs ?? []}
        />
      ))}
      {docs.map(doc => (
        <HistoryFileTreeDoc
          key={doc.pathname}
          name={doc.name}
          file={doc}
          selected={
            shouldShowVisualSelection &&
            !!selection.selectedFile &&
            fileFinalPathname(selection.selectedFile) === doc.pathname
          }
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />
      ))}
      {children}
    </ul>
  )
}

export default HistoryFileTreeFolderList
