import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function useTitle ({ title }) {
  const setTitle = useOutletContext()[3][1] // Assuming the context is an array and the title setter is at index 3
  useEffect(() => {
    const temp = title.split(' - ')[1] || title.split(' - ')[0]
    // console.log()
    document.title = `QuickPoll - ${temp}`
    setTitle(title)
  }, [title])
}
