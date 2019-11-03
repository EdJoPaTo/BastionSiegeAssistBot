/* eslint unicorn/no-for-loop: off */

import * as d3 from 'd3'
import sharp from 'sharp'

/* eslint @typescript-eslint/no-var-requires: warn */
/* eslint @typescript-eslint/no-require-imports: warn */
const D3Node = require('d3-node')

// https://projects.susielu.com/viz-palette
const COLORS = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf', '#999999']

export interface Options {
  height: number;
  width: number;
  unit: string;
  labelNumberFormatter: (number: number) => string;
}

export interface Point {
  timestamp: number;
  value: number;
}

export interface Series {
  labelText: string;
  points: Point[];
}

export async function createPngBuffer(minUnixTimestamp: number, options: Options, ...series: Series[]): Promise<Buffer> {
  const svgString = createSvgString(minUnixTimestamp, options, ...series)
  const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer()
  return pngBuffer
}

export function createSvgString(minUnixTimestamp: number, options: Options, ...series: Series[]): string {
  const margin = {top: 20, right: 170, bottom: 20, left: 0}
  const {height, width, unit, labelNumberFormatter} = options

  const d3n = new D3Node()

  const x = d3.scaleTime()
    .domain([minUnixTimestamp * 1000, Date.now()])
    .range([margin.left, width - margin.right])

  const relevantValues = series
    .flatMap(s => s.points)
    .map(o => o.value)

  const min = d3.min(relevantValues)!
  const max = d3.max(relevantValues)!

  const y = d3.scaleLinear()
    .domain([min, max]).nice()
    .range([height - margin.bottom, margin.top])

  const line = d3.line()
    .x(d => x((d as any).timestamp))
    .y(d => y((d as any).value))

  const svg = d3n.createSVG(width, height)

  const legend = svg.append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 15)
  for (let i = 0; i < series.length; i++) {
    const lastValue = series[i].points.slice(-1)[0].value

    const color = COLORS[i % COLORS.length]
    const yVal = y(lastValue)

    legend.append('g')
      .attr('fill', color)
      .call((g: any) => g.append('text')
        .attr('x', width - margin.right + 65)
        .attr('y', yVal)
        .attr('text-anchor', 'end')
        .attr('font-weight', 'bold')
        .text(labelNumberFormatter(lastValue))
      )
      .call((g: any) => g.append('text')
        .attr('x', width - margin.right + 70)
        .attr('y', yVal)
        .attr('text-anchor', 'begin')
        .text(series[i].labelText)
      )
  }

  // X Axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickFormat(date => multiFormat(date as Date))
      .tickSizeOuter(0)
    )

  // Y Axis
  svg.append('g')
    .attr('transform', `translate(${width - margin.right},0)`)
    .call(d3.axisRight(y))
    .call((g: any) => g.select('.domain').remove())
    .call((g: any) => g.select('.tick:last-of-type text').clone()
      .attr('x', -3)
      .attr('y', -8)
      .attr('text-anchor', 'end')
      .attr('font-weight', 'bold')
      .attr('font-size', 15)
      .text(unit)
    )

  // X Grid
  svg.append('g')
    .attr('transform', `translate(0,${margin.top})`)
    .attr('opacity', 0.1)
    .call(d3.axisBottom(x)
      .tickFormat(() => '')
      .tickSize(height - margin.top - margin.bottom)
    )
    .call((g: any) => g.select('.domain').remove())

  // Y Grid
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .attr('opacity', 0.1)
    .call(d3.axisRight(y)
      .tickFormat(() => '')
      .tickSize(width - margin.left - margin.right)
    )
    .call((g: any) => g.select('.domain').remove())

  // Series
  for (let i = 0; i < series.length; i++) {
    const {points} = series[i]

    svg.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', COLORS[i % COLORS.length])
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line)
  }

  return d3n.svgString()
}

function multiFormat(date: Date): string {
  if (d3.timeSecond(date) < date) {
    return d3.timeFormat('.%L')(date)
  }

  if (d3.timeMinute(date) < date) {
    return d3.timeFormat(':%S')(date)
  }

  if (d3.timeHour(date) < date) {
    return d3.timeFormat('%H:%M')(date)
  }

  if (d3.timeDay(date) < date) {
    return d3.timeFormat('%H')(date)
  }

  if (d3.timeMonth(date) < date) {
    if (d3.timeWeek(date) < date) {
      return d3.timeFormat('%a %d')(date)
    }

    return d3.timeFormat('%b %d')(date)
  }

  if (d3.timeYear(date) < date) {
    return d3.timeFormat('%B')(date)
  }

  return d3.timeFormat('%Y')(date)
}
