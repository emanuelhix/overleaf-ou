// import { FormEventHandler, useCallback, useState, useRef, memo } from 'react'
// import {
//   useCodeMirrorStateContext,
//   useCodeMirrorViewContext,
// } from '@/features/source-editor/components/codemirror-context'
// import { EditorSelection } from '@codemirror/state'
// import { useTranslation } from 'react-i18next'
// import { useThreadsActionsContext } from '../context/threads-context'
// import { removeNewCommentRangeEffect } from '@/features/source-editor/extensions/review-tooltip'
// import useSubmittableTextInput from '../hooks/use-submittable-text-input'
// import AutoExpandingTextArea from '@/shared/components/auto-expanding-text-area'
// import { ReviewPanelEntry } from './review-panel-entry'
// import { ThreadId } from '../../../../../types/review-panel/review-panel'
// import { useModalsContext } from '@/features/ide-react/context/modals-context'
// import { debugConsole } from '@/utils/debugging'
// import OLButton from '@/features/ui/components/ol/ol-button'

// export const ReviewPanelAddComment = memo<{
//   docId: string
//   from: number
//   to: number
//   threadId: string
//   top: number | undefined
// }>(function ReviewPanelAddComment({ from, to, threadId, top, docId }) {
//   const { t } = useTranslation()
//   const view = useCodeMirrorViewContext()
//   const state = useCodeMirrorStateContext()
//   const { addComment } = useThreadsActionsContext()
//   const [submitting, setSubmitting] = useState(false)
//   const { showGenericMessageModal } = useModalsContext()

//   const handleClose = useCallback(() => {
//     view.dispatch({
//       effects: removeNewCommentRangeEffect.of(threadId),
//     })
//   }, [view, threadId])

//   const submitForm = useCallback(
//     async message => {
//       setSubmitting(true)

//       const content = view.state.sliceDoc(from, to)

//       try {
//         await addComment(from, content, message)
//         handleClose()
//         view.dispatch({
//           selection: EditorSelection.cursor(view.state.selection.main.anchor),
//         })
//       } catch (err) {
//         debugConsole.error(err)
//         showGenericMessageModal(
//           t('add_comment_error_title'),
//           t('add_comment_error_message')
//         )
//       }
//       setSubmitting(false)
//     },
//     [addComment, view, handleClose, from, to, showGenericMessageModal, t]
//   )

//   const { handleChange, handleKeyPress, content } =
//     useSubmittableTextInput(submitForm)

//   const handleBlur = useCallback(() => {
//     if (content === '') {
//       window.setTimeout(() => {
//         handleClose()
//       })
//     }
//   }, [content, handleClose])

//   const handleSubmit = useCallback<FormEventHandler>(
//     event => {
//       event.preventDefault()
//       submitForm(content)
//     },
//     [submitForm, content]
//   )

//   // We only ever want to focus the element once
//   const hasBeenFocused = useRef(false)

//   // Auto-focus the textarea once the element has been correctly positioned.
//   // We cannot use the autofocus attribute as we need to wait until the parent element
//   // has been positioned (with the "top" attribute) to avoid scrolling to the initial
//   // position of the element
//   const observerCallback = useCallback(mutationList => {
//     if (hasBeenFocused.current) {
//       return
//     }

//     for (const mutation of mutationList) {
//       if (mutation.target.style.top) {
//         const textArea = mutation.target.getElementsByTagName('textarea')[0]
//         if (textArea) {
//           textArea.focus()
//           hasBeenFocused.current = true
//         }
//       }
//     }
//   }, [])

//   const handleElement = useCallback(
//     (element: HTMLElement | null) => {
//       if (element) {
//         element.dispatchEvent(new Event('review-panel:position'))

//         const observer = new MutationObserver(observerCallback)
//         const entryWrapper = element.closest('.review-panel-entry')
//         if (entryWrapper) {
//           observer.observe(entryWrapper, {
//             attributes: true,
//             attributeFilter: ['style'],
//           })
//           return () => observer.disconnect()
//         }
//       }
//     },
//     [observerCallback]
//   )

//   return (
//     <ReviewPanelEntry
//       docId={docId}
//       top={top}
//       position={from}
//       op={{
//         p: from,
//         c: state.sliceDoc(from, to),
//         t: threadId as ThreadId,
//       }}
//       selectLineOnFocus={false}
//       disabled={submitting}
//     >
//       <form
//         className="review-panel-entry-content"
//         onBlur={handleBlur}
//         onSubmit={handleSubmit}
//         ref={handleElement}
//       >
//         <AutoExpandingTextArea
//           name="message"
//           className="review-panel-add-comment-textarea"
//           onChange={handleChange}
//           onKeyPress={handleKeyPress}
//           placeholder={t('add_your_comment_here')}
//           value={content}
//           disabled={submitting}
//         />
//         <div className="review-panel-add-comment-buttons">
//           <OLButton
//             variant="ghost"
//             size="sm"
//             className="review-panel-add-comment-cancel-button"
//             disabled={submitting}
//             onClick={handleClose}
//           >
//             {t('cancel')}
//           </OLButton>
//           <OLButton
//             type="submit"
//             variant="primary"
//             size="sm"
//             disabled={content === '' || submitting}
//           >
//             {t('comment')}
//           </OLButton>
//         </div>
//       </form>
//     </ReviewPanelEntry>
//   )
// })


