/*
 * Exercise 10.1: Unit test for a utility function: Create a function called
 * slugify(text) that turns a string into a URL-friendly slug. For example,
 * Hello World! should become hello-world. Write a unit test using Node.js’s
 * built-in test runner to verify the following:
 * > The output is lowercase
 * > Special characters are removed
 * > Multiple spaces or dashes are collapsed into a single dash
 * */

export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
