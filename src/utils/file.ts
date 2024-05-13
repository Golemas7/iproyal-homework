// Partial code from https://stackoverflow.com/a/68146412
// Added in revodeObjectURL as pointed in the comments
export const saveToFile = (filename: string, data: string) => {
  const blob = new Blob([data], { type: 'text/csv' })

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const elem = window.document.createElement('a')
    const href = window.URL.createObjectURL(blob)

    elem.href = href
    elem.download = filename
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
    URL.revokeObjectURL(href)
  }
}

// Partial code from https://stackoverflow.com/a/50578313
// Since readAsBinaryString is deprecated in favor of readAsArrayBuffer, we use readAsArrayBuffer instead
export const readFileData = <T>(e: Event, dataRef: Ref<T>) => {
  const target = e.target as HTMLInputElement

  if (target?.files && target?.files?.[0]) {
    const myFile = target?.files?.[0]
    const reader = new FileReader()

    reader.addEventListener('load', (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer

      // Convert the ArrayBuffer to a string
      const decoder = new TextDecoder('utf-8')
      const csvString = decoder.decode(arrayBuffer)

      dataRef.value = csvString as T
    })

    reader.readAsArrayBuffer(myFile)
  }
}
