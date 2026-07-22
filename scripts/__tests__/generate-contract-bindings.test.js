const fs = require('fs')
const path = require('path')

const SPECS_DIR = path.resolve(__dirname, '../../shared/contracts-raw')
const OUTPUT_DIR = path.resolve(__dirname, '../../shared/contracts-gen')

describe('Contract Bindings Codegen', () => {
  const specFiles = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.json'))

  it('should have spec files', () => {
    expect(specFiles.length).toBeGreaterThan(0)
  })

  specFiles.forEach(specFile => {
    describe(specFile, () => {
      let spec

      beforeAll(() => {
        const specPath = path.join(SPECS_DIR, specFile)
        spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
      })

      it('should have a valid contract name', () => {
        expect(typeof spec.contract).toBe('string')
        expect(spec.contract.length).toBeGreaterThan(0)
      })

      it('should have methods', () => {
        expect(spec.methods).toBeDefined()
        expect(typeof spec.methods).toBe('object')
        expect(Object.keys(spec.methods).length).toBeGreaterThan(0)
      })

      it('should have valid method args', () => {
        for (const [methodName, methodDef] of Object.entries(spec.methods)) {
          expect(methodDef.args).toBeDefined()
          expect(typeof methodDef.args).toBe('object')
        }
      })

      it('should have valid types if defined', () => {
        if (spec.types) {
          expect(typeof spec.types).toBe('object')
          for (const [typeName, typeDef] of Object.entries(spec.types)) {
            expect(typeDef).toBeDefined()
          }
        }
      })

      it('should have generated bindings', () => {
        const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)
        expect(fs.existsSync(outputPath)).toBe(true)
      })
    })
  })

  describe('Generated bindings', () => {
    it('should have an index.ts barrel export', () => {
      const indexPath = path.join(OUTPUT_DIR, 'index.ts')
      expect(fs.existsSync(indexPath)).toBe(true)

      const indexContent = fs.readFileSync(indexPath, 'utf-8')
      specFiles.forEach(specFile => {
        const specPath = path.join(SPECS_DIR, specFile)
        const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
        expect(indexContent).toContain(`export * from './${spec.contract}'`)
      })
    })

    specFiles.forEach(specFile => {
      const spec = JSON.parse(
        fs.readFileSync(path.join(SPECS_DIR, specFile), 'utf-8')
      )

      it(`${spec.contract}.ts should export a create function`, () => {
        const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)
        const content = fs.readFileSync(outputPath, 'utf-8')
        const contractName = spec.contract.charAt(0).toUpperCase() + spec.contract.slice(1)
        expect(content).toContain(`export function create${contractName}Contract()`)
      })

      it(`${spec.contract}.ts should export types for each method`, () => {
        const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)
        const content = fs.readFileSync(outputPath, 'utf-8')
        for (const [methodName] of Object.entries(spec.methods)) {
          expect(content).toContain(methodName)
        }
      })

      it(`${spec.contract}.ts should have correct TypeScript types`, () => {
        const outputPath = path.join(OUTPUT_DIR, `${spec.contract}.ts`)
        const content = fs.readFileSync(outputPath, 'utf-8')

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

        for (const [methodName, methodDef] of Object.entries(spec.methods)) {
          for (const [argName, argDef] of Object.entries(methodDef.args)) {
            const expectedType = TYPE_MAP[argDef.type]
            if (expectedType && expectedType !== 'void') {
              expect(content).toContain(`${argName}: ${expectedType}`)
            }
          }

          if (methodDef.result && methodDef.result.type !== 'Void') {
            const expectedType = TYPE_MAP[methodDef.result.type]
            if (expectedType) {
              expect(content).toContain(`Promise<${expectedType}>`)
            }
          }
        }
      })
    })
  })
})
