import createApp from './app'
import applicationInfo from './applicationInfo'

// add this comment to test deployment pipeline
const app = createApp(applicationInfo())
export default app
