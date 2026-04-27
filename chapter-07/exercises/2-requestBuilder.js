/*
 * 7.2 Request builder: Create your own Builder class around the built-in http.request()
 * function. The builder must be able to provide at least basic facilities to
 * specify the HTTP method, the URL, the query component of the URL, the header
 * parameters, and the eventual body data to be sent. To send the request, provide
 * an invoke() method that returns a Promise for the invocation. You can find the
 * docs for http.request() at the following URL: nodejsdp.link/docs-http-request.
 * */
import http from 'node:https'

class HttpRequest {
  constructor({ host, port, method, path, query }, body) {
    this.host = host
    this.port = port
    this.method = method
    this.path = path
    this.query = query
    this.body = body
  }

  invoke() {
    return new Promise((resolve, reject) => {
      const options = {
        host: this.host,
        port: this.port,
        method: this.method,
        path: this.path,
        query: this.query
      }

      console.log('>>> options: ', options)
      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(JSON.parse(data)))
      })

      req.on('error', reject)

      if (this.method === 'POST') {
        req.write(this.body)
      }

      req.end()
    })
  }
}

class HttpRequestBuilder {
  withRoute(host, port) {
    this.host = host
    this.port = port

    return this
  }

  withMethod(method) {
    this.method = method

    return this
  }

  withPath(path) {
    this.path = path

    return this
  }

  withParams(query) {
    this.query = query

    return this
  }

  withBody(body) {
    this.body = body

    return this
  }

  build() {
    return new HttpRequest(
      {
        method: this.method,
        path: this.path,
        port: this.port,
        query: this.query,
        host: this.host
      },
      this.body
    )
  }
}

const builder = new HttpRequestBuilder()
  .withRoute('pokeapi.co')
  .withPath('/api/v2/berry')
  .withMethod('GET')
  .build()

const berries = await builder.invoke()
console.log('Berries response is: ')
console.log(berries)
