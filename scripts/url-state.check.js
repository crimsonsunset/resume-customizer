import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const PRESET_LABEL = 'div[role="button"] span.truncate'
const RESUME = '.resume-content'

const failures = []

/**
 * Runs one named check and records a failure instead of throwing
 * @param {string} name - Check name
 * @param {() => Promise<void>} run - Check body, throws on failure
 */
const check = async (name, run) => {
  try {
    await run()
    console.log(`PASS ${name}`)
  } catch (error) {
    failures.push(name)
    console.log(`FAIL ${name}: ${error.message.split('\n')[0]}`)
  }
}

/**
 * Throws when the condition is false
 * @param {boolean} condition - Condition that must hold
 * @param {string} message - Failure message
 */
const expect = (condition, message) => {
  if (!condition) throw new Error(message)
}

/**
 * Loads a URL and waits until the page is hydrated
 * @param {import('playwright').Page} page - Playwright page
 * @param {string} path - Path and query to open
 */
const open = async (page, path) => {
  await page.goto(`${BASE_URL}${path}`)
  await page.waitForLoadState('networkidle')
  await page.locator(RESUME).waitFor()
}

/**
 * Moves a range input the way a user drag would
 * @param {import('playwright').Locator} slider - Range input locator
 * @param {number} value - Value to set
 */
const setSlider = (slider, value) =>
  slider.evaluate((element, nextValue) => {
    element.value = String(nextValue)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)

/**
 * Waits for a search param to reach a value (null = absent)
 * @param {import('playwright').Page} page - Playwright page
 * @param {string} key - Search param name
 * @param {(value: string | null) => boolean} isDone - Predicate on the param value
 */
const waitForParam = (page, key, isDone) =>
  page.waitForURL((url) => isDone(url.searchParams.get(key)), { timeout: 5000 })

const browser = await chromium.launch()
const page = await browser.newPage()

try {
  await open(page, '/')
  const fullText = await page.locator(RESUME).textContent()
  const fullLabel = await page.locator(PRESET_LABEL).first().textContent()

  await check('preset dropdown updates URL and content', async () => {
    await page.locator(PRESET_LABEL).first().click()
    await page.locator('ul.dropdown-content button').nth(1).click()
    await waitForParam(page, 'preset', Boolean)
    await page.waitForFunction(
      ([selector, before]) => document.querySelector(selector).textContent !== before,
      [RESUME, fullText],
      { timeout: 5000 }
    )
  })

  await check('back restores URL, content and dropdown label', async () => {
    await page.goBack()
    await waitForParam(page, 'preset', (value) => value === null)
    await page.waitForFunction(
      ([selector, before]) => document.querySelector(selector).textContent === before,
      [RESUME, fullText],
      { timeout: 5000 }
    )
    const label = await page.locator(PRESET_LABEL).first().textContent()
    expect(label === fullLabel, `dropdown label is "${label}", expected "${fullLabel}"`)
  })

  await open(page, '/')

  await check('density slider updates URL and content', async () => {
    await setSlider(page.locator('input.range-primary'), 50)
    await waitForParam(page, 'density', (value) => value === '50')
    await page.waitForFunction(
      ([selector, before]) => document.querySelector(selector).textContent.length < before,
      [RESUME, fullText.length],
      { timeout: 5000 }
    )
  })

  await open(page, '/')

  await check('timeframe slider updates URL and content', async () => {
    await setSlider(page.locator('input.range-secondary'), 3)
    await waitForParam(page, 'timeframe', (value) => value === '3')
    await page.waitForFunction(
      ([selector, before]) => document.querySelector(selector).textContent.length < before,
      [RESUME, fullText.length],
      { timeout: 5000 }
    )
  })

  await open(page, '/')

  await check('section toggle updates URL and content, then restores', async () => {
    const toggle = page.locator('label', { hasText: /^\s*skills\s*$/i }).locator('input')
    const skillsSection = page.locator('[data-section="skills"]')
    await toggle.uncheck()
    await waitForParam(page, 'sections', (value) => Boolean(value) && !value.split(',').includes('skills'))
    await skillsSection.waitFor({ state: 'hidden', timeout: 5000 })
    await toggle.check()
    await waitForParam(page, 'sections', (value) => Boolean(value) && value.split(',').includes('skills'))
    await skillsSection.waitFor({ state: 'visible', timeout: 5000 })
  })

  await check('deep link restores sliders from the URL', async () => {
    await open(page, '/?density=50&timeframe=3')
    const density = await page.locator('input.range-primary').inputValue()
    const timeframe = await page.locator('input.range-secondary').inputValue()
    expect(density === '50', `density slider is ${density}, expected 50`)
    expect(timeframe === '3', `timeframe slider is ${timeframe}, expected 3`)
  })
} finally {
  await browser.close()
}

if (failures.length > 0) {
  console.log(`\n${failures.length} check(s) failed`)
  process.exitCode = 1
} else {
  console.log('\nall checks passed')
}
