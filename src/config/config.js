import './app.css'
import Config from './Config.svelte'

// @ts-ignore
const app = new Config({
  target: document.getElementById('app')
})

export default app