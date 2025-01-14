import { Handler } from '@netlify/functions'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'
import matter from 'gray-matter'

// Types for the highlight submission
interface HighlightSubmission {
  highlight: string
  rollSlug: string
  imageIndex: number
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
    const submission: HighlightSubmission = JSON.parse(event.body || '{}')
    const { highlight, rollSlug, imageIndex } = submission

    // Validate required fields
    if (!highlight || !rollSlug || typeof imageIndex !== 'number') {
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
    
    // Parse the front matter to get existing data
    const { data: frontMatter } = matter('---\n' + frontMatterContent + '\n---')
    
    // Get the images array
    const images = frontMatter.images || []
    
    // Check if the image index exists
    if (imageIndex >= images.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid image index' }),
      }
    }

    // Find the images section in the original front matter
    const frontMatterLines = frontMatterContent.split('\n')
    const imagesStartIndex = frontMatterLines.findIndex(line => line.startsWith('images:'))
    
    if (imagesStartIndex === -1) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No images section found in frontmatter' }),
      }
    }

    // Find the target image block
    let currentImageIndex = -1
    let targetImageStartIndex = -1
    let targetImageEndIndex = -1

    for (let i = imagesStartIndex + 1; i < frontMatterLines.length; i++) {
      const line = frontMatterLines[i]
      if (line.trim().startsWith('- image:')) {
        currentImageIndex++
        if (currentImageIndex === imageIndex) {
          targetImageStartIndex = i
        } else if (currentImageIndex === imageIndex + 1) {
          targetImageEndIndex = i
          break
        }
      } else if (!line.trim().startsWith('  ') && line.trim() !== '') {
        if (currentImageIndex === imageIndex) {
          targetImageEndIndex = i
          break
        }
      }
    }

    if (targetImageEndIndex === -1) {
      targetImageEndIndex = frontMatterLines.length
    }

    // Update or add the feature field in the target image block
    const imageLines = frontMatterLines.slice(targetImageStartIndex, targetImageEndIndex)
    const featureLineIndex = imageLines.findIndex(line => line.trim().startsWith('feature:'))

    if (featureLineIndex !== -1) {
      // Update existing feature
      imageLines[featureLineIndex] = `    feature: ${highlight}`
    } else {
      // Add new feature line right after the image line
      imageLines.splice(1, 0, `    feature: ${highlight}`)
    }

    // Replace the image block in the front matter
    frontMatterLines.splice(
      targetImageStartIndex,
      targetImageEndIndex - targetImageStartIndex,
      ...imageLines
    )

    // Reconstruct the file content
    const updatedContent = `---\n${frontMatterLines.join('\n')}\n---\n${markdownContent.trim()}\n`

    // Create a new branch with sanitized name
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12)
    const sanitizedSlug = sanitizeBranchName(rollSlug)
    const branchName = `highlight-${sanitizedSlug}-${timestamp}`

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
      message: `Add highlight "${highlight}" to image ${imageIndex + 1} in ${rollSlug}`,
      content: Base64.encode(updatedContent),
      branch: branchName,
      sha: fileData.sha,
    })

    // Create a pull request
    const { data: pullRequest } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `Add highlight "${highlight}" to image ${imageIndex + 1} in ${rollSlug}`,
      head: branchName,
      base: MAIN_BRANCH,
      body: `Adding highlight "${highlight}" to image ${imageIndex + 1} in roll ${rollSlug}.\n\nPlease review and merge if appropriate.`,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Highlight added successfully',
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