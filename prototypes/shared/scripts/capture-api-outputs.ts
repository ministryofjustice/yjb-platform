// Sends each valid scenario to the running API and saves the response into example-data.json.
// Needs the API running (npm run dev -w apps/api); set API_URL if it isn't on localhost:3001.
import DtoService from '../../../apps/frontend/server/services/dtoService'
import { loadData, saveData } from './lib'

const apiUrl = process.env.API_URL ?? 'http://localhost:3001'

async function main() {
  const data = loadData()
  // validation doesn't touch the API client
  const dtoService = new DtoService(null)

  for (const [name, scenario] of Object.entries(data.scenarios)) {
    const validation = dtoService.validatePayload(scenario.formBody)

    if (!validation.isValid) {
      delete scenario.apiOutput
      console.log(`${name}: fails validation, so it has no API output`)
      continue
    }

    // the same request the frontend's YjbApiClient makes
    const response = await fetch(`${apiUrl}/calculations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.payload),
    })
    if (!response.ok) {
      throw new Error(`${name}: API returned ${response.status} ${await response.text()}`)
    }

    scenario.apiOutput = await response.json()
    console.log(`${name}: captured`)
  }

  saveData(data)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
