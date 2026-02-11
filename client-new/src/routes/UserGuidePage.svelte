<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { auth, user } from '$lib/stores/auth';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Container from '$lib/components/layout/Container.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { 
    BookOpen, 
    CheckCircle, 
    Keyboard, 
    Trophy, 
    Zap, 
    TrendingUp,
    Target,
    Award,
    Flame
  } from 'lucide-svelte';

  onMount(async () => {
    const currentUser = await auth.checkSession();
    if (!currentUser) {
      push('/login');
      return;
    }
  });
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <Container>
    <div class="py-8 space-y-8">
      <!-- Page Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          User Guide
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Master VocabQuest with these tips and strategies
        </p>
      </div>

      <!-- Study Modes -->
      <Card>
        <div class="p-6 space-y-6">
          <div class="flex items-center gap-3 mb-4">
            <BookOpen class="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Study Modes
            </h2>
          </div>

          <div class="space-y-6">
            <!-- Practice Mode -->
            <div class="border-l-4 border-teal-500 pl-4">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Practice Mode
                </h3>
                <Badge variant="success" size="sm">10 XP per card</Badge>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-3">
                The classic flashcard experience for learning new words.
              </p>
              <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                <li class="flex items-start gap-2">
                  <span class="text-teal-500 mt-1">•</span>
                  <span>Click cards to flip and reveal definitions</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-teal-500 mt-1">•</span>
                  <span>Mark words as "I Know It" or "Not Yet" to track progress</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-teal-500 mt-1">•</span>
                  <span>Best for first exposure to new vocabulary</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-teal-500 mt-1">•</span>
                  <span>Earn <strong>10 XP</strong> per correct answer</span>
                </li>
              </ul>
            </div>

            <!-- Quiz Mode -->
            <div class="border-l-4 border-blue-500 pl-4">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Quiz Mode
                </h3>
                <Badge variant="info" size="sm">15 XP per card</Badge>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-3">
                Test your knowledge with multiple choice questions.
              </p>
              <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span>Choose the correct definition from 4 options</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span>Immediate feedback with correct answer highlighted</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span>Great for reviewing and reinforcing knowledge</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span>Earn <strong>15 XP</strong> per correct answer (50% bonus!)</span>
                </li>
              </ul>
            </div>

            <!-- Typing Mode -->
            <div class="border-l-4 border-purple-500 pl-4">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Typing Mode
                </h3>
                <Badge variant="warning" size="sm">20 XP per card</Badge>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-3">
                The ultimate challenge - spell the word correctly.
              </p>
              <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                <li class="flex items-start gap-2">
                  <span class="text-purple-500 mt-1">•</span>
                  <span>Type the vocabulary word when shown its definition</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-purple-500 mt-1">•</span>
                  <span>Press Enter to submit your answer</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-purple-500 mt-1">•</span>
                  <span>Must spell exactly correct (case insensitive)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-purple-500 mt-1">•</span>
                  <span>Earn <strong>20 XP</strong> per correct answer (2x bonus!)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <!-- Scoring System -->
      <Card>
        <div class="p-6 space-y-6">
          <div class="flex items-center gap-3 mb-4">
            <Trophy class="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Scoring System
            </h2>
          </div>

          <div class="space-y-6">
            <!-- Base XP -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Zap class="w-5 h-5 text-yellow-500" />
                Base XP by Mode
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">10 XP</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Practice Mode</div>
                </div>
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">15 XP</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Quiz Mode</div>
                </div>
                <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">20 XP</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Typing Mode</div>
                </div>
              </div>
            </div>

            <!-- Streak Bonus -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Flame class="w-5 h-5 text-orange-500" />
                Correct Answer Streak Bonus
              </h3>
              <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg">
                <p class="text-gray-700 dark:text-gray-300 mb-3">
                  Build momentum by answering cards correctly in a row!
                </p>
                <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                  <li class="flex items-start gap-2">
                    <span class="text-orange-500 mt-1">•</span>
                    <span>Starts at <strong>0</strong> bonus XP</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-500 mt-1">•</span>
                    <span>Increases by <strong>+1 XP</strong> for each consecutive correct answer</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-500 mt-1">•</span>
                    <span>Resets to 0 when you get an answer incorrect</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-500 mt-1">•</span>
                    <span><strong>Example:</strong> On your 5th correct answer in a row, you earn +5 bonus XP</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Set Completion Bonus -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Trophy class="w-5 h-5 text-yellow-500" />
                Set Completion Bonus
              </h3>
              <div class="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg">
                <p class="text-gray-700 dark:text-gray-300 mb-3">
                  Complete all cards in a set to earn a big bonus!
                </p>
                <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span>Earn <strong>+50 XP</strong> when you complete all cards in a set</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span>A new set automatically loads after completion</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span>Your completed sets count is tracked during each session</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-yellow-500 mt-1">•</span>
                    <span><strong>Tip:</strong> Cards you answer correctly are removed from the active set</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Difficulty Bonus -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp class="w-5 h-5 text-green-500" />
                Difficulty Bonus
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-3">
                Harder words are worth more XP! The system automatically tracks which words you struggle with:
              </p>
              <ul class="space-y-2 text-gray-600 dark:text-gray-400">
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>Up to 50% bonus</strong> based on your historical error rate with each word</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>20% bonus</strong> for words with very low ease factor (very difficult)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-1">•</span>
                  <span><strong>15% bonus</strong> for words reviewed after 7+ days (long-term retention)</span>
                </li>
              </ul>
            </div>

            <!-- Total XP Calculation -->
            <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target class="w-5 h-5 text-teal-500" />
                How Total XP is Calculated
              </h3>
              <div class="bg-white dark:bg-gray-700 p-4 rounded border-2 border-teal-500 font-mono text-sm">
                <div class="text-gray-900 dark:text-white">
                  Total XP = Base XP + Difficulty Bonus + Streak Bonus
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mt-3 text-sm">
                <strong>Example:</strong> Typing mode (20 XP) + difficult word bonus (30%) + 3-card streak (+3) = 
                <strong class="text-teal-600 dark:text-teal-400">29 XP</strong>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Levels & Progression -->
      <Card>
        <div class="p-6 space-y-6">
          <div class="flex items-center gap-3 mb-4">
            <Award class="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Levels & Progression
            </h2>
          </div>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              Your level increases as you earn XP. Each new level requires more XP than the last:
            </p>

            <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
              <div class="font-mono text-sm text-gray-700 dark:text-gray-300">
                Level = √(Total XP / 100) + 1
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">Level 2</div>
                <div class="text-xs text-gray-500">100 XP</div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">Level 3</div>
                <div class="text-xs text-gray-500">400 XP</div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">Level 5</div>
                <div class="text-xs text-gray-500">1,600 XP</div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">Level 10</div>
                <div class="text-xs text-gray-500">8,100 XP</div>
              </div>
            </div>

            <p class="text-gray-600 dark:text-gray-400">
              <strong>Daily Streak:</strong> Study at least one card each day to build your daily streak. 
              The longer your streak, the more consistent your vocabulary improvement!
            </p>
          </div>
        </div>
      </Card>

      <!-- Pro Tips -->
      <Card>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <CheckCircle class="w-7 h-7 text-green-600 dark:text-green-400" />
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Pro Tips
            </h2>
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span class="text-2xl">💡</span>
              <div>
                <strong class="text-gray-900 dark:text-white">Mix up your modes:</strong>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Start with Practice to learn, then use Quiz to test, and finally Typing to master.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span class="text-2xl">🎯</span>
              <div>
                <strong class="text-gray-900 dark:text-white">Focus on difficult words:</strong>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Check your Stats page to see which words you struggle with most.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span class="text-2xl">🔥</span>
              <div>
                <strong class="text-gray-900 dark:text-white">Build streaks in Typing mode:</strong>
                <p class="text-gray-600 dark:text-gray-400 text-sm">The 2x XP base plus streak bonuses can earn massive points!</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span class="text-2xl">📅</span>
              <div>
                <strong class="text-gray-900 dark:text-white">Maintain your daily streak:</strong>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Even 5 minutes a day helps build consistency and long-term retention.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <span class="text-2xl">🔍</span>
              <div>
                <strong class="text-gray-900 dark:text-white">Use filters strategically:</strong>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Filter by part of speech (nouns, verbs, etc.) to focus your study sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </Container>
  
  <Footer />
</div>
