import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { getVideo } from '@/api/listeningApi'
import { PracticeModeDialog, type ModeDialogLesson } from '@/components/listening/PracticeModeDialog'
import type { VideoSummary } from '@/types/listening'

/**
 * What a click on a lesson card does: a guest goes to sign in (and comes back with the lesson open), the viewer's
 * own unfinished lesson opens in the editor, anything else asks which practice to start. A page given
 * {@code ?open=ID} (the way back from signing in) opens that lesson's dialog once.
 */
export function useOpenLesson(known: VideoSummary[]) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [dialog, setDialog] = useState<ModeDialogLesson | null>(null)

  const open = (video: VideoSummary) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: location.pathname, search: `?open=${video.id}` } } })
      return
    }
    if (video.mine && video.status !== 'READY') {
      navigate(`/listening/${video.id}/edit`)
      return
    }
    setDialog(video)
  }

  const wanted = Number(params.get('open'))
  useEffect(() => {
    if (!isAuthenticated || !wanted) return
    const clear = () => {
      const next = new URLSearchParams(params)
      next.delete('open')
      setParams(next, { replace: true })
    }
    const found = known.find((v) => v.id === wanted)
    if (found) {
      clear()
      open(found)
      return
    }
    let cancelled = false
    getVideo(wanted)
      .then((v) => {
        if (cancelled) return
        clear()
        if (v.mine && v.status !== 'READY') navigate(`/listening/${v.id}/edit`)
        else setDialog({ id: v.id, title: v.title, translationStatus: v.translationStatus })
      })
      .catch(() => !cancelled && clear())
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, wanted, known.length])

  const dialogs = dialog ? <PracticeModeDialog video={dialog} onClose={() => setDialog(null)} /> : null
  return { open, dialogs, openDialog: setDialog }
}
