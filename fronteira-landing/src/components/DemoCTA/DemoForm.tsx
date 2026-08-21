import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { demoForm } from '../../lib/copy'
import type { VolumeOption } from '../../lib/copy'
import {
  FieldValidationError,
  RateLimitError,
  collectMetadata,
  submitDemoRequest,
} from '../../lib/demo'
import type { DemoRequestPayload } from '../../lib/demo'
import { fadeUp } from '../../lib/motion'
import { FormField } from './FormField'
import { ProtocolConfirmation } from './ProtocolConfirmation'
import { SubmitButton } from './SubmitButton'
import type { SubmitState } from './SubmitButton'
import { VolumePills } from './VolumePills'
import styles from './DemoForm.module.css'

type TextField = 'name' | 'office' | 'email'
type Field = TextField | 'volume' | 'consent'

type Values = {
  name: string
  office: string
  email: string
  volume: VolumeOption['value'] | ''
}

const EMPTY_VALUES: Values = { name: '', office: '', email: '', volume: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function fieldError(field: Field, values: Values, consent: boolean): string | undefined {
  switch (field) {
    case 'name':
      return values.name.trim() ? undefined : demoForm.errors.name
    case 'office':
      return values.office.trim() ? undefined : demoForm.errors.office
    case 'email':
      return EMAIL_RE.test(values.email.trim()) ? undefined : demoForm.errors.email
    case 'volume':
      return values.volume ? undefined : demoForm.errors.volume
    case 'consent':
      return consent ? undefined : demoForm.errors.consent
  }
}

export function DemoForm() {
  const reduced = useReducedMotion() ?? false

  const [values, setValues] = useState<Values>(EMPTY_VALUES)
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [shakeTokens, setShakeTokens] = useState<Record<Field, number>>({
    name: 0,
    office: 0,
    email: 0,
    volume: 0,
    consent: 0,
  })
  const [serverErrors, setServerErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitError, setSubmitError] = useState<string | undefined>()
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [protocolResult, setProtocolResult] = useState<{
    protocol: string
    office: string
    email: string
    volumeLabel: string
  } | null>(null)

  const confirmationRef = useRef<HTMLDivElement>(null)
  const renderedAtRef = useRef(Date.now())
  const metadataRef = useRef(collectMetadata())
  const hpRef = useRef('')

  const shown = (field: Field): string | undefined => {
    if (serverErrors[field]) return serverErrors[field]
    if (touched[field] || submitAttempted) return fieldError(field, values, consent)
    return undefined
  }

  const bumpShake = (field: Field) =>
    setShakeTokens((prev) => ({ ...prev, [field]: prev[field] + 1 }))

  const update = (field: TextField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setServerErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError(undefined)
  }

  const handleBlur = (field: Field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (fieldError(field, values, consent)) bumpShake(field)
  }

  const handleVolumeChange = (value: VolumeOption['value']) => {
    setValues((prev) => ({ ...prev, volume: value }))
    setTouched((prev) => ({ ...prev, volume: true }))
    setServerErrors((prev) => ({ ...prev, volume: undefined }))
  }

  const handleConsentChange = (checked: boolean) => {
    setConsent(checked)
    setTouched((prev) => ({ ...prev, consent: true }))
    setServerErrors((prev) => ({ ...prev, consent: undefined }))
  }

  const resetForm = () => {
    setValues(EMPTY_VALUES)
    setConsent(false)
    setTouched({})
    setSubmitAttempted(false)
    setServerErrors({})
    setSubmitError(undefined)
    setSubmitState('idle')
    setProtocolResult(null)
    renderedAtRef.current = Date.now()
    metadataRef.current = collectMetadata()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitAttempted(true)

    const fields: Field[] = ['name', 'office', 'email', 'volume', 'consent']
    const errors = fields.map((field) => [field, fieldError(field, values, consent)] as const)
    const invalidFields = errors.filter(([, message]) => Boolean(message))

    if (invalidFields.length > 0) {
      invalidFields.forEach(([field]) => bumpShake(field))
      return
    }

    setSubmitState('loading')
    setSubmitError(undefined)

    const volumeLabel =
      demoForm.volumeOptions.find((option) => option.value === values.volume)?.label ?? ''

    const payload: DemoRequestPayload = {
      name: values.name.trim(),
      office: values.office.trim(),
      email: values.email.trim().toLowerCase(),
      volume: values.volume as VolumeOption['value'],
      consent,
      hp: hpRef.current,
      renderedAt: renderedAtRef.current,
      ...metadataRef.current,
    }

    try {
      const result = await submitDemoRequest(payload)
      setSubmitState('success')
      setProtocolResult({
        protocol: result.protocol,
        office: payload.office,
        email: payload.email,
        volumeLabel,
      })

      const revealDelay = reduced ? 0 : 650
      window.setTimeout(() => {
        window.requestAnimationFrame(() => confirmationRef.current?.focus())
      }, revealDelay)
    } catch (err) {
      setSubmitState('idle')
      if (err instanceof FieldValidationError) {
        setServerErrors(err.fields as Partial<Record<Field, string>>)
      } else if (err instanceof RateLimitError) {
        setSubmitError(demoForm.errors.rateLimit)
      } else {
        setSubmitError(demoForm.errors.submit)
      }
    }
  }

  if (protocolResult && submitState === 'success') {
    return (
      <ProtocolConfirmation
        protocol={protocolResult.protocol}
        office={protocolResult.office}
        email={protocolResult.email}
        volumeLabel={protocolResult.volumeLabel}
        confirmationRef={confirmationRef}
        onReset={resetForm}
      />
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Honeypot (§A.6/B.3) — invisível para humanos, tentador para bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="demo-company">Não preencha este campo</label>
        <input
          id="demo-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          onChange={(event) => {
            hpRef.current = event.target.value
          }}
        />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{demoForm.legend}</legend>

        <FormField
          id="demo-name"
          label={demoForm.fields.name.label}
          placeholder={demoForm.fields.name.placeholder}
          value={values.name}
          error={shown('name')}
          valid={touched.name && !fieldError('name', values, consent)}
          shakeToken={shakeTokens.name}
          autoComplete="name"
          onChange={(v) => update('name', v)}
          onBlur={() => handleBlur('name')}
        />
        <FormField
          id="demo-office"
          label={demoForm.fields.office.label}
          placeholder={demoForm.fields.office.placeholder}
          value={values.office}
          error={shown('office')}
          valid={touched.office && !fieldError('office', values, consent)}
          shakeToken={shakeTokens.office}
          autoComplete="organization"
          onChange={(v) => update('office', v)}
          onBlur={() => handleBlur('office')}
        />
        <FormField
          id="demo-email"
          type="email"
          label={demoForm.fields.email.label}
          placeholder={demoForm.fields.email.placeholder}
          value={values.email}
          error={shown('email')}
          valid={touched.email && !fieldError('email', values, consent)}
          shakeToken={shakeTokens.email}
          autoComplete="email"
          onChange={(v) => update('email', v)}
          onBlur={() => handleBlur('email')}
        />

        <VolumePills
          id="demo-volume"
          label={demoForm.fields.volume.label}
          options={demoForm.volumeOptions}
          value={values.volume}
          error={shown('volume')}
          onChange={handleVolumeChange}
        />

        <AnimatePresence mode="wait">
          {values.volume ? (
            <m.p
              key={values.volume}
              className={styles.echo}
              variants={fadeUp(reduced)}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {demoForm.echo[values.volume]}
            </m.p>
          ) : null}
        </AnimatePresence>
      </fieldset>

      <div className={styles.consentField}>
        <input
          className={styles.consentInput}
          id="demo-consent"
          type="checkbox"
          checked={consent}
          aria-invalid={Boolean(shown('consent'))}
          aria-describedby={shown('consent') ? 'demo-consent-error' : undefined}
          onChange={(event) => handleConsentChange(event.target.checked)}
          onBlur={() => handleBlur('consent')}
        />
        <label className={styles.consentLabel} htmlFor="demo-consent">
          {demoForm.consent.label}{' '}
          <a className={styles.consentLink} href={demoForm.consent.href}>
            {demoForm.consent.linkLabel}
          </a>{' '}
          {demoForm.consent.suffix}
        </label>
      </div>
      {shown('consent') ? (
        <p className={styles.error} id="demo-consent-error" role="alert">
          {shown('consent')}
        </p>
      ) : null}

      {submitError ? (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      ) : null}

      <div className={styles.submitRow}>
        <SubmitButton
          state={submitState}
          idleLabel={demoForm.submit}
          loadingLabel={demoForm.submitting}
        />
      </div>
    </form>
  )
}
