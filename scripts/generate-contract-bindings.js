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
  Bytes: 'Uint8Array',
  Address: 'string',
}

function mapType(typeDef, localTypes) {
  if (!typeDef || !typeDef.type) return 'unknown'

  const raw = typeDef.type

  // Check if it's a native Soroban type
  if (TYPE_MAP[raw]) return TYPE_MAP[raw]

  // Check for generic types: Vec<T>, Option<T>, Map<K,V>
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
    return 'Uint8Array'
  }

  // Check if it's a local custom type
  if (localTypes && localTypes[raw]) {
    return raw
  }

  return 'unknown'
}

function generateTypeInterface(name, typeDef, localTypes) {
  if (typeDef.variants) {
    // Generate an enum/union type
    const variants = typeDef.variants.map(v => `  ${v}`).join(' |\n')
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
  lines.push(`import { Contract, rpc, xdr, Address } from '@stellar/stellar-sdk'`)
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
      lines.push(`export interface ${contractName}${eventName.charAt(0).toUpperCase() + eventName.slice(1)}EventData ${dataType}`)
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
  lines.push(`    const tx = await server.simulateTransaction(contract.call(method, ...args))`)
  lines.push(`    const result = rpc.assembleTransaction(contract.call(method, ...args), tx).toXDR()`)
  lines.push(`    const sendResponse = await server.sendTransaction(result)`)
  lines.push(`    const resultResponse = await server.getTransaction(sendResponse.hash)`)
  lines.push(`    if (resultResponse.status !== 'SUCCESS') {`)
  lines.push(`      throw new Error(\`Transaction failed: \${resultResponse.status}\`)`)
  lines.push(`    }`)
  lines.push(`    const returnValue = contract.call(method, ...args).result?.val`)
  lines.push(`    return rpc.scValToNative(returnValue as xdr.ScVal) as T`)
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
        if (def.type === 'Address') return `new Address(${name}).toScVal()`
        if (def.type === 'I128') return `xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: xdr.Int64.fromString(String(BigInt(${name}) >> 64n)), lo: xdr.Int64.fromString(String(BigInt(${name}) & 0xFFFFFFFFFFFFFFFFn)) }))`
        if (def.type === 'U32') return `xdr.ScVal.scvU32(${name})`
        if (def.type === 'U64') return `xdr.ScVal.scvU64(xdr.Int64.fromString(String(${name})))`
        if (def.type === 'Bool') return `xdr.ScVal.scvBool(${name})`
        if (def.type === 'String') return `xdr.ScVal.scvString(${name})`
        if (def.type === 'BytesN<32>') return `xdr.ScVal.scvBytes(Uint8Array.from(${name}))`
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

function main() {
  const specFiles = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.json'))

  if (specFiles.length === 0) {
    console.log('No spec files found in', SPECS_DIR)
    process.exit(1)
  }

  // Ensure output directory exists
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
    const contractName = spec.contract.charAt(0).toUpperCase() + spec.contract.slice(1)

    const output = generateBindings(spec)
    const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)
    fs.writeFileSync(outputPath, output, 'utf-8')
    console.log(`Generated: ${outputPath}`)

    indexLines.push(`export * from './${spec.contract}'`)
  }

  // Generate barrel export
  const indexPath = path.join(OUTPUT_DIR, 'index.ts')
  fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf-8')
  console.log(`Generated: ${indexPath}`)
  console.log(`\nSuccessfully generated bindings for ${specFiles.length} contract(s)`)
}

main()