import {
  FormEventHandler,
  useCallback,
  useState,
  useRef,
  memo,
  useEffect,
} from 'react'
import {
  useCodeMirrorStateContext,
  useCodeMirrorViewContext,
} from '@/features/source-editor/components/codemirror-context'
import { EditorSelection } from '@codemirror/state'
import { useTranslation } from 'react-i18next'
import { useThreadsActionsContext } from '../context/threads-context'
import { removeNewCommentRangeEffect } from '@/features/source-editor/extensions/review-tooltip'
import useSubmittableTextInput from '../hooks/use-submittable-text-input'
import AutoExpandingTextArea from '@/shared/components/auto-expanding-text-area'
import { ReviewPanelEntry } from './review-panel-entry'
import { ThreadId } from '../../../../../types/review-panel/review-panel'
import { useModalsContext } from '@/features/ide-react/context/modals-context'
import OLButton from '@/features/ui/components/ol/ol-button'

type Contact = { id: string; email: string; first_name: string; last_name: string }

export const ReviewPanelAddComment = memo<{
  docId: string
  from: number
  to: number
  threadId: string
  top: number | undefined
}>(function ReviewPanelAddComment({ from, to, threadId, top, docId }) {
  const { t } = useTranslation()
  const view = useCodeMirrorViewContext()
  const state = useCodeMirrorStateContext()
  const { addComment } = useThreadsActionsContext()
  const [submitting, setSubmitting] = useState(false)
  const { showGenericMessageModal } = useModalsContext()

  // --- mention logic ---
  const [contacts, setContacts] = useState<Contact[]>([])
  const [mentionQuery, setMentionQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Contact[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // fetch contacts once
  useEffect(() => {
    fetch('/user/contacts')
      .then(res => res.json())
      .then(data => {
        const list: Contact[] = data.contacts.map((c: any) => ({
          id: c.id,
          email: c.email,
          first_name: c.first_name,
          last_name: c.last_name,
        }))
        // add a “myself” entry
        setContacts([{ id: 'me', email: '@myself', first_name: '', last_name: '' }, ...list])
      })
  }, [])

  // wrap the existing hook
  const { handleChange: _onChange, handleKeyPress, content } =
    useSubmittableTextInput(submitForm)
  // intercept change to track mentions
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      _onChange(e)
      const value = e.target.value
      const m = /@(\w*)$/.exec(value)
      if (m) {
        const q = m[1].toLowerCase()
        setMentionQuery(q)
        setSuggestions(
          contacts.filter(c => c.email.toLowerCase().includes(q)).slice(0, 5)
        )
      } else {
        setMentionQuery('')
        setSuggestions([])
      }
    },
    [_onChange, contacts]
  )

  // pick a suggestion
  const insertMention = (c: Contact) => {
    const newText = content.replace(/@(\w*)$/, `@${c.email} `)
    _onChange({ target: { value: newText } } as any)
    setMentionQuery('')
    setSuggestions([])
    textareaRef.current?.focus()
  }

  // ----------------------

  const handleClose = useCallback(() => {
    view.dispatch({
      effects: removeNewCommentRangeEffect.of(threadId),
    })
  }, [view, threadId])

  const submitForm = useCallback(
    async (message: string) => {
      setSubmitting(true)
      const selectionContent = view.state.sliceDoc(from, to)
      try {
        await addComment(from, selectionContent, message)
        handleClose()
        view.dispatch({
          selection: EditorSelection.cursor(view.state.selection.main.anchor),
        })
      } catch (err) {
        showGenericMessageModal(
          t('add_comment_error_title'),
          t('add_comment_error_message')
        )
      } finally {
        setSubmitting(false)
      }
    },
    [addComment, view, handleClose, from, to, showGenericMessageModal, t]
  )

  const handleBlur = useCallback(() => {
    if (content === '') {
      window.setTimeout(handleClose, 0)
    }
  }, [content, handleClose])

  const handleSubmit: FormEventHandler = useCallback(
    e => {
      e.preventDefault()
      submitForm(content)
    },
    [submitForm, content]
  )

  // auto-focus logic
  const hasBeenFocused = useRef(false)
  const observerCallback = useCallback((mutations: MutationRecord[]) => {
    if (hasBeenFocused.current) return
    for (const m of mutations) {
      if ((m.target as HTMLElement).style.top) {
        const ta = (m.target as HTMLElement).querySelector('textarea')
        if (ta) {
          (ta as HTMLTextAreaElement).focus()
          hasBeenFocused.current = true
        }
      }
    }
  }, [])

  const handleElement = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      el.dispatchEvent(new Event('review-panel:position'))
      const wrapper = el.closest('.review-panel-entry')
      if (wrapper) {
        const obs = new MutationObserver(observerCallback)
        obs.observe(wrapper, { attributes: true, attributeFilter: ['style'] })
        return () => obs.disconnect()
      }
    },
    [observerCallback]
  )

  return (
    <ReviewPanelEntry
      docId={docId}
      top={top}
      position={from}
      op={{ p: from, c: state.sliceDoc(from, to), t: threadId as ThreadId }}
      selectLineOnFocus={false}
      disabled={submitting}
    >
      <form
        className="review-panel-entry-content"
        onBlur={handleBlur}
        onSubmit={handleSubmit}
        ref={handleElement}
      >
        <AutoExpandingTextArea
          ref={textareaRef}
          name="message"
          className="review-panel-add-comment-textarea"
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={t('add_your_comment_here')}
          value={content}
          disabled={submitting}
        />
        {suggestions.length > 0 && (
          <ul className="mention-suggestions">
            {suggestions.map(c => (
              <li key={c.id} onMouseDown={() => insertMention(c)}>
                {c.email}
              </li>
            ))}
          </ul>
        )}
        <div className="review-panel-add-comment-buttons">
          <OLButton
            variant="ghost"
            size="sm"
            disabled={submitting}
            onClick={handleClose}
          >
            {t('cancel')}
          </OLButton>
          <OLButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={content === '' || submitting}
          >
            {t('comment')}
          </OLButton>
        </div>
      </form>
    </ReviewPanelEntry>
  )
})
