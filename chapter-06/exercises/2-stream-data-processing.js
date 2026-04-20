/*
 * 6.2 Stream data processing: On Kaggle, you can find a lot of interesting
 * datasets, such as London Crime Data (nodejsdp.link/london-crime).
 * You can download the data in CSV format and build a stream processing script
 * that analyzes the data and tries to answer the following questions:
 * > Did the number of crimes go up or down over the years?
 * > What are the most dangerous areas of London?
 * > What is the most common crime per area?
 * > What is the least common crime?
 * Hint: You can use a combination of Transform streams and PassThrough
 * streams to parse and observe the data as it is flowing. Then, you can build
 * in-memory aggregations for the data, which can help you answer the preceding
 * questions. Also, you don’t need to do everything in one pipeline; you could
 * build very specialized pipelines (for example, one per question) and use
 * the fork pattern to distribute the parsed data across them.
 * */

import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { Transform, Readable, pipeline, Writable } from 'node:stream'

const source = process.argv[2]
const streamLine = createReadStream(source)

class CrimesDetective extends Writable {
  constructor(options) {
    super({ ...options, objectMode: true })
    this.yearsMap = new Map()
  }

  _write(chunk, _enc, done) {
    const currentYear = this.yearsMap.has(chunk.year)

    if (currentYear) {
      const currentValue = this.yearsMap.get(chunk.year)
      this.yearsMap.set(chunk.year, currentValue + chunk.value)
    } else {
      this.yearsMap.set(chunk.year, chunk.value)
    }

    done()
  }

  _final(cb) {
    const crimesPerYear = Array.from(this.yearsMap.entries()).sort((a, b) => {
      return parseInt(a[0], 10) - parseInt(b[0], 10)
    })

    console.table(crimesPerYear)

    let up = 0
    let down = 0

    for (let i = 1; i < crimesPerYear.length; i++) {
      const passYear = crimesPerYear[i - 1]
      const currentYear = crimesPerYear[i]

      if (currentYear[1] > passYear[1]) {
        up++
      } else {
        down++
      }
    }

    console.log(`\n🕵️‍♂️ Yearly Detective Verdict (Detailed Analysis):`)
    console.log(`Total annual increases: ${up}`)
    console.log(`Total annual decreases: ${down}`)

    if (up > down) {
      console.log(`🚨 CONCLUSION: The general trend over the years is UPWARD.`)
    } else if (down > up) {
      console.log(
        `📉 CONCLUSION: The general trend over the years is DOWNWARD.`
      )
    } else {
      console.log(
        `⚖️ CONCLUSION: Crime fluctuated without a clear dominant trend.`
      )
    }

    cb()
  }
}

class DangerousAreasDetective extends Writable {
  constructor(options) {
    super({ ...options, objectMode: true })
    this.areasMap = new Map()
  }

  _write(chunk, _enc, done) {
    const { borough, value } = chunk

    if (this.areasMap.has(borough)) {
      const currentValue = this.areasMap.get(borough)
      this.areasMap.set(borough, currentValue + value)
    } else {
      this.areasMap.set(borough, value)
    }

    done()
  }

  _final(cb) {
    const filteredAreas = Array.from(this.areasMap.entries())
      .filter(([_area, value]) => value > 0)
      .sort((a, b) => {
        return b[1] - a[1]
      })

    console.log('Most dangerous areas in London')
    console.table(filteredAreas)
    cb()
  }
}

class CommonCrimeAreaDetective extends Writable {
  constructor(options) {
    super({ ...options, objectMode: true })
    this.areasMap = new Map()
  }

  _write(chunk, _enc, done) {
    const { borough, major_category, value } = chunk

    if (!this.areasMap.has(borough)) {
      this.areasMap.set(borough, new Map())
    }

    const crimesInBorough = this.areasMap.get(borough)

    const currentCrimeValue = crimesInBorough.get(major_category) || 0
    crimesInBorough.set(major_category, currentCrimeValue + value)

    done()
  }

  _final(cb) {
    const results = []

    for (const [borough, crimesMap] of this.areasMap.entries()) {
      let topCrime = ''
      let maxVal = -1

      for (const [crimeName, count] of crimesMap.entries()) {
        if (count > maxVal) {
          maxVal = count
          topCrime = crimeName
        }
      }

      results.push({
        Borough: borough,
        'Most Common Crime': topCrime,
        Incidents: maxVal
      })
    }

    console.log('\n--- 🏙️ MOST COMMON CRIME PER AREA ---')
    console.table(results)
    cb()
  }
}

class LessCommonCrimeAreaDetective extends Writable {
  constructor(options) {
    super({ ...options, objectMode: true })
    this.crimesMap = new Map()
  }

  _write(chunk, _enc, done) {
    const { minor_category, value } = chunk
    const currentValue = this.crimesMap.get(minor_category) || 0
    this.crimesMap.set(minor_category, currentValue + value)

    done()
  }

  _final(cb) {
    const sortedCrimes = Array.from(this.crimesMap.entries())
      .filter(([_crime, count]) => count > 0)
      .sort((a, b) => a[1] - b[1])

    console.log('\n--- 🕊️ LEAST COMMON CRIME OVERALL ---')
    if (sortedCrimes.length > 0) {
      const [leastCrime, count] = sortedCrimes[0]
      console.log(
        `The least common crime in London is: "${leastCrime}" with exactly ${count} incidents across all years.`
      )
    }

    cb()
  }
}

let headRead = false
const dataParser = new Transform({
  objectMode: true,
  transform(chunk, _enc, cb) {
    if (!headRead) {
      // Omit first line
      headRead = true
    } else {
      const parsed = chunk.toString().split(',')
      const [
        lsoa_code,
        borough,
        major_category,
        minor_category,
        value,
        year,
        month
      ] = parsed
      this.push({
        lsoa_code,
        borough,
        major_category,
        minor_category,
        value: parseInt(value, 10) || 0,
        year,
        month
      })
    }

    cb()
  },
  flush(cb) {
    cb()
  }
})

const crimesDetective = new CrimesDetective()
const dangerousAreasDetective = new DangerousAreasDetective()
const commonCrimeAreaDetective = new CommonCrimeAreaDetective()
const lessCommonCrimeAreaDetective = new LessCommonCrimeAreaDetective()

const readline = Readable.from(createInterface({ input: streamLine }))
const parsed = readline.pipe(dataParser)
parsed.pipe(crimesDetective)
parsed.pipe(dangerousAreasDetective)
parsed.pipe(commonCrimeAreaDetective)
parsed.pipe(lessCommonCrimeAreaDetective)
