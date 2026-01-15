import React, { useState, useRef, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function SealMaker() {
  const [name, setName] = useState('張無忌')
  const [width, setWidth] = useState(242)
  const [height, setHeight] = useState(100)
  const [fontFamily, setFontFamily] = useState('DFKai-SB')
  const [watermark, setWatermark] = useState('Taiwan Green Productivity')
  const canvasRef = useRef(null)

  const fonts = [
    { value: 'DFKai-SB', label: '標楷體（系統）' },
    { value: 'Microsoft JhengHei', label: '微軟正黑體' },
    { value: 'SimHei', label: '黑體' },
    { value: 'SimSun', label: '宋體' },
    { value: 'serif', label: '襯線體（備用）' },
  ]

  useEffect(() => {
    generateSeal()
  }, [name, width, height, fontFamily, watermark])

  const generateSeal = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    // 外框
    const borderWidth = Math.max(6, Math.floor(width * 0.025))
    ctx.fillStyle = '#E61E28'
    ctx.fillRect(0, 0, width, height)

    // 內框
    ctx.fillStyle = 'white'
    ctx.fillRect(
      borderWidth,
      borderWidth,
      width - borderWidth * 2,
      height - borderWidth * 2
    )

    // 主文字
    ctx.fillStyle = '#E61E28'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const textPadding = 3
    const maxTextWidth = width - borderWidth * 2 - textPadding * 2
    const maxTextHeight = height - borderWidth * 2 - textPadding * 2

    let fontSize = Math.floor(maxTextHeight * 0.9)
    ctx.font = `bold ${fontSize}px ${fontFamily}, serif`

    while (ctx.measureText(name).width > maxTextWidth && fontSize > 10) {
      fontSize -= 2
      ctx.font = `bold ${fontSize}px ${fontFamily}, serif`
    }

    const textY = height / 2 - Math.floor(height * 0.05)
    ctx.fillText(name, width / 2, textY)

    // 浮水印
    ctx.fillStyle = '#CCCCCC'
    const watermarkFontSize = Math.floor(height * 0.1)
    ctx.font = `${watermarkFontSize}px "Times New Roman", serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'

    const watermarkText = watermark + ' '
    const singleWidth = ctx.measureText(watermarkText).width
    const availableWidth = width - borderWidth * 2 - 2
    const repeatCount = Math.ceil(availableWidth / singleWidth)

    const watermarkY = height - borderWidth - 1
    let currentX = borderWidth + 1

    for (let i = 0; i < repeatCount; i++) {
      const remaining = availableWidth - (currentX - borderWidth - 1)
      if (remaining <= 0) break

      if (remaining < singleWidth) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(currentX, watermarkY - watermarkFontSize, remaining, watermarkFontSize)
        ctx.clip()
        ctx.fillText(watermarkText, currentX, watermarkY)
        ctx.restore()
      } else {
        ctx.fillText(watermarkText, currentX, watermarkY)
      }
      currentX += singleWidth
    }
  }

  const downloadSeal = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name}_職章.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          職章線上製作工具
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 控制區 */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">姓名</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">寬度 (px)</label>
                <input
                  type="number"
                  value={width}
                  min={100}
                  onChange={(e) => setWidth(Math.max(100, Number(e.target.value) || 242))}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">高度 (px)</label>
                <input
                  type="number"
                  value={height}
                  min={50}
                  onChange={(e) => setHeight(Math.max(50, Number(e.target.value) || 100))}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">字型</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                {fonts.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">浮水印</label>
              <input
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <button
              onClick={downloadSeal}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Download size={20} />
              下載印章 PNG
            </button>
          </div>

          {/* 預覽 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="font-semibold mb-4">預覽</h2>
            <div className="flex justify-center items-center bg-gray-50 p-8 rounded-lg">
              <canvas ref={canvasRef} className="shadow" />
            </div>
            <div className="text-sm text-center text-gray-600 mt-4">
              實際尺寸：{width} × {height}px
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
