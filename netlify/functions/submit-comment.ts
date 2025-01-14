import { Handler } from '@netlify/functions'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'

// Types for the comment submission
interface CommentSubmission {
  author: string
  email: string
  content: string
  rollSlug: string
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = process.env.GITHUB_REPO_OWNER
const REPO_NAME = process.env.GITHUB_REPO_NAME
const MAIN_BRANCH = 'main' // or whatever your main branch is called

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  // Log environment variables (avoid logging sensitive data in production)
  console.log('Environment Variables:', {
    GITHUB_TOKEN: GITHUB_TOKEN ? 'SET' : 'NOT SET',
    REPO_OWNER: REPO_OWNER,
    REPO_NAME: REPO_NAME,
  });

  try {
    // Parse the incoming request body
    const submission: CommentSubmission = JSON.parse(event.body || '{}')
    const { author, email, content, rollSlug } = submission

    // Validate required fields
    if (!author || !email || !content || !rollSlug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    // Initialize Octokit
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Missing required environment variables: ${!GITHUB_TOKEN ? 'GITHUB_TOKEN ' : ''}${!REPO_OWNER ? 'REPO_OWNER ' : ''}${!REPO_NAME ? 'REPO_NAME' : ''}`.trim() }),
      }
    }
    const octokit = new Octokit({ auth: GITHUB_TOKEN })

    // Generate timestamp for the filename
    const timestamp = new Date().toISOString()
    const sanitizedAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const filename = `${timestamp}-${sanitizedAuthor}.md`
    const filepath = `src/content/comments/${rollSlug}/${filename}`

    // Create the comment content in markdown format
    const commentContent = `---
author: "${author}"
email: "${email}"
dateTime: "${timestamp}"
---

${content}
`

    // Create a new branch for the PR - using a simpler name format
    const shortTimestamp = timestamp.replace(/[^0-9]/g, '').slice(0, 12)
    const shortSlug = rollSlug.split('-').slice(-2).join('-')
    const branchName = `comment-${shortSlug}-${shortTimestamp}`
    
    // Get the latest commit SHA from the main branch
    const { data: ref } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${MAIN_BRANCH}`,
    })

    // Create a new branch
    await octokit.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    })

    // Create the file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filepath,
      message: `Add comment on ${rollSlug} by ${author}`,
      content: Base64.encode(commentContent),
      branch: branchName,
    })

    // Create a pull request
    const { data: pullRequest } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `New comment on ${rollSlug} by ${author}`,
      head: branchName,
      base: MAIN_BRANCH,
      body: `New comment submission by ${author} on roll ${rollSlug}.\n\nPlease review and merge if appropriate.`,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Comment submitted successfully! It will appear on the site after review by an admin.',
        pullRequestUrl: pullRequest.html_url,
      }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

export { handler } 