import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, Input, TextArea } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { notifyInfo } from '../../../../lib/httpNotice'
import { patchAdminUser, type UserPatch } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { User } from '../../../../mock/types'
import { ErrorText } from '../ModerationDialog/ModerationDialog.styles'

/** Admin edits a member's profile (#68): account name, public nickname, bio, region. Logged on the server. */
export function UserEditDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const { t } = useI18n()
  const { plantxEnv, noteUser } = useStore()
  const [form, setForm] = useState<Required<Pick<User, 'name' | 'bio' | 'bioHe' | 'region' | 'regionHe'>> & { nickname: string }>({
    name: user.name,
    nickname: user.nickname ?? '',
    bio: user.bio,
    bioHe: user.bioHe,
    region: user.region,
    regionHe: user.regionHe,
  })
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  const save = async () => {
    setBusy(true)
    setFailed(false)
    const patch: UserPatch = { ...form }
    if (plantxEnv === 'mock') {
      noteUser({ ...user, ...patch })
    } else {
      const outcome = await patchAdminUser(user.id, patch)
      if (!outcome.ok) {
        setBusy(false)
        setFailed(true)
        return
      }
      noteUser(outcome.data.user)
    }
    setBusy(false)
    notifyInfo(t.edit.userSaved.replace('{name}', form.nickname || form.name))
    onClose()
  }

  return (
    <ModalDialog
      title={t.edit.userTitle.replace('{name}', user.nickname || user.name)}
      lead={user.email}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="button" variant="growth" disabled={busy || !form.name.trim()} onClick={() => void save()}>
            {busy ? t.common.loading : t.common.save}
          </Button>
        </>
      }
    >
      <Field>
        {t.edit.accountName}
        <Input value={form.name} maxLength={60} onChange={set('name')} required />
      </Field>
      <Field>
        {t.edit.nickname}
        <Input value={form.nickname} maxLength={40} onChange={set('nickname')} />
      </Field>
      <Field>
        {t.edit.bio}
        <TextArea value={form.bio} maxLength={300} onChange={set('bio')} />
      </Field>
      <Field>
        {t.edit.bioHe}
        <TextArea value={form.bioHe} maxLength={300} onChange={set('bioHe')} dir="rtl" />
      </Field>
      <Field>
        {t.edit.region}
        <Input value={form.region} maxLength={60} onChange={set('region')} />
      </Field>
      {failed ? <ErrorText role="alert">{t.edit.failed}</ErrorText> : null}
    </ModalDialog>
  )
}
