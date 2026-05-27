import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

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

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim()
      if (value) setCanvasBg(value)
    }
    read()
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', read)
    return () => mql.removeEventListener('change', read)
  }, [])

  const canPrev = page > 1
  const canNext = page < numPages

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        ref={containerRef}
        className="bg-background flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-md border"
      >
        <Document
          file={src}
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n)
            setPage(1)
          }}
          loading={
            <div className="text-muted-foreground py-12 text-sm">
              Loading PDF…
            </div>
          }
          error={
            <div className="text-muted-foreground py-12 text-sm">
              Couldn’t load the PDF.{' '}
              <a className="underline" href={src} target="_blank" rel="noopener">
                Open it directly
              </a>
              .
            </div>
          }
        >
          {width > 0 && (
            <Page
              pageNumber={page}
              width={width}
              canvasBackground={canvasBg}
            />
          )}
        </Document>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={!canNext}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            {numPages > 0 ? `${page} / ${numPages}` : '—'}
          </span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={src} download>
            <Download />
            Download
          </a>
        </Button>
      </div>
    </div>
  )
}
