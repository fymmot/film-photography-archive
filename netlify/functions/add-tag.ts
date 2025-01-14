import { Handler } from '@netlify/functions'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'
import matter from 'gray-matter'

// Types for the tag submission
interface TagSubmission {
  tag: string
  rollSlug: string
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = process.env.GITHUB_REPO_OWNER
const REPO_NAME = process.env.GITHUB_REPO_NAME
const MAIN_BRANCH = 'main'

// Helper function to sanitize branch names
function sanitizeBranchName(name: string): string {
  return name
    .toLowerCase()
    // Replace special characters with their ASCII equivalents
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace any remaining special characters with dashes
    .replace(/[^a-z0-9-]/g, '-')
    // Remove consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    }
  }

  // Check if user is authenticated using Netlify Identity context
  const user = context.clientContext?.user
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Authentication required' }),
    }
  }

  try {
    // Parse the incoming request body
    const submission: TagSubmission = JSON.parse(event.body || '{}')
    const { tag, rollSlug } = submission

    // Validate required fields
    if (!tag || !rollSlug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    // Initialize Octokit
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing required environment variables' }),
      }
    }
    const octokit = new Octokit({ auth: GITHUB_TOKEN })

    // Get the current content of the markdown file
    const filepath = `src/content/rolls/${rollSlug}.md`
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filepath,
      ref: MAIN_BRANCH,
    })

    if (!('content' in fileData)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Roll file not found' }),
      }
    }

    // Decode the content
    const content = Base64.decode(fileData.content)
    
    // Find the front matter boundaries
    const matches = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!matches) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid markdown format' }),
      }
    }

    const [, frontMatterContent, markdownContent] = matches
    
    // Parse the front matter to get existing tags
    const { data: frontMatter } = matter('---\n' + frontMatterContent + '\n---')
    
    // Prepare the new tags array
    let tags: string[] = []
    if (frontMatter.tags) {
      tags = Array.isArray(frontMatter.tags) ? [...frontMatter.tags] : [frontMatter.tags]
    }
    
    // Add the new tag if it doesn't exist
    if (!tags.includes(tag)) {
      tags.push(tag)
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Tag already exists on this roll' }),
      }
    }

    // Find the tags line in the original front matter
    const frontMatterLines = frontMatterContent.split('\n')
    const tagsLineIndex = frontMatterLines.findIndex(line => line.startsWith('tags:'))
    
    // Update or add the tags
    const tagLines = tags.map(t => `  - "${t}"`)
    if (tagsLineIndex >= 0) {
      // Replace existing tags
      frontMatterLines.splice(tagsLineIndex, frontMatterLines.findIndex((line, i) => 
        i > tagsLineIndex && !line.startsWith('  - ')) - tagsLineIndex, 
        'tags:', ...tagLines)
    } else {
      // Add new tags at the end of front matter
      frontMatterLines.push('tags:', ...tagLines)
    }

    // Reconstruct the file content
    const updatedContent = `---\n${frontMatterLines.join('\n')}\n---\n${markdownContent.trim()}\n`

    // Create a new branch with sanitized name
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12)
    const sanitizedSlug = sanitizeBranchName(rollSlug)
    const branchName = `tag-${sanitizedSlug}-${timestamp}`

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

    // Update the file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filepath,
      message: `Add tag "${tag}" to ${rollSlug}`,
      content: Base64.encode(updatedContent),
      branch: branchName,
      sha: fileData.sha,
    })

    // Create a pull request
    const { data: pullRequest } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `Add tag "${tag}" to ${rollSlug}`,
      head: branchName,
      base: MAIN_BRANCH,
      body: `Adding tag "${tag}" to roll ${rollSlug}.\n\nPlease review and merge if appropriate.`,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Tag added successfully',
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