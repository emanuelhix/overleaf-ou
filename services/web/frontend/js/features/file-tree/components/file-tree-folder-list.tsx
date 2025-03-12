import classNames from 'classnames'
import { useState, useEffect } from 'react'

import FileTreeDoc from './file-tree-doc'
import FileTreeFolder from './file-tree-folder'
import { fileCollator } from '../util/file-collator'
import { Folder } from '../../../../../types/folder'
import { Doc } from '../../../../../types/doc'
import { FileRef } from '../../../../../types/file-ref'
import { ConnectDropTarget } from 'react-dnd'

type ExtendedFileRef = FileRef & { isFile: true }

// ✅ New Feature: Function to determine file icons based on type
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'txt':
      return '📝'
    case 'doc':
    case 'docx':
      return '📖'
    case 'xls':
    case 'xlsx':
      return '📊'
    case 'ppt':
    case 'pptx':
      return '📽️'
    case 'zip':
    case 'rar':
      return '📦'
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return '💻'
    case 'css':
    case 'scss':
      return '🎨'
    case 'html':
      return '🌐'
    default:
      return '📁'
  }
}

function FileTreeFolderList({
  folders,
  docs,
  files,
  classes = {},
  dropRef = null,
  children,
  dataTestId,
}: {
  folders: Folder[]
  docs: Doc[]
  files: FileRef[]
  classes?: { root?: string }
  dropRef?: ConnectDropTarget | null
  children?: React.ReactNode
  dataTestId?: string
}) {
  // ✅ New Feature: Track selected files for multi-selection
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  
  // ✅ New Feature: Check for dark mode and adjust styles accordingly
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    // Check if user prefers dark mode
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeMediaQuery.matches)

    const handleDarkModeChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches)
    }

    darkModeMediaQuery.addEventListener('change', handleDarkModeChange)
    return () => darkModeMediaQuery.removeEventListener('change', handleDarkModeChange)
  }, [])

  // ✅ New Feature: Allow drag selection for multiple files
  const [dragSelection, setDragSelection] = useState<Set<string>>(new Set())

  const handleMouseDown = (fileId: string) => {
    setDragSelection(new Set([fileId]))
  }

  const handleMouseEnter = (fileId: string) => {
    setDragSelection(prev => {
      const newSet = new Set(prev)
      newSet.add(fileId)
      return newSet
    })
  }

  const handleMouseUp = () => {
    setSelectedFiles(new Set([...selectedFiles, ...dragSelection]))
    setDragSelection(new Set())
  }

  files = files.map(file => ({ ...file, isFile: true }))
  const docsAndFiles: (Doc | ExtendedFileRef)[] = [...docs, ...files]

  // ✅ New Feature: Toggle selection of individual files
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  return (
    <div>
      {/* ✅ Display the number of selected files */}
      <div className="file-selection-info">
        <strong>Selected Files: {selectedFiles.size}</strong>
      </div>

      <ul
        className={classNames(
          'list-unstyled',
          'file-tree-folder-list',
          classes.root,
          { 'dark-mode': isDarkMode }
        )}
        role="tree"
        ref={dropRef}
        data-testid={dataTestId}
      >
        <div className="file-tree-folder-list-inner">
          {folders.sort(compareFunction).map(folder => {
            return (
              <FileTreeFolder
                key={folder._id}
                name={folder.name}
                id={folder._id}
                folders={folder.folders}
                docs={folder.docs}
                files={folder.fileRefs}
              />
            )
          })}
          {docsAndFiles.sort(compareFunction).map(doc => {
            const isSelected = selectedFiles.has(doc._id)
            const isDragging = dragSelection.has(doc._id)

            if ('isFile' in doc) {
              return (
                <div
                  key={doc._id}
                  className={classNames('file-item', { selected: isSelected, dragging: isDragging })}
                  onClick={() => toggleFileSelection(doc._id)}
                  onMouseDown={() => handleMouseDown(doc._id)}
                  onMouseEnter={() => handleMouseEnter(doc._id)}
                  onMouseUp={handleMouseUp}
                  draggable
                >
                  {/* ✅ File icons next to file names */}
                  <span className="file-icon">{getFileIcon(doc.name)}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFileSelection(doc._id)}
                  />
                  <FileTreeDoc
                    name={doc.name}
                    id={doc._id}
                    isFile={doc.isFile}
                    isLinkedFile={doc.linkedFileData && !!doc.linkedFileData.provider}
                  />
                </div>
              )
            }

            return (
              <div
                key={doc._id}
                className={classNames('file-item', { selected: isSelected, dragging: isDragging })}
                onClick={() => toggleFileSelection(doc._id)}
                onMouseDown={() => handleMouseDown(doc._id)}
                onMouseEnter={() => handleMouseEnter(doc._id)}
                onMouseUp={handleMouseUp}
                draggable
              >
                <span className="file-icon">{getFileIcon(doc.name)}</span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFileSelection(doc._id)}
                />
                <FileTreeDoc name={doc.name} id={doc._id} />
              </div>
            )
          })}
          {children}
        </div>
      </ul>
    </div>
  )
}

function compareFunction(one: { name: string }, two: { name: string }) {
  return fileCollator.compare(one.name, two.name)
}

export default FileTreeFolderList
