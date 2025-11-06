import OpenAI from 'openai'

export interface LanguageDetectionResult {
  language: string // ISO 639-1 code (e.g., 'en', 'ar', 'es')
  confidence: 'high' | 'medium' | 'low'
  languageName: string // Full name (e.g., 'English', 'Arabic', 'Spanish')
}

export class LanguageDetectorService {
  private client: OpenAI

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for language detection')
    }
    this.client = new OpenAI({ apiKey })
  }

  /**
   * Detect the language of the given text
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      // Truncate text to first 500 characters for efficiency
      const sampleText = text.substring(0, 500)

      const prompt = `Detect the language of this text. Respond with valid JSON only.

Text: "${sampleText}"

Respond with:
{
  "language": "<ISO 639-1 code like 'en', 'ar', 'es', 'fr', 'de', 'zh', 'ja', 'hi', 'tr', 'fa', 'ur', 'pt', 'it', 'sv'>",
  "confidence": "high" | "medium" | "low",
  "languageName": "<full language name like 'English', 'Arabic', 'Spanish'>"
}`

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a language detection assistant. Respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
        response_format: { type: 'json_object' },
      })

      const responseText = completion.choices[0]?.message?.content
      if (!responseText) {
        throw new Error('No response from language detector')
      }

      const result = JSON.parse(responseText) as LanguageDetectionResult

      console.log(`Detected language: ${result.languageName} (${result.language}) - confidence: ${result.confidence}`)

      return result
    } catch (error) {
      console.error('Language detection error:', error)
      // Default to English if detection fails
      return {
        language: 'en',
        confidence: 'low',
        languageName: 'English',
      }
    }
  }

  /**
   * Get supported languages for AskNews
   * Common language codes that AskNews likely supports
   */
  getSupportedLanguages(): string[] {
    return [
      'en', // English
      'ar', // Arabic
      'es', // Spanish
      'fr', // French
      'de', // German
      'pt', // Portuguese
      'zh', // Chinese
      'ja', // Japanese
      'hi', // Hindi
      'tr', // Turkish
      'fa', // Farsi/Persian
      'ur', // Urdu
      'it', // Italian
      'sv', // Swedish
      'ru', // Russian
      'ko', // Korean
      'nl', // Dutch
      'pl', // Polish
    ]
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.getSupportedLanguages().includes(languageCode.toLowerCase())
  }
}
