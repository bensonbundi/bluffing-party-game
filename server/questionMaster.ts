import { GoogleGenAI, Type } from '@google/genai';
import { Category, DifficultyLevel, GameDifficultyMode, Question } from '../src/types/game';
import { TRIVIA_QUESTIONS, CATEGORIES_LIST } from '../src/data/questions';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface QuestionGenerationOptions {
  category: Category;
  roundNumber: number;
  isCategoryTwist?: boolean;
  count?: number;
  difficultyMode?: GameDifficultyMode;
}

/**
 * Question Master: generates high-school level general knowledge questions,
 * news items, African & Kenyan content, movies, music, and logic trivia.
 */
export async function generateQuestions(options: QuestionGenerationOptions): Promise<Question[]> {
  const { category, roundNumber, isCategoryTwist, count = 1, difficultyMode = 'standard' } = options;

  // Determine computed difficulty based on game mode & round
  let computedDifficulty: DifficultyLevel;
  if (difficultyMode === 'easy') {
    computedDifficulty = 'easy';
  } else if (difficultyMode === 'hard') {
    computedDifficulty = 'hard';
  } else {
    // Standard mode: progressive difficulty
    computedDifficulty = roundNumber === 1 ? 'easy' : roundNumber === 2 ? 'medium' : 'hard';
  }

  if (ai) {
    try {
      const prompt = `You are the AI Question Master for "Bamboozle", a social bluffing trivia party game played on a TV.
Generate ${count} general knowledge trivia questions for the category "${category}".

Target Audience Knowledge Level:
- Someone with general high school education / knowledge level.
- Clear, engaging trivia about news, global events, memorable history, cinema, music, geography.
- Emphasize African content, Kenyan politics and geography (such as Nairobi, Great Rift Valley, Mount Kenya, Lake Victoria, 2010 Constitution, M-Pesa, Mau Mau, Kipchoge), African cinema, Afrobeats, global movies, and world pop culture when relevant to the category.

Assigned Difficulty Level: ${computedDifficulty.toUpperCase()} (${computedDifficulty === 'easy' ? 'broadly known high school facts' : computedDifficulty === 'medium' ? 'interesting curiosities from headlines & culture' : 'fascinating counter-intuitive truths'}).
Round Number: ${roundNumber} ${isCategoryTwist ? '(Category Twist Surprise Round!)' : ''}.

Important Rules for Bluffing Party Games:
1. Question prompt must be clear, concise, and end with a question mark.
2. The correct answer MUST be 100% true, but sound surprisingly unbelievable, comical, or counter-intuitive so players will second-guess it.
3. If category is "Africa & Kenya", highlight real Kenyan geography, landmarks, politics, national achievements, or wildlife.
4. If category is "Movies & TV" or "Music", ask fun questions about famous films, box office records, iconic songs, Afrobeats, and Hollywood/Nollywood trivia.
5. Provide 4 clever, plausible fallback decoy answers (under 8 words each) that sound like believable truths.
6. Provide a 1-sentence "funFact" explaining the story behind the truth.
7. Provide a difficulty level: "easy", "medium", or "hard".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of trivia questions for bluffing game',
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING, description: 'The question text' },
                correctAnswer: { type: Type.STRING, description: 'The true answer' },
                fallbackDecoys: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Four plausible fake answers'
                },
                funFact: { type: Type.STRING, description: 'Short backstory behind the true fact' },
                difficulty: {
                  type: Type.STRING,
                  enum: ['easy', 'medium', 'hard'],
                  description: 'Question difficulty level'
                }
              },
              required: ['prompt', 'correctAnswer', 'fallbackDecoys', 'difficulty']
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            category,
            prompt: item.prompt,
            correctAnswer: item.correctAnswer,
            fallbackDecoys: Array.isArray(item.fallbackDecoys) && item.fallbackDecoys.length >= 2
              ? item.fallbackDecoys
              : ['Something unexpected', 'An ancient superstition', 'A government experiment', 'A famous bet'],
            funFact: item.funFact || 'A truly wild piece of trivia!',
            difficulty: (item.difficulty as DifficultyLevel) || computedDifficulty
          }));
        }
      }
    } catch (err) {
      console.warn('Gemini question generation error, falling back to curated bank:', err);
    }
  }

  // Fallback to curated question bank
  const matchingCat = TRIVIA_QUESTIONS.filter(q => q.category === category);
  const matchingDiff = matchingCat.filter(q => q.difficulty === computedDifficulty);
  const pool = matchingDiff.length > 0 ? matchingDiff : matchingCat.length > 0 ? matchingCat : TRIVIA_QUESTIONS;

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(q => ({
    ...q,
    id: `${q.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
  }));
}

export function getRandomCategory(excludeCategory?: Category): Category {
  const filtered = excludeCategory
    ? CATEGORIES_LIST.filter(c => c !== excludeCategory)
    : CATEGORIES_LIST;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
