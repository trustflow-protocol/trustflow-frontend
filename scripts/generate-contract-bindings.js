#!/usr/bin/env node
/**
 * Soroban Contract Bindings Codegen
 *
 * Reads Soroban contract spec JSON files and generates fully typed
 * TypeScript client bindings for compile-time checked contract calls.
 *
 * Usage: node scripts/generate-contract-bindings.js
 *        npm run codegen
 */
const fs = require('fs')
const path = require('path')

const SPECS_DIR = path.resolve(__dirname, '../shared/contracts-raw')
const OUTPUT_DIR = path.resolve(__dirname, '../shared/contracts-gen')

// Soroban native types to TypeScript mappings
const TYPE_MAP = {
  Void: 'void',
  Bool: 'boolean',
  U32: 'number',
  U64: 'bigint',
  I32: 'number',
  I128: 'bigint',
  String: 'string',
  Bytes: 'Buffer',
  Address: 'string',
}

function mapType(typeDef, localTypes) {
  if (!typeDef || !typeDef.type) return 'unknown'

  const raw = typeDef.type

  if (TYPE_MAP[raw]) return TYPE_MAP[raw]

  const vecMatch = raw.match(/^Vec<(.+)>$/)
  if (vecMatch) {
    return `${mapType({ type: vecMatch[1] }, localTypes)}[]`
  }

  const optionMatch = raw.match(/^Option<(.+)>$/)
  if (optionMatch) {
    return `${mapType({ type: optionMatch[1] }, localTypes)} | null`
  }

  const bytesNMatch = raw.match(/^BytesN<(\d+)>$/)
  if (bytesNMatch) {
    return 'Buffer'
  }

  if (localTypes && localTypes[raw]) {
    return raw
  }

  return 'unknown'
}

function generateTypeInterface(name, typeDef, localTypes) {
  if (typeDef.variants) {
    const variants = typeDef.variants.map(v => `  '${v}'`).join(' |\n')
    return `export type ${name} =\n${variants}\n`
  }

  if (typeDef.fields) {
    const fields = Object.entries(typeDef.fields)
      .map(([field, def]) => `  ${field}: ${mapType(def, localTypes)}`)
      .join('\n')
    return `export interface ${name} {\n${fields}\n}\n`
  }

  return ''
}

function generateMethodArgs(args, localTypes) {
  if (!args || Object.keys(args).length === 0) return ''
  return Object.entries(args)
    .map(([name, def]) => `${name}: ${mapType(def, localTypes)}`)
    .join(', ')
}

function generateMethod(name, methodDef, localTypes) {
  const args = generateMethodArgs(methodDef.args, localTypes)
  const resultType = methodDef.result ? mapType(methodDef.result, localTypes) : 'void'
  const jsDoc = methodDef.description ? `  /** ${methodDef.description} */\n` : ''

  return `${jsDoc}  ${name}(${args}): Promise<${resultType}>`
}

function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function generateEventDataType(name, dataDef, localTypes) {
  if (!dataDef || Object.keys(dataDef).length === 0) return 'void'
  const fields = Object.entries(dataDef)
    .map(([field, def]) => `  ${field}: ${mapType(def, localTypes)}`)
    .join('\n')
  return `{\n${fields}\n}`
}

