#!/usr/bin/env node
// Aviso (não bloqueante) de conteúdo mockado ainda presente em copy.ts antes
// de um build de produção — não impede o build (os placeholders são uma
// escolha deliberada até os dados reais chegarem), só evita que alguém
// publique sem perceber que ainda estão lá.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const COPY_PATH = fileURLToPath(new URL('../src/lib/copy.ts', import.meta.url))
const content = readFileSync(COPY_PATH, 'utf-8')

const CHECKS = [
  { marker: '5500000000000', label: 'Número de WhatsApp (footer.contact.whatsapp)' },
  { marker: 'instagram.com/nucleodigital', label: 'Handle de Instagram (footer.contact.instagram)' },
  { marker: 'RAZÃO SOCIAL A PREENCHER', label: 'Razão social/CNPJ (privacyPolicy.controllerNotice)' },
]

const pending = CHECKS.filter((check) => content.includes(check.marker))

if (pending.length > 0) {
  console.warn('\n⚠️  Placeholders ainda presentes em src/lib/copy.ts:')
  for (const check of pending) {
    console.warn(`   - ${check.label}`)
  }
  console.warn('   O build segue normalmente — isto é só um lembrete.\n')
}
