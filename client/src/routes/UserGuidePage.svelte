<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import { auth, user } from "$lib/stores/auth";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import Container from "$lib/components/layout/Container.svelte";
  import {
    BookOpen,
    CheckCircle,
    Trophy,
    Zap,
    TrendingUp,
    Target,
    Award,
    Flame,
    ClipboardList,
  } from "lucide-svelte";

  onMount(async () => {
    const currentUser = await auth.checkSession();
    if (!currentUser) {
      push("/login");
      return;
    }
  });

  type Tab = "modes" | "tests" | "scoring" | "tips";
  let activeTab: Tab = "modes";

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "modes", label: "Study Modes", icon: BookOpen },
    { id: "tests", label: "Tests", icon: ClipboardList },
    { id: "scoring", label: "Scoring", icon: Trophy },
    { id: "tips", label: "Tips", icon: CheckCircle },
  ];
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header user={$user} />

  <Container>
    <div class="py-8 space-y-6">
      <!-- Page Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          User Guide
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Master VocabQuest with these tips and strategies.
        </p>
        <div class="mt-6 flex justify-center">
          <img
            src="/assets/mascot/base.png"
            alt="Explorer Fox"
            class="w-32 h-auto drop-shadow-lg mix-blend-multiply dark:mix-blend-normal"
          />
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 shadow-sm">
        {#each tabs as tab}
          <button
            type="button"
            on:click={() => (activeTab = tab.id)}
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {activeTab === tab.id
              ? 'bg-teal-600 text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
          >
            <svelte:component this={tab.icon} class="w-4 h-4 flex-shrink-0" />
            <span class="hidden sm:inline">{tab.label}</span>
          </button>
        {/each}
      </div>

      <!-- ─── Modes Tab ────────────────────────────────────────────────────── -->
      {#if activeTab === "modes"}
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <BookOpen class="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Study Modes</h2>
          </div>

          <!-- Practice -->
          <div class="border-l-4 border-teal-500 pl-4 space-y-2">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Practice</h3>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">10 XP / card</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Classic flip-card mode. Click to reveal the definition, then mark it Known or Not Yet.</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
              <li class="flex items-start gap-2"><span class="text-teal-500 mt-0.5">•</span> Best for first exposure to new vocabulary</li>
              <li class="flex items-start gap-2"><span class="text-teal-500 mt-0.5">•</span> "I Know It" moves the word to Learned and removes it from the set</li>
              <li class="flex items-start gap-2"><span class="text-teal-500 mt-0.5">•</span> "Not Yet" keeps it in rotation for more practice</li>
            </ul>
          </div>

          <!-- Quiz -->
          <div class="border-l-4 border-sky-500 pl-4 space-y-2">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quiz</h3>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">15 XP / card</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Choose the correct definition from 4 options. Great for reinforcing and reviewing knowledge.</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
              <li class="flex items-start gap-2"><span class="text-sky-500 mt-0.5">•</span> Immediate feedback — correct answer highlighted after selection</li>
              <li class="flex items-start gap-2"><span class="text-sky-500 mt-0.5">•</span> Distractors drawn from words with the same part of speech</li>
            </ul>
          </div>

          <!-- Typing -->
          <div class="border-l-4 border-rose-500 pl-4 space-y-2">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Typing</h3>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">20 XP / card</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">You see the definition — type the vocabulary word. Case-insensitive, must be spelled correctly.</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
              <li class="flex items-start gap-2"><span class="text-rose-500 mt-0.5">•</span> Press Enter to submit</li>
              <li class="flex items-start gap-2"><span class="text-rose-500 mt-0.5">•</span> Use hints (up to 3) if you're stuck — they reveal more letters each time</li>
            </ul>
          </div>

          <!-- Context -->
          <div class="border-l-4 border-purple-500 pl-4 space-y-2">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Context</h3>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">15 XP / card</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1"><Zap class="w-3 h-3" />Advanced: 20 XP</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">A sentence with a blank is shown. Identify the missing word from multiple choice options.</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
              <li class="flex items-start gap-2"><span class="text-purple-500 mt-0.5">•</span> Helps you understand words in real sentences</li>
              <li class="flex items-start gap-2"><span class="text-purple-500 mt-0.5">•</span> Falls back to definition-based selection if no example sentence exists</li>
              <li class="flex items-start gap-2"><span class="text-amber-500 mt-0.5">⚡</span> <strong>Advanced mode:</strong> Type the word instead of selecting from options</li>
            </ul>
          </div>

          <!-- Relate -->
          <div class="border-l-4 border-orange-500 pl-4 space-y-2">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Relate</h3>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">15 XP / card</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1"><Zap class="w-3 h-3" />Advanced: 20 XP</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">A word is shown with a badge — either "Find a Synonym" (≈) or "Find an Antonym" (≠). Choose from 4 options.</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
              <li class="flex items-start gap-2"><span class="text-orange-500 mt-0.5">•</span> Synonym/antonym type is chosen randomly for variety</li>
              <li class="flex items-start gap-2"><span class="text-orange-500 mt-0.5">•</span> Falls back to definition quiz if the word has no synonyms/antonyms</li>
              <li class="flex items-start gap-2"><span class="text-amber-500 mt-0.5">⚡</span> <strong>Advanced mode:</strong> Type any valid synonym or antonym instead</li>
            </ul>
          </div>

          <!-- Advanced toggle info -->
          <div class="mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div class="flex items-center gap-2 mb-2">
              <Zap class="w-4 h-4 text-amber-500" />
              <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">Advanced Toggle</p>
            </div>
            <p class="text-sm text-amber-700 dark:text-amber-400">
              The <strong>Advanced</strong> toggle in the control bar switches Context and Relate modes from multiple-choice to typed answers. It only activates when you're in one of those modes. Advanced answers earn <strong>20 XP</strong> instead of 15.
            </p>
          </div>
        </div>

      <!-- ─── Tests Tab ────────────────────────────────────────────────────── -->
      {:else if activeTab === "tests"}
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <ClipboardList class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Tests</h2>
          </div>

          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Tests are formal assessments where you answer a fixed number of questions spanning one or more modes. Navigate to <strong>Test</strong> in the header to get started.
          </p>

          <!-- How tests work -->
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target class="w-4 h-4 text-indigo-500" /> How Tests Work
            </h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li class="flex items-start gap-2"><span class="text-indigo-500 mt-0.5">1.</span> Choose a question count (10–100) and select the modes to include</li>
              <li class="flex items-start gap-2"><span class="text-indigo-500 mt-0.5">2.</span> Questions rotate through your selected modes in order (Quiz → Typing → Quiz → …)</li>
              <li class="flex items-start gap-2"><span class="text-indigo-500 mt-0.5">3.</span> Words are prioritized by spaced repetition — due-for-review words appear first</li>
              <li class="flex items-start gap-2"><span class="text-indigo-500 mt-0.5">4.</span> After all questions, you see a results page with your score, accuracy, and XP earned</li>
            </ul>
          </div>

          <!-- Test modes + XP -->
          <div class="space-y-3">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap class="w-4 h-4 text-amber-500" /> XP per Correct Answer (Test)
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p class="text-sm font-semibold text-purple-700 dark:text-purple-300">Quiz</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">10 XP</p>
              </div>
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm font-semibold text-blue-700 dark:text-blue-300">Typing</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">15 XP</p>
              </div>
              <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Context (standard)</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">10 XP</p>
              </div>
              <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-2 border-amber-300 dark:border-amber-600">
                <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1"><Zap class="w-3 h-3 text-amber-500" />Context (advanced)</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">15 XP</p>
              </div>
              <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p class="text-sm font-semibold text-orange-700 dark:text-orange-300">Relate (standard)</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">10 XP</p>
              </div>
              <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-amber-300 dark:border-amber-600">
                <p class="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1"><Zap class="w-3 h-3 text-amber-500" />Relate (advanced)</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">15 XP</p>
              </div>
            </div>
          </div>

          <!-- Length bonus -->
          <div class="space-y-3">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-teal-500" /> Length Bonus
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Longer tests multiply your total XP. The bonus scales from 1.0× at 10 questions up to 1.5× at 100 questions.
            </p>
            <div class="grid grid-cols-4 gap-2 text-center text-sm">
              {#each [["10 Q", "1.00×"], ["25 Q", "1.08×"], ["50 Q", "1.22×"], ["100 Q", "1.50×"]] as [q, b]}
                <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p class="font-semibold text-gray-900 dark:text-white">{b}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{q}</p>
                </div>
              {/each}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Formula: Total XP = round(base XP × length multiplier). Test results also update your spaced-repetition progress for each word answered.
            </p>
          </div>
        </div>

      <!-- ─── Scoring Tab ──────────────────────────────────────────────────── -->
      {:else if activeTab === "scoring"}
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <Trophy class="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Scoring System</h2>
          </div>

          <!-- Flashcard XP table -->
          <div class="space-y-3">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap class="w-4 h-4 text-yellow-500" /> Base XP per Correct Answer (Flashcard)
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Mode</th>
                    <th class="text-right py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Standard</th>
                    <th class="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Advanced</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr><td class="py-2 pr-4 text-gray-700 dark:text-gray-300">Practice</td><td class="text-right py-2 pr-4 font-semibold text-gray-900 dark:text-white">10 XP</td><td class="text-right py-2 text-gray-400">—</td></tr>
                  <tr><td class="py-2 pr-4 text-gray-700 dark:text-gray-300">Quiz</td><td class="text-right py-2 pr-4 font-semibold text-gray-900 dark:text-white">15 XP</td><td class="text-right py-2 text-gray-400">—</td></tr>
                  <tr><td class="py-2 pr-4 text-gray-700 dark:text-gray-300">Typing</td><td class="text-right py-2 pr-4 font-semibold text-gray-900 dark:text-white">20 XP</td><td class="text-right py-2 text-gray-400">—</td></tr>
                  <tr><td class="py-2 pr-4 text-gray-700 dark:text-gray-300">Context</td><td class="text-right py-2 pr-4 font-semibold text-gray-900 dark:text-white">15 XP</td><td class="text-right py-2 font-semibold text-amber-600 dark:text-amber-400">20 XP</td></tr>
                  <tr><td class="py-2 pr-4 text-gray-700 dark:text-gray-300">Relate</td><td class="text-right py-2 pr-4 font-semibold text-gray-900 dark:text-white">15 XP</td><td class="text-right py-2 font-semibold text-amber-600 dark:text-amber-400">20 XP</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Streak bonus -->
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Flame class="w-4 h-4 text-orange-500" /> Correct-Answer Streak Bonus
            </h3>
            <div class="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>Each consecutive correct answer in flashcard mode adds <strong>+1 XP</strong> to that card's reward.</p>
              <p>A wrong answer resets the streak to 0. Example: 5th correct answer in a row adds +5 XP on top of the base.</p>
            </div>
          </div>

          <!-- Set completion -->
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy class="w-4 h-4 text-yellow-500" /> Set Completion Bonus
            </h3>
            <div class="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>Earn <strong>+50 XP</strong> when you answer every card in a set correctly. Skipping cards (New Set button) forfeits the bonus.</p>
            </div>
          </div>

          <!-- Difficulty bonus -->
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-green-500" /> Difficulty Bonus
            </h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">•</span> Up to <strong>50% bonus</strong> based on your historical error rate with a word</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">•</span> <strong>20% bonus</strong> for words with a very low ease factor</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">•</span> <strong>15% bonus</strong> for words reviewed after 7+ days (long-term retention)</li>
            </ul>
          </div>

          <!-- Formula -->
          <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
            Flashcard XP = (Base XP + Difficulty Bonus) × Streak Bonus
          </div>

          <!-- Levels -->
          <div class="space-y-3">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Award class="w-4 h-4 text-purple-500" /> Levels
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Your level is calculated as: <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">Level = √(Total XP / 100) + 1</code>
            </p>
            <div class="grid grid-cols-4 gap-2 text-center text-sm">
              {#each [["Lv 2", "100 XP"], ["Lv 3", "400 XP"], ["Lv 5", "1,600 XP"], ["Lv 10", "8,100 XP"]] as [lv, xp]}
                <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p class="font-bold text-purple-700 dark:text-purple-300">{lv}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{xp}</p>
                </div>
              {/each}
            </div>
          </div>
        </div>

      <!-- ─── Tips Tab ─────────────────────────────────────────────────────── -->
      {:else if activeTab === "tips"}
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-3 mb-2">
            <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Pro Tips</h2>
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <span class="text-2xl">📚</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Progress through the modes</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">Start with Practice to learn a word, move to Quiz and Context to test yourself, then Typing or Advanced modes to master it. Switching modes always advances to a fresh card so you can't preview a card in one mode and answer it in another.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <span class="text-2xl">⚡</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Use Advanced mode for a challenge</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">Toggle Advanced in the control bar when you feel ready. Context and Relate switch to typing mode for 20 XP per card — harder but much more rewarding.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <span class="text-2xl">📋</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Take tests to earn bonus XP</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">Longer tests earn up to 1.5× XP multiplier. Combine Typing + Advanced Context for the highest XP per question. Test results also count toward your spaced-repetition progress.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span class="text-2xl">🔥</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Build your streak</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">Each consecutive correct answer in flashcard mode adds +1 XP. A long streak in Typing or Advanced mode can add up fast!</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span class="text-2xl">📅</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Maintain your daily streak</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">Even 5 minutes a day builds consistency and long-term retention. Your daily streak is visible in the top bar.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span class="text-2xl">🔍</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Filter by part of speech</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">Use the POS filter in the control bar to focus on nouns, verbs, adjectives, or adverbs in a single session. Great for targeted exam prep.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
              <span class="text-2xl">🏆</span>
              <div>
                <strong class="text-gray-900 dark:text-white block mb-1">Complete full sets for the bonus</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">The +50 XP set completion bonus is only awarded if you answer every card in the set. Use New Set sparingly to keep your bonus intact.</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </Container>

  <Footer />
</div>
