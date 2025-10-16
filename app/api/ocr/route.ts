import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // OCR text parsing doesn't require authentication
    // The actual expense creation will require auth
    const body = await request.json()
    const { extractedText } = body

    if (!extractedText) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Parse the extracted text to find amount, description, and potential category
    const parsedData = parseReceiptText(extractedText)

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error processing OCR:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function parseReceiptText(text: string): {
  amount: number | null
  description: string
  category: string
  merchant: string | null
  date: string | null
} {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase()
  
  // Extract amount - look for currency symbols and numbers
  let amount: number | null = null
  const amountPatterns = [
    /(?:rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi,
    /(?:total|amount|subtotal|grand total)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/gi,
    /(\d+(?:,\d+)*\.\d{2})/g,
  ]
  
  for (const pattern of amountPatterns) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Get the last match (usually the total)
      const lastMatch = matches[matches.length - 1]
      const numStr = lastMatch.replace(/[^\d.]/g, '')
      amount = parseFloat(numStr)
      if (!isNaN(amount) && amount > 0) {
        break
      }
    }
  }

  // Extract merchant/store name (usually at the top)
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  let merchant: string | null = null
  if (lines.length > 0) {
    // Take first non-empty line as potential merchant name
    merchant = lines[0].trim()
  }

  // Extract date
  let date: string | null = null
  const datePatterns = [
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      date = match[1]
      break
    }
  }

  // Determine category based on keywords
  const category = determineCategoryFromText(lowerText, merchant)

  // Create description
  let description = merchant || 'Expense from receipt'
  if (amount) {
    description += ` - ₹${amount.toFixed(2)}`
  }

  return {
    amount,
    description,
    category,
    merchant,
    date,
  }
}

function determineCategoryFromText(text: string, merchant: string | null): string {
  const categoryKeywords: { [key: string]: string[] } = {
    'food': ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'pizza', 'burger', 'kfc', 'mcdonald', 'subway', 'domino'],
    'transport': ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'gas', 'parking', 'metro', 'bus', 'train'],
    'shopping': ['mall', 'store', 'shop', 'market', 'retail', 'amazon', 'flipkart', 'clothing', 'fashion'],
    'entertainment': ['movie', 'cinema', 'theater', 'concert', 'entertainment', 'pvr', 'inox'],
    'health': ['hospital', 'clinic', 'pharmacy', 'medical', 'doctor', 'health', 'medicine', 'apollo'],
    'utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'bill', 'recharge'],
    'housing': ['rent', 'mortgage', 'housing', 'apartment', 'maintenance'],
    'education': ['school', 'college', 'university', 'course', 'tuition', 'education', 'book'],
    'fitness': ['gym', 'fitness', 'sports', 'yoga', 'workout'],
  }

  const merchantLower = merchant?.toLowerCase() || ''
  const combinedText = `${text} ${merchantLower}`

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        return category
      }
    }
  }

  return 'other'
}
