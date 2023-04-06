import './app.css'
import Panel from './Panel.svelte'

// @ts-ignore
const app = new Panel({
  target: document.getElementById('app')
})

export default app