/*
 * Exercise 10.2: Test an asynchronous retry function: Implement a function
 * called fetchWithRetry(asyncFn, maxRetries) that retries the given
 * asynchronous function up to maxRetries times if it throws. The asyncFn
 * can be any asynchronous function (e.g., a fetch or database call).
 * If asyncFn eventually succeeds, fetchWithRetry() should resolve to the same
 * value. If it fails on every attempt, it should reject with the last error.
 * Here are some suggestions:
 * > Simulate an asyncFn that fails twice and succeeds on the third attempt.
 * > Assert that it returns the expected value and that asyncFn was called
 *   three times (a great use case for mock.fn()).
 * > Write another test where asyncFn always fails and confirm that the
 *   function rejects and is called exactly maxRetries times.
 * */

export async function fetchWithRetry(asyncFn, maxRetries) {
  for (let i = 1; i <= maxRetries; i += 1) {
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      if (i === maxRetries) {
        throw err
      }
    }
  }
}
