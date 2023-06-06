import * as process from 'process'
import {expect, test} from '@jest/globals'
import {run} from '../src/main'
import {clone, deleteIfExists} from '../src/build'

export const quick = false // change to true for quicker local testing

if (!quick) {
  test('checkout repo', async () => {
    await deleteIfExists('gh-action-test-2')
    await expect(clone('master', 'gh-action-test-2'))
    await expect(clone('master', 'gh-action-test-2')).rejects.toThrow(
      "fatal: destination path 'gh-action-test-2' already exists and is not an empty directory."
    )
  })
}

// Run the action in the same process. (NOTE: also useful for debugging!)
test('expect failure', async () => {
    process.env['INPUT_CHECKOUT_DIR'] = 'gh-action-test-0'
    process.env['INPUT_COMPILER_REF'] = 'master'
    process.env['INPUT_DELETE_IF_EXISTS'] = 'true'
    process.env['INPUT_SKIP_CLONE'] = String(quick)
    process.env['INPUT_EXCLUDE_DIRS'] = '[]'
    process.env['INPUT_SEARCH_DIR'] = '.'
    process.env['INPUT_NO_COMPILE_FLAG'] = 'false'
    const result = await run(true)
    expect(result).toBe('One or more tests failed to compile')
  }, 600000)
  