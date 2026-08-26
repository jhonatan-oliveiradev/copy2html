import { expect, test, type Locator } from '@playwright/test'

const wordHtml = `
<!--StartFragment-->
<p class="MsoNormal" style="margin:0;font-family:Calibri">Aproveite este <b>superbônus</b> na <b>compra de milhas Smiles</b> e turbine seu saldo para o próximo destino.</p>
<p class="MsoNormal" style="margin:0;font-family:Calibri">Ainda não é Clube Smiles? Assine agora e garanta milhas e benefícios exclusivos todos os meses!</p>
<!--EndFragment-->
`

async function selectText(editor: Locator, text: string) {
  await editor.evaluate((root, target) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const nodes: Text[] = []
    let combined = ''

    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      nodes.push(node)
      combined += node.data
    }

    const start = combined.indexOf(target)
    if (start < 0) throw new Error(`Text not found: ${target}`)
    const end = start + target.length

    let cursor = 0
    let startNode: Text | null = null
    let endNode: Text | null = null
    let startOffset = 0
    let endOffset = 0

    for (const node of nodes) {
      const next = cursor + node.data.length
      if (!startNode && start >= cursor && start <= next) {
        startNode = node
        startOffset = start - cursor
      }
      if (end >= cursor && end <= next) {
        endNode = node
        endOffset = end - cursor
        break
      }
      cursor = next
    }

    if (!startNode || !endNode) throw new Error(`Could not create selection for: ${target}`)

    const range = document.createRange()
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, text)
}

test('publishes Word copy as clean Liferay HTML with Smiles presets', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:3000' })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Copy2HTML' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Smiles' })).toBeVisible()

  const editor = page.locator('.ProseMirror')
  await expect(editor).toBeVisible()
  await editor.evaluate((element, html) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/html', html)
    clipboardData.setData('text/plain', element.textContent ?? '')
    element.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    )
  }, wordHtml)

  const output = page.locator('.html-code code')
  await expect(output).toContainText('superbônus')
  await expect(output).not.toContainText('MsoNormal')
  await expect(output).not.toContainText('Calibri')

  await selectText(editor, 'Clube Smiles')
  await page.getByRole('button', { name: /^Clube Smiles$/ }).click()
  await expect(output).toContainText('color: #663399')

  await selectText(editor, 'Assine agora')
  await page.getByRole('button', { name: /^Macro Clube Smiles$/ }).click()
  await expect(output).toContainText('#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_')

  await expect(page.getByTitle('Preview do HTML sanitizado')).toBeVisible()
  await expect(page.locator('.status-blocked')).toHaveCount(0)

  await page.locator('.app-header .copy-button').click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())

  expect(copied).toContain('<strong>superbônus</strong>')
  expect(copied).toContain('color: #663399')
  expect(copied).toContain('#p_p_id_smilesmembershipclubjoinmacro_WAR_smilesmembershipsportlet_')
  expect(copied).not.toMatch(/MsoNormal|Calibri|font-family/i)
})
