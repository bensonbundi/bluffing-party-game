import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, HelpCircle, Image as ImageIcon, Sparkles, Filter, Check, BookOpen, Layers } from 'lucide-react';
import { Category, DifficultyLevel, Question } from '../../types/game';
import { CATEGORIES_LIST, TRIVIA_QUESTIONS } from '../../data/questions';
import { sound } from '../../utils/sound';

interface CustomQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customQuestions?: Question[];
  onAddQuestion: (q: Omit<Question, 'id'>) => void;
  onRemoveQuestion: (id: string) => void;
}

export const CustomQuestionsModal: React.FC<CustomQuestionsModalProps> = ({
  isOpen,
  onClose,
  customQuestions = [],
  onAddQuestion,
  onRemoveQuestion
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'add'>('browse');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  // Form states for adding custom question
  const [prompt, setPrompt] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [category, setCategory] = useState<Category>('General');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [decoy1, setDecoy1] = useState('');
  const [decoy2, setDecoy2] = useState('');
  const [decoy3, setDecoy3] = useState('');
  const [funFact, setFunFact] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Combined full question pool: Curated + Custom
  const fullPool = useMemo(() => {
    return [...customQuestions, ...TRIVIA_QUESTIONS];
  }, [customQuestions]);

  // Filtered pool
  const filteredPool = useMemo(() => {
    return fullPool.filter((q) => {
      const matchCat = selectedCategoryFilter === 'All' || q.category === selectedCategoryFilter;
      const matchDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      return matchCat && matchDiff;
    });
  }, [fullPool, selectedCategoryFilter, difficultyFilter]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !correctAnswer.trim()) return;

    sound.playClick();
    sound.playLockIn();

    const decoys = [decoy1.trim(), decoy2.trim(), decoy3.trim()].filter(Boolean);

    onAddQuestion({
      category,
      prompt: prompt.trim(),
      correctAnswer: correctAnswer.trim(),
      fallbackDecoys: decoys.length >= 2 ? decoys : [
        'A hilarious misunderstanding',
        'A secret dare',
        'An ancient rumor',
        'A lost bet'
      ],
      funFact: funFact.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      difficulty
    });

    // Reset inputs
    setPrompt('');
    setCorrectAnswer('');
    setDecoy1('');
    setDecoy2('');
    setDecoy3('');
    setFunFact('');
    setImageUrl('');
    setSelectedCategoryFilter(category);
    setActiveTab('browse');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Pregame Question Pool</span>
            </h2>
            <p className="text-xs text-slate-400">
              Browse questions by category or add your own trivia to the game deck ({fullPool.length} questions available)
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 gap-4">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('browse');
            }}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Browse by Category ({filteredPool.length})</span>
            {activeTab === 'browse' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('add');
            }}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Custom Question</span>
            {activeTab === 'add' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'browse' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Category Filter Chips Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Category:
              </span>

              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedCategoryFilter('All');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedCategoryFilter === 'All'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({fullPool.length})
              </button>

              {CATEGORIES_LIST.map((cat) => {
                const count = fullPool.filter((q) => q.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategoryFilter(cat);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedCategoryFilter === cat
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="ml-1 opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
              {filteredPool.length === 0 ? (
                <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-400" />
                  <p className="text-sm font-semibold text-slate-300">No questions found in this category</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "+ Add Custom Question" to write the first question for this category!
                  </p>
                </div>
              ) : (
                filteredPool.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start gap-4 shadow-sm hover:border-slate-700 transition-colors"
                  >
                    {/* Picture thumbnail if present */}
                    {q.imageUrl && (
                      <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 bg-slate-900 shadow-sm">
                        <img
                          src={q.imageUrl}
                          alt="Question illustration"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {q.category}
                        </span>

                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            q.difficulty === 'easy'
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                              : q.difficulty === 'medium'
                              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                              : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                          }`}
                        >
                          {q.difficulty} {q.difficulty === 'easy' ? '★☆☆' : q.difficulty === 'medium' ? '★★☆' : '★★★'}
                        </span>

                        {q.isCustom ? (
                          <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">
                            Custom Added
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            Game Deck
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm text-white leading-snug">
                        {q.prompt}
                      </div>

                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px] font-normal">Real Answer:</span>
                        <span>{q.correctAnswer}</span>
                      </div>

                      {q.funFact && (
                        <div className="text-[11px] text-slate-400 italic">
                          "{q.funFact}"
                        </div>
                      )}
                    </div>

                    {q.isCustom && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveQuestion(q.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors self-end md:self-start shrink-0"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Add Custom Question Form */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <form onSubmit={handleAdd} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Difficulty
                  </label>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-700 rounded-xl">
                    {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setDifficulty(level);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          difficulty === level
                            ? level === 'easy'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                              : level === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {level === 'easy' ? '★ Easy' : level === 'medium' ? '★★ Med' : '★★★ Hard'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Question Prompt *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. In 2010, what major constitutional change created 47 county governments in Kenya?"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  The Real Correct Answer *
                </label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  required
                  placeholder="The true, 100% factual answer"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-bold text-emerald-400 placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Fallback Believable Lies (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={decoy1}
                    onChange={(e) => setDecoy1(e.target.value)}
                    placeholder="Decoy lie #1"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={decoy2}
                    onChange={(e) => setDecoy2(e.target.value)}
                    placeholder="Decoy lie #2"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={decoy3}
                    onChange={(e) => setDecoy3(e.target.value)}
                    placeholder="Decoy lie #3"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Picture Above Question (Optional Image URL)</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg or leave blank"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backstory / Fun Fact (Optional)</span>
                </label>
                <input
                  type="text"
                  value={funFact}
                  onChange={(e) => setFunFact(e.target.value)}
                  placeholder="Short explanation revealed after the truth is shown"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-display font-extrabold text-sm tracking-wide bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ADD TO QUESTION POOL</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
