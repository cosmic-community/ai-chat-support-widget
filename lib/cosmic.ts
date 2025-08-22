import { createBucketClient } from '@cosmicjs/sdk'
import type { AIGenerateTextParams, AIStreamResponse, Recipe, Category, Author, Comment, KnowledgeBase } from '@/types'

if (!process.env.COSMIC_BUCKET_SLUG) {
  throw new Error('COSMIC_BUCKET_SLUG environment variable is required')
}

if (!process.env.COSMIC_WRITE_KEY) {
  throw new Error('COSMIC_WRITE_KEY environment variable is required')
}

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

// Helper function for error handling
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

// Fetch all knowledge base data for AI context
export async function fetchKnowledgeBase(): Promise<KnowledgeBase> {
  try {
    const [recipesResponse, categoriesResponse, authorsResponse, commentsResponse] = await Promise.allSettled([
      cosmic.objects.find({ type: 'recipes' })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)
        .limit(50),
      cosmic.objects.find({ type: 'categories' })
        .props(['id', 'title', 'slug', 'metadata'])
        .limit(20),
      cosmic.objects.find({ type: 'authors' })
        .props(['id', 'title', 'slug', 'metadata'])
        .limit(20),
      cosmic.objects.find({ type: 'comments' })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)
        .limit(30)
    ])

    const recipes = recipesResponse.status === 'fulfilled' ? recipesResponse.value.objects as Recipe[] : []
    const categories = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value.objects as Category[] : []
    const authors = authorsResponse.status === 'fulfilled' ? authorsResponse.value.objects as Author[] : []
    const comments = commentsResponse.status === 'fulfilled' ? commentsResponse.value.objects as Comment[] : []

    return {
      recipes,
      categories,
      authors,
      comments: comments.filter(comment => comment.metadata?.status?.value === 'Approved')
    }
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return {
      recipes: [],
      categories: [],
      authors: [],
      comments: []
    }
  }
}

// Generate knowledge base context for AI
export function generateKnowledgeBaseContext(knowledgeBase: KnowledgeBase): string {
  const { recipes, categories, authors, comments } = knowledgeBase
  
  let context = `# Recipe Knowledge Base

You are an AI assistant for a recipe website. You have access to the following information:

## Available Recipes (${recipes.length} total):
`

  // Add recipe summaries
  recipes.forEach(recipe => {
    const category = recipe.metadata.category?.metadata?.name || 'Uncategorized'
    const author = recipe.metadata.author?.metadata?.name || 'Unknown'
    const difficulty = recipe.metadata.difficulty_level?.value || 'Unknown'
    
    context += `
### ${recipe.metadata.recipe_name}
- **Category**: ${category}
- **Author**: ${author}  
- **Difficulty**: ${difficulty}
- **Prep Time**: ${recipe.metadata.prep_time || 'N/A'} minutes
- **Cook Time**: ${recipe.metadata.cook_time || 'N/A'} minutes
- **Servings**: ${recipe.metadata.servings || 'N/A'}
- **Description**: ${recipe.metadata.description || 'No description available'}
`

    // Add ingredients (strip HTML)
    if (recipe.metadata.ingredients) {
      const ingredients = recipe.metadata.ingredients.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
      context += `- **Ingredients**: ${ingredients}\n`
    }

    // Add instructions (strip HTML and truncate)
    if (recipe.metadata.instructions) {
      const instructions = recipe.metadata.instructions.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
      const truncatedInstructions = instructions.length > 200 
        ? instructions.substring(0, 200) + '...' 
        : instructions
      context += `- **Instructions**: ${truncatedInstructions}\n`
    }
  })

  // Add categories
  if (categories.length > 0) {
    context += `\n## Recipe Categories (${categories.length} total):\n`
    categories.forEach(category => {
      context += `- **${category.metadata.name}**: ${category.metadata.description || 'No description'}\n`
    })
  }

  // Add authors
  if (authors.length > 0) {
    context += `\n## Chefs & Authors (${authors.length} total):\n`
    authors.forEach(author => {
      const specialty = author.metadata.specialty_cuisine || 'General cooking'
      context += `- **${author.metadata.name}** (${specialty}): ${author.metadata.bio || 'No bio available'}\n`
    })
  }

  // Add sample comments/reviews
  if (comments.length > 0) {
    context += `\n## Recent User Reviews & Comments:\n`
    comments.slice(0, 10).forEach(comment => {
      const recipeName = comment.metadata.recipe?.metadata?.recipe_name || comment.metadata.recipe?.title || 'Unknown Recipe'
      const rating = comment.metadata.rating ? `${comment.metadata.rating}/5 stars` : 'No rating'
      
      context += `- **${comment.metadata.user_name}** on "${recipeName}" (${rating}): "${comment.metadata.comment_text}"\n`
    })
  }

  context += `
## Your Role:
- Answer questions about recipes, cooking techniques, ingredients, and food preparation
- Provide recipe recommendations based on user preferences
- Help users understand cooking instructions and ingredient substitutions
- Share information about the chefs and their specialties
- Reference user reviews and ratings when relevant
- Be helpful, friendly, and knowledgeable about cooking and food

If users ask about specific recipes, provide detailed information including ingredients, instructions, prep/cook times, and any relevant tips from user reviews.
`

  return context
}

// Stream AI response with knowledge base context
export async function streamAIResponse(params: AIGenerateTextParams, includeKnowledgeBase = true) {
  try {
    let messages = params.messages || []
    
    // Add knowledge base context as system message if requested
    if (includeKnowledgeBase && messages.length > 0) {
      const knowledgeBase = await fetchKnowledgeBase()
      const contextPrompt = generateKnowledgeBaseContext(knowledgeBase)
      
      // Insert knowledge base context as first system message
      messages = [
        { role: 'assistant', content: contextPrompt },
        ...messages
      ]
    }
    
    const response = await cosmic.ai.generateText({
      ...params,
      messages,
      stream: true
    })
    
    return response
  } catch (error) {
    console.error('AI streaming error:', error)
    if (hasStatus(error) && error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    if (hasStatus(error) && error.status === 401) {
      throw new Error('Authentication failed. Please check your API key.')
    }
    throw new Error('Failed to generate AI response. Please try again.')
  }
}

// Generate single AI response without streaming
export async function generateAIResponse(params: Omit<AIGenerateTextParams, 'stream'>) {
  try {
    const response = await cosmic.ai.generateText({
      ...params,
      stream: false
    })
    
    return response
  } catch (error) {
    console.error('AI generation error:', error)
    if (hasStatus(error) && error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    throw new Error('Failed to generate response')
  }
}

// Upload file for AI analysis
export async function uploadFileForAnalysis(file: File, folder = 'chat-uploads'): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('media', file)
    formData.append('folder', folder)
    
    const response = await cosmic.media.insertOne({
      media: file,
      folder
    })
    
    return response.media.url
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error('Failed to upload file')
  }
}

// Get bucket info for client-side usage
export function getBucketInfo() {
  return {
    bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  }
}