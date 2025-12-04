import * as process from 'process'
import * as fs from 'fs'
import {expect, test} from '@jest/globals'
import {run} from '../src/main'
import {clone, deleteIfExists} from '../src/build'

export const quick = false // change to true for quicker local testing

if (!quick) {
  test('checkout repo', async () => {
    const dir = 'gh-action-test-2'
    await deleteIfExists(dir)
    fs.mkdirSync(dir)
    fs.writeFileSync(`${dir}/conflict`, 'File that makes directory not empty\n')
    await expect(clone('master', dir)).rejects.toThrow(
      `fatal: destination path '${dir}' already exists and is not an empty directory.`
    )
  }, 600000)
}

// Run the action in the same process. (NOTE: also useful for debugging!)
test('expect compile failure', async () => {
  process.env['INPUT_CHECK_MODE'] = 'compile'
  process.env['INPUT_CHECKOUT_DIR'] = 'gh-action-test-0'
  process.env['INPUT_COMPILER_REF'] = 'master'
  process.env['INPUT_DELETE_IF_EXISTS'] = 'true'
  process.env['INPUT_SKIP_CLONE'] = String(quick)
  process.env['INPUT_EXCLUDE_DIRS'] = '[]'
  process.env['INPUT_SEARCH_DIR'] = '.'
  process.env['INPUT_NO_COMPILE_FLAG'] = 'false'
  const result = await run(true)
  expect(result).toBe('1 file(s) failed compile check')
}, 600000)

// Run the action in the same process. (NOTE: also useful for debugging!)
test('expect formatting failure', async () => {
  process.env['INPUT_CHECK_MODE'] = 'format'
  process.env['INPUT_CHECKOUT_DIR'] = 'gh-action-test-3'
  process.env['INPUT_COMPILER_REF'] = 'master'
  process.env['INPUT_DELETE_IF_EXISTS'] = 'true'
  process.env['INPUT_SKIP_CLONE'] = String(quick)
  process.env['INPUT_EXCLUDE_DIRS'] = '[]'
  process.env['INPUT_SEARCH_DIR'] = '.'
  process.env['INPUT_NO_COMPILE_FLAG'] = 'false'
  const result = await run(true)
  expect(result).toBe('1 file(s) failed format check')
}, 600000)
