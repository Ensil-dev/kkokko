import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MessageCirclePlus, Sparkles, X } from 'lucide-react'
import { track } from '@edgeplus/sdk'
import { FEATURE_REQUEST } from '@/constants'
import { submitFeatureRequest } from '@/services/featureRequestService'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const F = FEATURE_REQUEST.FIELDS
const CUSTOM_SENTINEL = '__custom__'

export function FeatureRequestFAB() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // 외부 클릭으로 드롭다운 닫기
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const openModal = () => {
    setMenuOpen(false)
    setModalOpen(true)
  }

  return (
    <>
      <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {menuOpen && (
          <div className="bg-card border rounded-xl shadow-xl py-2 min-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              type="button"
              onClick={openModal}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-accent transition-colors"
            >
              <Sparkles className="size-4 text-primary" />
              {FEATURE_REQUEST.MENU_ITEM}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={FEATURE_REQUEST.FAB_LABEL}
          aria-expanded={menuOpen}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center"
        >
          {menuOpen ? <X className="size-6" /> : <MessageCirclePlus className="size-6" />}
        </button>
      </div>

      {modalOpen && <FeatureRequestModal onClose={() => setModalOpen(false)} />}
    </>
  )
}

interface ModalProps {
  onClose: () => void
}

function FeatureRequestModal({ onClose }: ModalProps) {
  const [name, setName] = useState<string>(F.NAME.OPTIONS[0])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const canSubmit =
    name.trim().length > 0 &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    status !== 'submitting'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('submitting')
    setErrorMsg(null)
    const result = await submitFeatureRequest({
      name: name.trim(),
      title: title.trim(),
      description: description.trim(),
      reason: reason.trim(),
    })
    if (result.success) {
      const titlePreset = (F.TITLE.OPTIONS as readonly string[]).includes(title.trim())
      track('feature_request_sent', { titlePreset })
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg(result.error ?? null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card border-b px-5 py-4 flex items-start justify-between gap-2 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold leading-tight">{FEATURE_REQUEST.MODAL_TITLE}</h2>
            <p className="text-sm text-muted-foreground mt-1">{FEATURE_REQUEST.MODAL_SUBTITLE}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 -mt-1 p-2 hover:bg-accent rounded-full"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
        {status === 'success' ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <h3 className="text-lg font-bold">{FEATURE_REQUEST.SUCCESS_TITLE}</h3>
            <p className="text-sm text-muted-foreground">{FEATURE_REQUEST.SUCCESS_MESSAGE}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-6">
            <OptionPickerField
              label={F.NAME.LABEL}
              value={name}
              onChange={setName}
              options={F.NAME.OPTIONS}
              placeholder={F.NAME.PLACEHOLDER}
              maxLength={F.NAME.MAX}
              required
            />
            <OptionPickerField
              label={F.TITLE.LABEL}
              value={title}
              onChange={setTitle}
              options={F.TITLE.OPTIONS}
              placeholder={F.TITLE.PLACEHOLDER}
              maxLength={F.TITLE.MAX}
              multiline
              rows={3}
              required
            />
            <OptionPickerField
              label={F.DESCRIPTION.LABEL}
              value={description}
              onChange={setDescription}
              options={F.DESCRIPTION.OPTIONS}
              placeholder={F.DESCRIPTION.PLACEHOLDER}
              maxLength={F.DESCRIPTION.MAX}
              multiline
              rows={4}
              required
            />
            <OptionPickerField
              label={F.REASON.LABEL}
              value={reason}
              onChange={setReason}
              options={F.REASON.OPTIONS}
              placeholder={F.REASON.PLACEHOLDER}
              maxLength={F.REASON.MAX}
              multiline
              rows={3}
            />

            {status === 'error' && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">
                <div className="font-semibold">{FEATURE_REQUEST.ERROR_TITLE}</div>
                <div>{errorMsg || FEATURE_REQUEST.ERROR_MESSAGE}</div>
              </div>
            )}

            <Button type="submit" disabled={!canSubmit} className="w-full h-12 text-base">
              {status === 'submitting'
                ? FEATURE_REQUEST.SUBMITTING_LABEL
                : FEATURE_REQUEST.SUBMIT_LABEL}
            </Button>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}

interface OptionPickerFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder: string
  maxLength: number
  multiline?: boolean
  rows?: number
  required?: boolean
}

function OptionPickerField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxLength,
  multiline = false,
  rows = 3,
  required,
}: OptionPickerFieldProps) {
  // mode: 'option' = 드롭다운에서 미리 정의된 옵션 선택, 'custom' = 직접 입력
  const [mode, setMode] = useState<'option' | 'custom'>(
    value !== '' && !options.includes(value) ? 'custom' : 'option',
  )

  const selectValue = mode === 'custom' ? CUSTOM_SENTINEL : value

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    if (v === CUSTOM_SENTINEL) {
      setMode('custom')
      onChange('')
    } else {
      setMode('option')
      onChange(v)
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-semibold">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </span>
        {mode === 'custom' && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <select
          value={selectValue}
          onChange={handleSelectChange}
          required={required}
          className="w-full h-11 pl-3 pr-10 rounded-lg border border-input bg-background text-base appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>
            {FEATURE_REQUEST.SELECT_PLACEHOLDER}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value={CUSTOM_SENTINEL}>{FEATURE_REQUEST.CUSTOM_OPTION_LABEL}</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>

      {mode === 'custom' && (
        <div className="mt-2">
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={rows}
              required={required}
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              required={required}
              autoFocus
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </div>
      )}
    </div>
  )
}
