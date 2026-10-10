import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { ModalDialog } from '../ModalDialog/ModalDialog'
import { useI18n } from '../../i18n/I18nProvider'
import { PRIVACY_PATH } from '../../features/legal/legalPaths'
import { cameraPermission, captureFrame, startCamera, stopCamera, type CameraProblem } from '../../lib/camera'
import { inAppBrowser, isAndroid, isIos, openInBrowserLinks } from '../../lib/inAppBrowser'
import { Note, OpenLink, PrivacyLine, Shield, Shot, Viewfinder } from './CameraCapture.styles'

type Phase = 'checking' | 'ask' | 'starting' | 'live' | 'taken' | CameraProblem

/**
 * The only way to add a plant photo: a live camera in a dialog. Asks first (what the camera is for, then the
 * browser's own prompt), skips the ask when access is already granted, and explains a refusal or a missing
 * camera. `onCapture` gets a JPEG data URL; the camera stops as soon as the dialog closes. Inside an app's built-in
 * browser (the Google app, Instagram, …) the camera is usually blocked, so a refusal there offers Safari or Chrome.
 * A browser that already said no is still asked once more: iPhone's "denied" is often only for that visit.
 */
export function CameraCapture({ onCapture, onClose }: { onCapture: (photo: string) => void; onClose: () => void }) {
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<Phase>('checking')
  const [shot, setShot] = useState<string>()
  // The shutter waits for the first frame, so a photo is never blank.
  const [ready, setReady] = useState(false)
  const [inApp] = useState(() => inAppBrowser())

  const open = useCallback(async () => {
    setPhase('starting')
    setReady(false)
    try {
      const stream = await startCamera()
      stopCamera(streamRef.current)
      streamRef.current = stream
      setPhase('live')
    } catch (problem) {
      setPhase(problem as CameraProblem)
    }
  }, [])

  useEffect(() => {
    let alive = true
    void cameraPermission().then((state) => {
      if (!alive) return
      // Granted, or refused before: try at once (a refusal comes back as 'denied' with the how-to).
      if (state === 'prompt') setPhase('ask')
      else void open()
    })
    return () => {
      alive = false
      stopCamera(streamRef.current)
      streamRef.current = null
    }
  }, [open])

  // The video element mounts with the live phase; attach the stream once it is there.
  useEffect(() => {
    const video = videoRef.current
    if (phase !== 'live' || !video || !streamRef.current) return
    video.srcObject = streamRef.current
    void video.play().catch(() => undefined)
  }, [phase])

  const take = () => {
    const video = videoRef.current
    const photo = video ? captureFrame(video) : null
    if (!photo) return
    setShot(photo)
    setPhase('taken')
  }

  const use = () => {
    if (!shot) return
    stopCamera(streamRef.current)
    streamRef.current = null
    onCapture(shot)
  }

  const blockedInApp = inApp && (phase === 'denied' || phase === 'failed' || phase === 'unavailable')
  const links = blockedInApp ? openInBrowserLinks(window.location.href) : null

  const problem = blockedInApp
    ? {
        title: t.camera.inAppTitle,
        body: inApp === 'app' ? t.camera.inAppBodyGeneric : t.camera.inAppBody.replace('{app}', inApp),
      }
    : phase === 'denied'
      ? { title: t.camera.deniedTitle, body: t.camera.deniedBody }
      : phase === 'unavailable'
        ? { title: t.camera.unavailableTitle, body: t.camera.unavailableBody }
        : phase === 'failed'
          ? { title: t.camera.failedTitle, body: t.camera.failedBody }
          : null

  const footer =
    phase === 'ask' ? (
      <>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t.camera.notNow}
        </Button>
        <Button type="button" onClick={() => void open()} data-camera-allow>
          {t.camera.allow}
        </Button>
      </>
    ) : phase === 'live' ? (
      <>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t.common.cancel}
        </Button>
        <Button type="button" variant="growth" onClick={take} disabled={!ready} data-camera-shutter>
          {t.camera.shutter}
        </Button>
      </>
    ) : phase === 'taken' ? (
      <>
        <Button type="button" variant="ghost" onClick={() => setPhase('live')}>
          {t.camera.retake}
        </Button>
        <Button type="button" onClick={use} data-camera-use>
          {t.camera.use}
        </Button>
      </>
    ) : problem ? (
      <>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t.common.cancel}
        </Button>
        {phase !== 'unavailable' ? (
          <Button type="button" onClick={() => void open()}>
            {t.camera.tryAgain}
          </Button>
        ) : null}
      </>
    ) : null

  // A click or key inside this portal must not reach the dialog that opened it (it would close).
  return (
    <Shield onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <ModalDialog
        title={phase === 'ask' ? t.camera.askTitle : problem ? problem.title : t.camera.title}
        lead={phase === 'ask' ? t.camera.askBody : problem?.body}
        onClose={onClose}
        width={520}
        footer={footer}
      >
        {phase === 'ask' ? (
          <PrivacyLine>
            {t.camera.askPrivacy}{' '}
            <a href={PRIVACY_PATH} target="_blank" rel="noreferrer">
              {t.camera.privacyLink}
            </a>
          </PrivacyLine>
        ) : null}
        {phase === 'denied' && !blockedInApp && (isIos() || isAndroid()) ? (
          <PrivacyLine data-camera-howto>{isIos() ? t.camera.deniedIos : t.camera.deniedAndroid}</PrivacyLine>
        ) : null}
        {links ? (
          <PrivacyLine>
            {links.safari ? <OpenLink href={links.safari}>{t.auth.inAppSafari}</OpenLink> : null}
            <OpenLink href={links.chrome}>{t.auth.inAppChrome}</OpenLink>
          </PrivacyLine>
        ) : null}
        {phase === 'starting' || phase === 'checking' ? (
          <Viewfinder data-camera-phase={phase}>
            <Note>{t.camera.starting}</Note>
          </Viewfinder>
        ) : null}
        {phase === 'live' || phase === 'taken' ? (
          <Viewfinder data-camera-phase={phase}>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              hidden={phase === 'taken'}
              onLoadedData={() => setReady(true)}
            />
            {phase === 'taken' && shot ? <Shot src={shot} alt="" /> : null}
          </Viewfinder>
        ) : null}
      </ModalDialog>
    </Shield>
  )
}
