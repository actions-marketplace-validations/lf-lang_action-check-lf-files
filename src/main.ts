import * as core from '@actions/core'
import {configurePath, deleteIfExists, clone, gradleStop, build} from './build'
import {skipDirs, checkCompile, checkFormat} from './check'

// eslint-disable-next-line no-shadow
enum Mode {
  Compile = 'compile',
  Format = 'format'
}

export async function run(softError = false): Promise<string> {
  let result = 'Success'
  const mode =
    core.getInput('check_mode') === Mode.Format ? Mode.Format : Mode.Compile
  const dir = core.getInput('checkout_dir')
  const excludes: string[] = JSON.parse(core.getInput('exclude_dirs'))
  const ref = core.getInput('compiler_ref')
  const del = core.getInput('delete_if_exists') === 'true'
  const noCompile = core.getInput('no_compile_flag') === 'true'
  const skip = core.getInput('skip_clone') === 'true'
  const searchDir = core.getInput('search_dir')
  try {
    if (skip) {
      core.info(
        `Using existing clone of the Lingua Franca repository in directory '${dir}'.`
      )
    } else {
      if (del) {
        await deleteIfExists(dir)
      }
      core.info(
        `Cloning the Lingua Franca repository (${ref}) into directory '${dir}'...`
      )
      await clone(ref, dir)
    }

    core.info(`Building using Gradle...`)
    await build(dir)

    configurePath(dir)

    core.info('Checking all Lingua Franca files:')
    skipDirs.push(dir)
    for (const exclude of excludes) {
      skipDirs.push(exclude)
    }
    let fails = 0
    switch (mode) {
      case Mode.Compile:
        fails = await checkCompile(searchDir, noCompile)
        break
      case Mode.Format:
        fails = await checkFormat(searchDir)
        break
    }

    if (fails > 0) {
      result = `${fails} file(s) failed ${mode} check`
      if (!softError) {
        core.setFailed(result)
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  } finally {
    core.info('Stopping Gradle daemons...')
    await gradleStop(dir)
  }
  return result
}

// Only execute run() if not in a test environment,
// unless the environment variable GH_ACTIONS was set
// explicitly to signal that we _do_ want to invoke run.
if (process.env['NODE_ENV'] !== 'test' || process.env['MAIN_DO_RUN'] === 'true')
  run()
if (process.env['NODE_ENV'] === 'test')
  skipDirs.push(
    'gh-action-test-0',
    'gh-action-test-1',
    'gh-action-test-2',
    'gh-action-test-3'
  )
