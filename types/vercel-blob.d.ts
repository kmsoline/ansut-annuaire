// Type declarations for @vercel/blob
// The package uses .d.cts files not listed in its exports field,
// so we declare the module manually for TypeScript resolution.
declare module "@vercel/blob" {
  export interface PutBlobResult {
    url: string
    pathname: string
    contentType: string
    contentDisposition: string
  }

  export interface PutCommandOptions {
    access: "public" | "private"
    contentType?: string
    addRandomSuffix?: boolean
    token?: string
    multipart?: boolean
    cacheControlMaxAge?: number
  }

  export function put(
    pathname: string,
    body:
      | File
      | Blob
      | ReadableStream
      | ArrayBuffer
      | FormData
      | string
      | Buffer,
    options: PutCommandOptions
  ): Promise<PutBlobResult>

  export function del(
    url: string | string[],
    options?: { token?: string }
  ): Promise<void>

  export function list(options?: {
    token?: string
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<{
    blobs: PutBlobResult[]
    cursor?: string
    hasMore: boolean
  }>
}