function generateBindings(spec) {
  const lines = []
  const contractName = spec.contract.charAt(0).toUpperCase() + spec.contract.slice(1)

  lines.push(`/**`)
  lines.push(` * Auto-generated ${contractName} contract bindings`)
  lines.push(` * Generated from Soroban contract spec — do not edit manually`)
  lines.push(` */`)
  lines.push(`import { Contract, rpc, xdr, TransactionBuilder, Networks } from '@stellar/stellar-sdk'`)
  lines.push(`import { getSorobanServer } from '../soroban-rpc'`)
  lines.push(`import { ${spec.contract.toUpperCase()}_CONTRACT_ID } from '../contracts'`)
  lines.push(``)

  // Generate type definitions
  lines.push(`// ── Types ──────────────────────────────────────────────────────`)
  lines.push(``)
  for (const [typeName, typeDef] of Object.entries(spec.types || {})) {
    lines.push(generateTypeInterface(typeName, typeDef, spec.types))
  }

  // Generate event data types
  if (spec.events) {
    lines.push(`// ── Event Data Types ───────────────────────────────────────────`)
    lines.push(``)
    for (const [eventName, eventDef] of Object.entries(spec.events)) {
      const dataType = generateEventDataType(eventName, eventDef.data, spec.types)
      const eventTypeName = `${contractName}${toPascalCase(eventName)}EventData`
      lines.push(`export interface ${eventTypeName} ${dataType}`)
      lines.push(``)
    }
  }

  // Generate contract client interface
  lines.push(`// ── Contract Interface ──────────────────────────────────────────`)
  lines.push(``)
  lines.push(`export interface I${contractName}Contract {`)
  for (const [methodName, methodDef] of Object.entries(spec.methods)) {
    lines.push(generateMethod(methodName, methodDef, spec.types))
  }
  lines.push(`}`)

  // Generate contract client implementation
  lines.push(``)
  lines.push(`// ── Contract Client ─────────────────────────────────────────────`)
  lines.push(``)
  lines.push(`export function create${contractName}Contract(): I${contractName}Contract {`)
  lines.push(`  const server = getSorobanServer()`)
  lines.push(`  const contractId = ${spec.contract.toUpperCase()}_CONTRACT_ID`)
  lines.push(`  const contract = new Contract(contractId)`)
  lines.push(``)
  lines.push(`  async function invoke<T>(method: string, ...args: xdr.ScVal[]): Promise<T> {`)
  lines.push(`    const sourceAccount = await server.getAccount(contractId)`)
  lines.push(`    const builtTx = new TransactionBuilder(sourceAccount, {`)
  lines.push(`      fee: '100',`)
  lines.push(`      networkPassphrase: Networks.TESTNET,`)
  lines.push(`    })`)
  lines.push(`      .addOperation(contract.call(method, ...args))`)
  lines.push(`      .setTimeout(30)`)
  lines.push(`      .build()`)
  lines.push(`    const simulation = await server.simulateTransaction(builtTx)`)
  lines.push(`    const assembledTx = rpc.assembleTransaction(builtTx, simulation)`)
  lines.push(`    const sendResponse = await server.sendTransaction(assembledTx.build())`)
  lines.push(`    const resultResponse = await server.getTransaction(sendResponse.hash)`)
  lines.push(`    if (resultResponse.status !== 'SUCCESS') {`)
  lines.push(`      throw new Error(\`Transaction failed: \${resultResponse.status}\`)`)
  lines.push(`    }`)
  lines.push(`    const retval = (resultResponse as any).result?.retval`)
  lines.push(`    if (!retval) return undefined as T`)
  lines.push(`    return retval as T`)
  lines.push(`  }`)
  lines.push(``)
  lines.push(`  return {`)

  // Generate method implementations
  for (const [methodName, methodDef] of Object.entries(spec.methods)) {
    const args = Object.entries(methodDef.args || {})
      .map(([name, def]) => {
        const tsType = mapType(def, spec.types)
        return `${name}: ${tsType}`
      })
      .join(', ')

    const scVals = Object.entries(methodDef.args || {})
      .map(([name, def]) => {
        if (def.type === 'Address') return `xdr.ScVal.scvString(${name})`
        if (def.type === 'I128') return `xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: xdr.Int64.fromString(String(BigInt(${name}) >> 64n)), lo: xdr.Int64.fromString(String(BigInt(${name}) & 0xFFFFFFFFFFFFFFFFn)) }))`
        if (def.type === 'U32') return `xdr.ScVal.scvU32(${name})`
        if (def.type === 'U64') return `xdr.ScVal.scvU64(xdr.Int64.fromString(String(${name})))`
        if (def.type === 'Bool') return `xdr.ScVal.scvBool(${name})`
        if (def.type === 'String') return `xdr.ScVal.scvString(${name})`
        if (def.type === 'BytesN<32>') return `xdr.ScVal.scvBytes(${name})`
        return `xdr.ScVal.scvBytes(${name})`
      })
      .join(', ')

    const resultType = methodDef.result ? mapType(methodDef.result, spec.types) : 'void'

    lines.push(`    ${methodName}: (${args}): Promise<${resultType}> => {`)
    lines.push(`      return invoke<${resultType}>(`)
    lines.push(`        '${methodName}',`)
    lines.push(`        ${scVals || '// no args'}`)
    lines.push(`      )`)
    lines.push(`    },`)
    lines.push(``)
  }

  lines.push(`  }`)
  lines.push(`}`)
  lines.push(``)

  return lines.join('\n')
}

