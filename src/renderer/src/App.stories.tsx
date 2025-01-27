import type { Story, StoryDefault } from '@ladle/react'
import App from './App'

export const Default: Story = () => {
  return <App />
}
Default.storyName = '1. default'

export default {
  title: '_1 app/1 app'
} satisfies StoryDefault
