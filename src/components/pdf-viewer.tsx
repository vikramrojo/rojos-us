import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

import { cn } from '@/lib/utils'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

/**
 * Lucide icons, inlined.
 *
 * This is a React island, so it cannot render `@lucide/astro` components.
 * Three icons don't justify a dependency, so the paths are copied verbatim
 * from Lucide. Dimensions match lucide-react's defaults (24x24); the button's
 * button sizing overrides them, exactly as before.
 */
type IconProps = { className?: string }

const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const ChevronLeft = ({ className }: IconProps) => (
  <svg {...svgProps} className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ChevronRight = ({ className }: IconProps) => (
  <svg {...svgProps} className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const Download = ({ className }: IconProps) => (
  <svg {...svgProps} className={className}>
    <path d="M12 15V3m9 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
  </svg>
)

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

interface Props {
  src: string
  className?: string
}

export default function PdfViewer({ src, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState<number>(0)
  const [numPages, setNumPages] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [canvasBg, setCanvasBg] = useState<string>('white')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0
      if (next > 0) setWidth(next)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /*
   * Keep the page canvas on the theme background.
   *
   * This watches the data-theme attribute, not prefers-color-scheme. It used to
   * watch the media query, which meant the canvas ignored the site's own theme
   * toggle entirely and only followed the OS — a pre-existing bug, visible as a
   * white page behind a dark PDF after toggling.
   */
  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--canvas')
        .trim()
      if (value) setCanvasBg(value)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const canPrev = page > 1
  const canNext = page < numPages

  return (
    <div className={cn('pdf-viewer', className)}>
      <div ref={containerRef} className="pdf-stage">
        <Document
          file={src}
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n)
            setPage(1)
          }}
          loading={<div className="pdf-loading">Loading PDF…</div>}
          error={
            <div className="pdf-loading">
              Couldn’t load the PDF.{' '}
              <a className="pdf-link" href={src} target="_blank" rel="noopener">
                Open it directly
              </a>
              .
            </div>
          }
        >
          {width > 0 && (
            <Page pageNumber={page} width={width} canvasBackground={canvasBg} />
          )}
        </Document>
      </div>

      <div className="pdf-controls">
        <div className="pdf-controls-group">
          <button
            className="btn"
            data-icon
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>
          <button
            className="btn"
            data-icon
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={!canNext}
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
          <span className="pdf-status tabular">
            {numPages > 0 ? `${page} / ${numPages}` : '—'}
          </span>
        </div>
        <a className="btn" data-ghost data-compact href={src} download>
          <Download />
          Download
        </a>
      </div>
    </div>
  )
}