function validateSpec(specPath) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
  const errors = []

  if (!spec.contract || typeof spec.contract !== 'string') {
    errors.push('Missing or invalid "contract" field (must be a string)')
  }

  if (!spec.methods || typeof spec.methods !== 'object') {
    errors.push('Missing or invalid "methods" field (must be an object)')
  } else {
    for (const [methodName, methodDef] of Object.entries(spec.methods)) {
      if (!methodDef.args || typeof methodDef.args !== 'object') {
        errors.push(`Method "${methodName}": missing or invalid "args" field`)
      }
      if (methodDef.result && typeof methodDef.result !== 'object') {
        errors.push(`Method "${methodName}": invalid "result" field`)
      }
    }
  }

  if (spec.types && typeof spec.types !== 'object') {
    errors.push('Invalid "types" field (must be an object)')
  }

  if (spec.events && typeof spec.events !== 'object') {
    errors.push('Invalid "events" field (must be an object)')
  }

  return errors
}

function generateBindingsForValidation(spec) {
  const output = generateBindings(spec)
  const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)

  if (!fs.existsSync(outputPath)) {
    return { changed: true, reason: 'file does not exist' }
  }

  const existing = fs.readFileSync(outputPath, 'utf-8')
  if (existing !== output) {
    return { changed: true, reason: 'bindings are out of date' }
  }

  return { changed: false }
}

function main() {
  const args = process.argv.slice(2)
  const isValidate = args.includes('--validate')

  const specFiles = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.json'))

  if (specFiles.length === 0) {
    console.log('No spec files found in', SPECS_DIR)
    process.exit(1)
  }

  // Validate spec files first
  let hasValidationErrors = false
  for (const specFile of specFiles) {
    const specPath = path.join(SPECS_DIR, specFile)
    const errors = validateSpec(specPath)
    if (errors.length > 0) {
      console.error(`Validation errors in ${specFile}:`)
      errors.forEach(err => console.error(`  - ${err}`))
      hasValidationErrors = true
    }
  }
  if (hasValidationErrors) {
    process.exit(1)
  }

  if (isValidate) {
    // Validation mode: check if generated bindings are up-to-date
    let outOfDate = false
    for (const specFile of specFiles) {
      const specPath = path.join(SPECS_DIR, specFile)
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
      const result = generateBindingsForValidation(spec)
      if (result.changed) {
        console.error(`Bindings for "${spec.contract}" are out of date: ${result.reason}`)
        outOfDate = true
      }
    }

    if (outOfDate) {
      console.error('\nRun "npm run codegen" to regenerate bindings.')
      process.exit(1)
    }

    console.log(`All ${specFiles.length} contract binding(s) are up-to-date.`)
    return
  }

  // Generation mode
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const indexLines = []
  indexLines.push(`/**`)
  indexLines.push(` * Auto-generated contract bindings barrel export`)
  indexLines.push(` * Generated from Soroban contract specs — do not edit manually`)
  indexLines.push(` */`)
  indexLines.push(``)

  for (const specFile of specFiles) {
    const specPath = path.join(SPECS_DIR, specFile)
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))

    const output = generateBindings(spec)
    const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)
    fs.writeFileSync(outputPath, output, 'utf-8')
    console.log(`Generated: ${outputPath}`)

    indexLines.push(`export * from './${spec.contract}'`)
  }

  const indexPath = path.join(OUTPUT_DIR, 'index.ts')
  fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf-8')
  console.log(`Generated: ${indexPath}`)
  console.log(`\nSuccessfully generated bindings for ${specFiles.length} contract(s)`)
}

main()
