import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Project } from '../../../../../../../../types/project/dashboard/api'
import LockProjectModal from '../../../modals/lock-project-modal'
import useIsMounted from '../../../../../../shared/hooks/use-is-mounted'
import { deleteProject } from '../../../../util/api'
import { useProjectListContext } from '../../../../context/project-list-context'
import getMeta from '@/utils/meta'
import OLTooltip from '@/features/ui/components/ol/ol-tooltip'
import OLIconButton from '@/features/ui/components/ol/ol-icon-button'

type LockProjectButtonProps = {
    project: Project
    children: (text: string, handleOpenModal: () => void) => React.ReactElement
}

function LockProjectButton({ project, children }: LockProjectButtonProps) {
    const { removeProjectFromView } = useProjectListContext()
    const { t } = useTranslation()
    const text = t('lock')
    const [showModal, setShowModal] = useState(false)
    const isMounted = useIsMounted()

    const handleOpenModal = useCallback(() => {
        setShowModal(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        if (isMounted.current) {
            setShowModal(false)
        }
    }, [isMounted])

    const isOwner = useMemo(() => {
        return project.owner && getMeta('ol-user_id') === project.owner.id
    }, [project])

    // FIXME: handleLockedProject -- update the UI here, it should be disabled in this view and enabled in the "locked projects" tab
    // const handleDeleteProject = useCallback(async () => {
    //     await deleteProject(project.id)

    //     // update view
    //     removeProjectFromView(project)
    // }, [project, removeProjectFromView])

    // Only the owner can lock the project.

    // use callback will update this function if project or removeProjectFromView change
    const handleLockProject = useCallback(async () => {

    }, [project, removeProjectFromView])

    if (!isOwner) return null

    return (
        <>
            {children(text, handleOpenModal)}
            <LockProjectModal
                projects={[project]}
                actionHandler={handleLockProject}
                showModal={showModal}
                handleCloseModal={handleCloseModal}
            />
        </>
    )
}

const LockProjectButtonTooltip = memo(function LockProjectButtonTooltip({
    project,
}: Pick<LockProjectButtonProps, 'project'>) {
    return (
        <LockProjectButton project={project}>
            {(text, handleOpenModal) => (
                <OLTooltip
                    key={`tooltip-lock-project-${project.id}`}
                    id={`lock-project-${project.id}`}
                    description={text}
                    overlayProps={{ placement: 'top', trigger: ['hover', 'focus'] }}
                >
                    <span>
                        <OLIconButton
                            onClick={handleOpenModal}
                            variant="link"
                            accessibilityLabel={text}
                            className="action-btn"
                            icon="block"
                        />
                    </span>
                </OLTooltip>
            )}
        </LockProjectButton>
    )
})

export default memo(LockProjectButton)
export { LockProjectButtonTooltip }
