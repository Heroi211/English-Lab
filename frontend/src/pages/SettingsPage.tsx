import { useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAppStore } from '../stores/appStore'

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const exportAll = useAppStore((s) => s.exportAll)
  const importAll = useAppStore((s) => s.importAll)
  const resetLearning = useAppStore((s) => s.resetLearning)
  const [name, setName] = useState(settings.learnerName)
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <header className="mb-10">
        <p className="font-mono text-xs text-teal-400">SETTINGS</p>
        <h1 className="mt-3 text-3xl font-semibold">Preferences & data</h1>
        <p className="mt-2 text-zinc-500">Local-first: progress stays in this browser unless you export a backup.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-mono text-xs text-zinc-600">LEARNER NAME</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-mono text-xs text-zinc-600">BACKEND URL</span>
            <Input value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} placeholder="empty = /api via Nginx" />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-mono text-xs text-zinc-600">STUDY MODE</span>
            <select
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              value={settings.studyMode}
              onChange={(e) => setSettings({ studyMode: e.target.value as 'quick' | 'standard' | 'deep' })}
            >
              <option value="quick">Quick</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>
          </label>
          <Button
            onClick={() => {
              setSettings({ learnerName: name, backendUrl })
              setMsg('Settings saved.')
            }}
          >
            Save settings
          </Button>
          <p className="text-sm text-zinc-500">{msg}</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold">Backup</h2>
          <Button
            variant="secondary"
            onClick={() => {
              const blob = new Blob([exportAll()], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `english-journey-backup-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Export progress JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const text = await file.text()
              importAll(text)
              setMsg('Import complete.')
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import progress JSON
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('Reset all learning progress?')) {
                resetLearning()
                setMsg('Progress reset.')
              }
            }}
          >
            Reset learning data
          </Button>
        </Card>
      </div>
    </div>
  )
}
