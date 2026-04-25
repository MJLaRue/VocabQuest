require('dotenv').config();
const { Vocabulary } = require('../models');
const { sequelize } = require('../config/db');

// Curated enrichment data for ~100 common HSPT vocabulary words.
// Each entry includes an example sentence (containing the exact word),
// 2-4 synonyms, and 2-4 antonyms.
const enrichmentData = {
  'abhor': {
    exampleSentence: 'Most people abhor cruelty toward animals.',
    synonyms: ['despise', 'detest', 'loathe'],
    antonyms: ['love', 'admire', 'cherish']
  },
  'abrupt': {
    exampleSentence: 'The abrupt ending of the movie left the audience confused.',
    synonyms: ['sudden', 'unexpected', 'hasty'],
    antonyms: ['gradual', 'slow', 'expected']
  },
  'abundant': {
    exampleSentence: 'The garden produced an abundant harvest of tomatoes this summer.',
    synonyms: ['plentiful', 'ample', 'copious'],
    antonyms: ['scarce', 'sparse', 'meager']
  },
  'accelerate': {
    exampleSentence: 'The car began to accelerate as it merged onto the highway.',
    synonyms: ['speed up', 'hasten', 'quicken'],
    antonyms: ['slow down', 'decelerate', 'delay']
  },
  'accommodate': {
    exampleSentence: 'The hotel can accommodate up to three hundred guests.',
    synonyms: ['house', 'shelter', 'fit'],
    antonyms: ['reject', 'turn away', 'exclude']
  },
  'accumulate': {
    exampleSentence: 'Dust will accumulate on shelves if you do not clean regularly.',
    synonyms: ['gather', 'collect', 'amass'],
    antonyms: ['scatter', 'disperse', 'distribute']
  },
  'adamant': {
    exampleSentence: 'She was adamant about finishing her homework before watching television.',
    synonyms: ['determined', 'firm', 'resolute'],
    antonyms: ['flexible', 'yielding', 'uncertain']
  },
  'adept': {
    exampleSentence: 'He is adept at solving math problems quickly.',
    synonyms: ['skillful', 'proficient', 'capable'],
    antonyms: ['clumsy', 'incompetent', 'unskilled']
  },
  'adversary': {
    exampleSentence: 'The two chess players had been each other\'s adversary for years.',
    synonyms: ['opponent', 'rival', 'enemy'],
    antonyms: ['ally', 'friend', 'partner']
  },
  'advocate': {
    exampleSentence: 'Teachers advocate for more time devoted to reading in schools.',
    synonyms: ['support', 'promote', 'champion'],
    antonyms: ['oppose', 'resist', 'reject']
  },
  'affluent': {
    exampleSentence: 'The affluent neighborhood had large houses and well-kept lawns.',
    synonyms: ['wealthy', 'rich', 'prosperous'],
    antonyms: ['poor', 'destitute', 'impoverished']
  },
  'alleviate': {
    exampleSentence: 'A cold compress can help alleviate the pain from a headache.',
    synonyms: ['relieve', 'ease', 'reduce'],
    antonyms: ['worsen', 'aggravate', 'intensify']
  },
  'ambiguous': {
    exampleSentence: 'The instructions were so ambiguous that nobody knew what to do.',
    synonyms: ['unclear', 'vague', 'confusing'],
    antonyms: ['clear', 'obvious', 'definite']
  },
  'amiable': {
    exampleSentence: 'Our new neighbor is very amiable and always waves hello.',
    synonyms: ['friendly', 'pleasant', 'kind'],
    antonyms: ['hostile', 'unfriendly', 'cold']
  },
  'ample': {
    exampleSentence: 'There was ample time to study before the big test.',
    synonyms: ['plenty', 'sufficient', 'abundant'],
    antonyms: ['insufficient', 'scarce', 'meager']
  },
  'animosity': {
    exampleSentence: 'There was deep animosity between the two rival teams.',
    synonyms: ['hostility', 'hatred', 'resentment'],
    antonyms: ['friendship', 'goodwill', 'affection']
  },
  'apprehensive': {
    exampleSentence: 'She felt apprehensive before her first day at a new school.',
    synonyms: ['nervous', 'anxious', 'worried'],
    antonyms: ['confident', 'calm', 'fearless']
  },
  'arduous': {
    exampleSentence: 'Climbing the mountain was an arduous journey that took all day.',
    synonyms: ['difficult', 'strenuous', 'tough'],
    antonyms: ['easy', 'simple', 'effortless']
  },
  'arrogant': {
    exampleSentence: 'The arrogant student bragged about his grades to everyone.',
    synonyms: ['conceited', 'pompous', 'haughty'],
    antonyms: ['humble', 'modest', 'meek']
  },
  'astute': {
    exampleSentence: 'The astute detective noticed a tiny detail that solved the case.',
    synonyms: ['sharp', 'clever', 'shrewd'],
    antonyms: ['foolish', 'naive', 'dull']
  },
  'baffle': {
    exampleSentence: 'The magician\'s tricks continued to baffle the audience.',
    synonyms: ['confuse', 'puzzle', 'bewilder'],
    antonyms: ['clarify', 'explain', 'enlighten']
  },
  'belligerent': {
    exampleSentence: 'The belligerent player was ejected from the game for fighting.',
    synonyms: ['aggressive', 'hostile', 'combative'],
    antonyms: ['peaceful', 'friendly', 'calm']
  },
  'benevolent': {
    exampleSentence: 'The benevolent woman donated food to the shelter every week.',
    synonyms: ['charitable', 'generous', 'kind'],
    antonyms: ['selfish', 'cruel', 'malicious']
  },
  'candid': {
    exampleSentence: 'Her candid review of the book pointed out both strengths and weaknesses.',
    synonyms: ['honest', 'frank', 'straightforward'],
    antonyms: ['dishonest', 'deceitful', 'secretive']
  },
  'captivate': {
    exampleSentence: 'The storyteller managed to captivate every student in the room.',
    synonyms: ['enchant', 'fascinate', 'charm'],
    antonyms: ['bore', 'repel', 'disgust']
  },
  'censure': {
    exampleSentence: 'The principal had to censure the student for cheating on the exam.',
    synonyms: ['criticize', 'condemn', 'rebuke'],
    antonyms: ['praise', 'commend', 'approve']
  },
  'chaotic': {
    exampleSentence: 'The classroom became chaotic when the fire alarm went off.',
    synonyms: ['disorderly', 'hectic', 'confused'],
    antonyms: ['orderly', 'calm', 'organized']
  },
  'collaborate': {
    exampleSentence: 'The students decided to collaborate on the science project.',
    synonyms: ['cooperate', 'work together', 'partner'],
    antonyms: ['compete', 'oppose', 'separate']
  },
  'compassion': {
    exampleSentence: 'She showed great compassion by helping the injured bird.',
    synonyms: ['sympathy', 'kindness', 'empathy'],
    antonyms: ['cruelty', 'indifference', 'harshness']
  },
  'compel': {
    exampleSentence: 'The evidence will compel the jury to reach a guilty verdict.',
    synonyms: ['force', 'oblige', 'require'],
    antonyms: ['discourage', 'deter', 'prevent']
  },
  'concise': {
    exampleSentence: 'A good essay is concise and does not include unnecessary words.',
    synonyms: ['brief', 'succinct', 'short'],
    antonyms: ['verbose', 'wordy', 'lengthy']
  },
  'conspicuous': {
    exampleSentence: 'His bright red jacket made him conspicuous in the crowd.',
    synonyms: ['obvious', 'noticeable', 'prominent'],
    antonyms: ['hidden', 'inconspicuous', 'subtle']
  },
  'contemplate': {
    exampleSentence: 'She liked to sit by the lake and contemplate the meaning of life.',
    synonyms: ['consider', 'ponder', 'reflect'],
    antonyms: ['ignore', 'disregard', 'dismiss']
  },
  'credible': {
    exampleSentence: 'The witness gave a credible account of what happened.',
    synonyms: ['believable', 'trustworthy', 'reliable'],
    antonyms: ['unbelievable', 'doubtful', 'questionable']
  },
  'cunning': {
    exampleSentence: 'The cunning fox found a way to sneak into the henhouse.',
    synonyms: ['sly', 'crafty', 'clever'],
    antonyms: ['honest', 'naive', 'straightforward']
  },
  'debilitating': {
    exampleSentence: 'The flu can be debilitating and keep you in bed for days.',
    synonyms: ['weakening', 'draining', 'crippling'],
    antonyms: ['strengthening', 'invigorating', 'energizing']
  },
  'deter': {
    exampleSentence: 'A good lock can deter thieves from breaking in.',
    synonyms: ['discourage', 'prevent', 'hinder'],
    antonyms: ['encourage', 'motivate', 'promote']
  },
  'diligent': {
    exampleSentence: 'The diligent student always completed assignments ahead of schedule.',
    synonyms: ['hardworking', 'careful', 'thorough'],
    antonyms: ['lazy', 'careless', 'negligent']
  },
  'diminish': {
    exampleSentence: 'The sound of thunder began to diminish as the storm moved away.',
    synonyms: ['decrease', 'reduce', 'lessen'],
    antonyms: ['increase', 'grow', 'expand']
  },
  'disclose': {
    exampleSentence: 'The reporter refused to disclose the name of her secret source.',
    synonyms: ['reveal', 'expose', 'divulge'],
    antonyms: ['conceal', 'hide', 'withhold']
  },
  'dormant': {
    exampleSentence: 'The volcano had been dormant for hundreds of years before it erupted.',
    synonyms: ['inactive', 'sleeping', 'idle'],
    antonyms: ['active', 'awake', 'alert']
  },
  'durable': {
    exampleSentence: 'These hiking boots are durable enough to last for many years.',
    synonyms: ['sturdy', 'strong', 'lasting'],
    antonyms: ['fragile', 'flimsy', 'weak']
  },
  'eloquent': {
    exampleSentence: 'The valedictorian gave an eloquent speech at graduation.',
    synonyms: ['articulate', 'expressive', 'fluent'],
    antonyms: ['inarticulate', 'awkward', 'clumsy']
  },
  'elusive': {
    exampleSentence: 'The elusive butterfly was nearly impossible to catch.',
    synonyms: ['hard to find', 'evasive', 'slippery'],
    antonyms: ['accessible', 'obvious', 'available']
  },
  'endure': {
    exampleSentence: 'Marathon runners must endure hours of physical strain.',
    synonyms: ['withstand', 'tolerate', 'survive'],
    antonyms: ['surrender', 'quit', 'yield']
  },
  'enhance': {
    exampleSentence: 'Adding spices can enhance the flavor of any dish.',
    synonyms: ['improve', 'boost', 'enrich'],
    antonyms: ['diminish', 'weaken', 'reduce']
  },
  'erratic': {
    exampleSentence: 'The driver\'s erratic behavior made other cars pull over.',
    synonyms: ['unpredictable', 'irregular', 'inconsistent'],
    antonyms: ['steady', 'predictable', 'consistent']
  },
  'essential': {
    exampleSentence: 'Water is essential for all living things on Earth.',
    synonyms: ['necessary', 'vital', 'crucial'],
    antonyms: ['unnecessary', 'optional', 'trivial']
  },
  'exonerate': {
    exampleSentence: 'New evidence helped exonerate the man who was wrongly accused.',
    synonyms: ['acquit', 'clear', 'vindicate'],
    antonyms: ['convict', 'blame', 'accuse']
  },
  'feasible': {
    exampleSentence: 'Building a treehouse in one weekend is a feasible plan if we all help.',
    synonyms: ['possible', 'practical', 'achievable'],
    antonyms: ['impossible', 'impractical', 'unachievable']
  },
  'feeble': {
    exampleSentence: 'The feeble kitten could barely stand on its own legs.',
    synonyms: ['weak', 'frail', 'delicate'],
    antonyms: ['strong', 'robust', 'powerful']
  },
  'frugal': {
    exampleSentence: 'My grandmother is frugal and never wastes a single scrap of food.',
    synonyms: ['thrifty', 'economical', 'careful'],
    antonyms: ['wasteful', 'extravagant', 'lavish']
  },
  'futile': {
    exampleSentence: 'It was futile to search for the lost ring in the dark.',
    synonyms: ['useless', 'pointless', 'hopeless'],
    antonyms: ['useful', 'effective', 'worthwhile']
  },
  'gregarious': {
    exampleSentence: 'The gregarious puppy wanted to play with every dog at the park.',
    synonyms: ['sociable', 'outgoing', 'friendly'],
    antonyms: ['shy', 'reserved', 'antisocial']
  },
  'grueling': {
    exampleSentence: 'The team endured a grueling practice session in the hot sun.',
    synonyms: ['exhausting', 'demanding', 'strenuous'],
    antonyms: ['easy', 'relaxing', 'effortless']
  },
  'gullible': {
    exampleSentence: 'The gullible child believed every tall tale his older brother told.',
    synonyms: ['naive', 'trusting', 'credulous'],
    antonyms: ['skeptical', 'suspicious', 'cautious']
  },
  'hamper': {
    exampleSentence: 'Heavy rain could hamper the search for the missing hikers.',
    synonyms: ['hinder', 'obstruct', 'impede'],
    antonyms: ['help', 'assist', 'facilitate']
  },
  'haughty': {
    exampleSentence: 'The haughty queen looked down on everyone in the kingdom.',
    synonyms: ['arrogant', 'proud', 'snobbish'],
    antonyms: ['humble', 'modest', 'down-to-earth']
  },
  'hinder': {
    exampleSentence: 'A broken leg can hinder your ability to walk for weeks.',
    synonyms: ['obstruct', 'impede', 'block'],
    antonyms: ['help', 'assist', 'support']
  },
  'imminent': {
    exampleSentence: 'Dark clouds warned that a storm was imminent.',
    synonyms: ['approaching', 'impending', 'forthcoming'],
    antonyms: ['distant', 'remote', 'unlikely']
  },
  'impeccable': {
    exampleSentence: 'Her impeccable manners impressed everyone at the dinner party.',
    synonyms: ['flawless', 'perfect', 'faultless'],
    antonyms: ['flawed', 'imperfect', 'defective']
  },
  'impede': {
    exampleSentence: 'Fallen trees can impede traffic after a severe storm.',
    synonyms: ['obstruct', 'block', 'hinder'],
    antonyms: ['assist', 'advance', 'facilitate']
  },
  'incessant': {
    exampleSentence: 'The incessant barking of the dog kept the neighbors awake all night.',
    synonyms: ['constant', 'unending', 'relentless'],
    antonyms: ['occasional', 'intermittent', 'rare']
  },
  'inevitable': {
    exampleSentence: 'Change is inevitable as you grow older.',
    synonyms: ['unavoidable', 'certain', 'inescapable'],
    antonyms: ['avoidable', 'preventable', 'uncertain']
  },
  'irate': {
    exampleSentence: 'The irate customer demanded to speak with the manager.',
    synonyms: ['furious', 'angry', 'enraged'],
    antonyms: ['calm', 'pleased', 'content']
  },
  'keen': {
    exampleSentence: 'She has a keen eye for detail and catches every small mistake.',
    synonyms: ['sharp', 'perceptive', 'alert'],
    antonyms: ['dull', 'oblivious', 'unaware']
  },
  'lenient': {
    exampleSentence: 'The lenient teacher gave students extra time to finish the test.',
    synonyms: ['tolerant', 'permissive', 'easygoing'],
    antonyms: ['strict', 'harsh', 'rigid']
  },
  'lethargic': {
    exampleSentence: 'After eating a huge lunch, everyone felt lethargic and sleepy.',
    synonyms: ['sluggish', 'drowsy', 'tired'],
    antonyms: ['energetic', 'lively', 'active']
  },
  'lucid': {
    exampleSentence: 'The teacher gave a lucid explanation that even the youngest students understood.',
    synonyms: ['clear', 'understandable', 'coherent'],
    antonyms: ['confusing', 'unclear', 'vague']
  },
  'meticulous': {
    exampleSentence: 'The artist was meticulous about every brushstroke in her painting.',
    synonyms: ['precise', 'thorough', 'careful'],
    antonyms: ['careless', 'sloppy', 'negligent']
  },
  'mitigate': {
    exampleSentence: 'Wearing sunscreen can mitigate the harmful effects of the sun.',
    synonyms: ['lessen', 'reduce', 'alleviate'],
    antonyms: ['worsen', 'intensify', 'aggravate']
  },
  'mundane': {
    exampleSentence: 'Washing dishes is a mundane chore that must be done every day.',
    synonyms: ['ordinary', 'routine', 'boring'],
    antonyms: ['exciting', 'extraordinary', 'remarkable']
  },
  'negligent': {
    exampleSentence: 'The negligent babysitter left the children unsupervised.',
    synonyms: ['careless', 'irresponsible', 'inattentive'],
    antonyms: ['careful', 'diligent', 'attentive']
  },
  'nonchalant': {
    exampleSentence: 'He tried to act nonchalant even though he was nervous about the audition.',
    synonyms: ['casual', 'easygoing', 'relaxed'],
    antonyms: ['anxious', 'concerned', 'worried']
  },
  'ominous': {
    exampleSentence: 'The ominous dark clouds made us rush inside before the storm.',
    synonyms: ['threatening', 'menacing', 'foreboding'],
    antonyms: ['promising', 'encouraging', 'reassuring']
  },
  'opulent': {
    exampleSentence: 'The opulent mansion had golden chandeliers in every room.',
    synonyms: ['luxurious', 'lavish', 'grand'],
    antonyms: ['modest', 'plain', 'simple']
  },
  'perpetual': {
    exampleSentence: 'The perpetual noise from the construction site annoyed the whole street.',
    synonyms: ['constant', 'endless', 'continuous'],
    antonyms: ['temporary', 'brief', 'occasional']
  },
  'placid': {
    exampleSentence: 'The placid lake reflected the mountains like a perfect mirror.',
    synonyms: ['calm', 'peaceful', 'tranquil'],
    antonyms: ['turbulent', 'stormy', 'agitated']
  },
  'plausible': {
    exampleSentence: 'His excuse for being late was not very plausible.',
    synonyms: ['believable', 'credible', 'reasonable'],
    antonyms: ['unlikely', 'implausible', 'doubtful']
  },
  'potent': {
    exampleSentence: 'The medicine was so potent that only a tiny dose was needed.',
    synonyms: ['powerful', 'strong', 'effective'],
    antonyms: ['weak', 'mild', 'ineffective']
  },
  'prevalent': {
    exampleSentence: 'Flu cases become more prevalent during the winter months.',
    synonyms: ['widespread', 'common', 'frequent'],
    antonyms: ['rare', 'uncommon', 'unusual']
  },
  'prudent': {
    exampleSentence: 'It is prudent to save some money for unexpected expenses.',
    synonyms: ['wise', 'careful', 'sensible'],
    antonyms: ['reckless', 'foolish', 'careless']
  },
  'scrutinize': {
    exampleSentence: 'The teacher will scrutinize every answer on the final exam.',
    synonyms: ['examine', 'inspect', 'analyze'],
    antonyms: ['ignore', 'overlook', 'glance']
  },
  'serene': {
    exampleSentence: 'The serene garden was the perfect place to read a book.',
    synonyms: ['calm', 'peaceful', 'tranquil'],
    antonyms: ['chaotic', 'noisy', 'hectic']
  },
  'sporadic': {
    exampleSentence: 'We only had sporadic rain showers throughout the week.',
    synonyms: ['occasional', 'intermittent', 'irregular'],
    antonyms: ['constant', 'continuous', 'regular']
  },
  'stagnant': {
    exampleSentence: 'The stagnant pond was covered in green algae.',
    synonyms: ['still', 'motionless', 'inactive'],
    antonyms: ['flowing', 'active', 'moving']
  },
  'tenacious': {
    exampleSentence: 'The tenacious athlete refused to give up despite her injury.',
    synonyms: ['persistent', 'determined', 'resolute'],
    antonyms: ['weak', 'yielding', 'feeble']
  },
  'thrive': {
    exampleSentence: 'Plants thrive when they receive plenty of sunlight and water.',
    synonyms: ['flourish', 'prosper', 'bloom'],
    antonyms: ['wither', 'decline', 'fail']
  },
  'trivial': {
    exampleSentence: 'Do not waste time arguing over trivial matters like what to eat.',
    synonyms: ['unimportant', 'minor', 'insignificant'],
    antonyms: ['important', 'significant', 'crucial']
  },
  'vigilant': {
    exampleSentence: 'The security guard remained vigilant throughout the night.',
    synonyms: ['watchful', 'alert', 'attentive'],
    antonyms: ['careless', 'inattentive', 'negligent']
  },
  'vivacious': {
    exampleSentence: 'The vivacious girl lit up every room she entered.',
    synonyms: ['lively', 'energetic', 'spirited'],
    antonyms: ['dull', 'lifeless', 'lethargic']
  },
  'volatile': {
    exampleSentence: 'The volatile weather changed from sunny to stormy in minutes.',
    synonyms: ['unpredictable', 'unstable', 'changeable'],
    antonyms: ['stable', 'steady', 'constant']
  },
  'vulnerable': {
    exampleSentence: 'Baby sea turtles are vulnerable to predators on the beach.',
    synonyms: ['defenseless', 'exposed', 'unprotected'],
    antonyms: ['protected', 'safe', 'secure']
  },
  'zealous': {
    exampleSentence: 'The zealous volunteers worked through the night to finish the project.',
    synonyms: ['enthusiastic', 'passionate', 'dedicated'],
    antonyms: ['apathetic', 'indifferent', 'uninterested']
  },
  'conceal': {
    exampleSentence: 'The spy tried to conceal the secret documents in a hidden safe.',
    synonyms: ['hide', 'cover', 'mask'],
    antonyms: ['reveal', 'expose', 'show']
  },
  'contempt': {
    exampleSentence: 'He looked at the messy room with contempt.',
    synonyms: ['scorn', 'disdain', 'disrespect'],
    antonyms: ['respect', 'admiration', 'regard']
  },
  'deplete': {
    exampleSentence: 'Running a marathon can deplete your body of energy and fluids.',
    synonyms: ['exhaust', 'drain', 'use up'],
    antonyms: ['replenish', 'restore', 'refill']
  },
  'deviate': {
    exampleSentence: 'The hikers decided not to deviate from the marked trail.',
    synonyms: ['stray', 'diverge', 'wander'],
    antonyms: ['follow', 'conform', 'stick to']
  },
  'eradicate': {
    exampleSentence: 'Scientists worked for decades to eradicate the deadly disease.',
    synonyms: ['eliminate', 'destroy', 'wipe out'],
    antonyms: ['create', 'establish', 'preserve']
  },
  'fabricate': {
    exampleSentence: 'He tried to fabricate an excuse for missing class.',
    synonyms: ['invent', 'make up', 'concoct'],
    antonyms: ['tell the truth', 'verify', 'confirm']
  },
  'formidable': {
    exampleSentence: 'The final exam was a formidable challenge for every student.',
    synonyms: ['intimidating', 'daunting', 'impressive'],
    antonyms: ['easy', 'weak', 'insignificant']
  },
  'hostile': {
    exampleSentence: 'The hostile crowd booed the visiting team as they took the field.',
    synonyms: ['unfriendly', 'aggressive', 'antagonistic'],
    antonyms: ['friendly', 'welcoming', 'warm']
  },
  'impulsive': {
    exampleSentence: 'His impulsive decision to skip school got him into trouble.',
    synonyms: ['rash', 'hasty', 'spontaneous'],
    antonyms: ['cautious', 'deliberate', 'careful']
  },
  'ingenious': {
    exampleSentence: 'The student came up with an ingenious solution to the difficult problem.',
    synonyms: ['clever', 'inventive', 'brilliant'],
    antonyms: ['foolish', 'unimaginative', 'dull']
  },
  'meager': {
    exampleSentence: 'The refugees survived on meager rations of bread and water.',
    synonyms: ['scanty', 'insufficient', 'small'],
    antonyms: ['abundant', 'plentiful', 'generous']
  },
  'obscure': {
    exampleSentence: 'Thick fog began to obscure the road ahead of us.',
    synonyms: ['hide', 'conceal', 'block'],
    antonyms: ['reveal', 'clarify', 'illuminate']
  },
  'persevere': {
    exampleSentence: 'You must persevere through tough times to reach your goals.',
    synonyms: ['persist', 'continue', 'endure'],
    antonyms: ['quit', 'surrender', 'give up']
  },
  'reclusive': {
    exampleSentence: 'The reclusive author rarely appeared in public or gave interviews.',
    synonyms: ['withdrawn', 'isolated', 'solitary'],
    antonyms: ['sociable', 'outgoing', 'gregarious']
  },
  'resilient': {
    exampleSentence: 'Children are often resilient and bounce back quickly from setbacks.',
    synonyms: ['tough', 'strong', 'adaptable'],
    antonyms: ['fragile', 'weak', 'vulnerable']
  },
  'somber': {
    exampleSentence: 'The somber mood at the memorial reflected everyone\'s sadness.',
    synonyms: ['gloomy', 'dark', 'serious'],
    antonyms: ['cheerful', 'bright', 'joyful']
  },
  'squander': {
    exampleSentence: 'Do not squander your allowance on things you do not need.',
    synonyms: ['waste', 'misuse', 'throw away'],
    antonyms: ['save', 'conserve', 'invest']
  },
  'suppress': {
    exampleSentence: 'She tried to suppress a laugh during the serious meeting.',
    synonyms: ['restrain', 'hold back', 'stifle'],
    antonyms: ['release', 'express', 'encourage']
  },
  'tenuous': {
    exampleSentence: 'The connection between the two events seemed tenuous at best.',
    synonyms: ['weak', 'fragile', 'flimsy'],
    antonyms: ['strong', 'solid', 'firm']
  },
  'toxic': {
    exampleSentence: 'The factory released toxic chemicals into the nearby river.',
    synonyms: ['poisonous', 'harmful', 'deadly'],
    antonyms: ['harmless', 'safe', 'beneficial']
  },
  'undermine': {
    exampleSentence: 'Spreading rumors can undermine a person\'s reputation.',
    synonyms: ['weaken', 'sabotage', 'damage'],
    antonyms: ['strengthen', 'support', 'reinforce']
  },
  'vanquish': {
    exampleSentence: 'The hero set out to vanquish the dragon terrorizing the village.',
    synonyms: ['defeat', 'conquer', 'overcome'],
    antonyms: ['lose', 'surrender', 'yield']
  },
  'wary': {
    exampleSentence: 'Be wary of strangers who offer you something for free.',
    synonyms: ['cautious', 'careful', 'watchful'],
    antonyms: ['careless', 'reckless', 'trusting']
  },
  'abbreviate': {
    exampleSentence: 'The teacher asked us to abbreviate the state names on our geography test.',
    synonyms: ['shorten', 'condense', 'truncate'],
    antonyms: ['lengthen', 'expand', 'extend']
  },
  'abdicate': {
    exampleSentence: 'The king decided to abdicate the throne so his daughter could rule.',
    synonyms: ['relinquish', 'renounce', 'surrender'],
    antonyms: ['claim', 'assume', 'seize']
  },
  'abide': {
    exampleSentence: 'All students must abide by the school rules or face consequences.',
    synonyms: ['follow', 'obey', 'comply'],
    antonyms: ['defy', 'resist', 'violate']
  },
  'abnormal': {
    exampleSentence: 'The abnormal weather patterns caused flooding in areas that were usually dry.',
    synonyms: ['unusual', 'irregular', 'atypical'],
    antonyms: ['normal', 'typical', 'ordinary']
  },
  'abode': {
    exampleSentence: 'The old cottage served as their humble abode for the entire summer.',
    synonyms: ['dwelling', 'residence', 'home'],
    antonyms: ['workplace', 'office']
  },
  'abrasive': {
    exampleSentence: 'His abrasive comments hurt the feelings of everyone in the group.',
    synonyms: ['harsh', 'rough', 'coarse'],
    antonyms: ['gentle', 'smooth', 'mild']
  },
  'absolution': {
    exampleSentence: 'She sought absolution for the mistakes she had made during the project.',
    synonyms: ['forgiveness', 'pardon', 'acquittal'],
    antonyms: ['blame', 'condemnation', 'punishment']
  },
  'absolve': {
    exampleSentence: 'The new evidence was enough to absolve the suspect of all charges.',
    synonyms: ['forgive', 'pardon', 'exonerate'],
    antonyms: ['blame', 'condemn', 'convict']
  },
  'abstain': {
    exampleSentence: 'The doctor advised him to abstain from eating sugary snacks before the test.',
    synonyms: ['refrain', 'avoid', 'forgo'],
    antonyms: ['indulge', 'partake', 'consume']
  },
  'acclaim': {
    exampleSentence: 'The young author received widespread acclaim for her debut novel.',
    synonyms: ['praise', 'applause', 'recognition'],
    antonyms: ['criticism', 'disapproval', 'condemnation']
  },
  'accolade': {
    exampleSentence: 'Winning the science fair was the highest accolade she had ever received.',
    synonyms: ['award', 'honor', 'tribute'],
    antonyms: ['criticism', 'disapproval', 'rebuke']
  },
  'accountable': {
    exampleSentence: 'Each team member is accountable for completing their share of the work.',
    synonyms: ['responsible', 'answerable', 'liable'],
    antonyms: ['unaccountable', 'irresponsible', 'exempt']
  },
  'accuse': {
    exampleSentence: 'It is unfair to accuse someone of cheating without any proof.',
    synonyms: ['charge', 'blame', 'indict'],
    antonyms: ['defend', 'absolve', 'exonerate']
  },
  'acrid': {
    exampleSentence: 'The acrid smell of burning rubber filled the air near the factory.',
    synonyms: ['pungent', 'bitter', 'sharp'],
    antonyms: ['sweet', 'pleasant', 'mild']
  },
  'adaptable': {
    exampleSentence: 'Being adaptable helped her adjust quickly when her family moved to a new city.',
    synonyms: ['flexible', 'versatile', 'adjustable'],
    antonyms: ['rigid', 'inflexible', 'unyielding']
  },
  'adhere': {
    exampleSentence: 'You must adhere to the dress code during the school assembly.',
    synonyms: ['stick', 'comply', 'follow'],
    antonyms: ['ignore', 'disobey', 'detach']
  },
  'adjacent': {
    exampleSentence: 'The library is adjacent to the gymnasium, so it is easy to walk between them.',
    synonyms: ['neighboring', 'adjoining', 'nearby'],
    antonyms: ['distant', 'remote', 'far']
  },
  'admonish': {
    exampleSentence: 'The coach had to admonish the players for not following the game plan.',
    synonyms: ['warn', 'reprimand', 'scold'],
    antonyms: ['praise', 'commend', 'applaud']
  },
  'adorn': {
    exampleSentence: 'The students helped adorn the hallway with colorful posters for the dance.',
    synonyms: ['decorate', 'embellish', 'beautify'],
    antonyms: ['strip', 'simplify', 'mar']
  },
  'adverse': {
    exampleSentence: 'Adverse weather conditions forced the school to cancel the outdoor field trip.',
    synonyms: ['unfavorable', 'harmful', 'detrimental'],
    antonyms: ['favorable', 'beneficial', 'helpful']
  },
  'adversity': {
    exampleSentence: 'She showed great courage in the face of adversity after her injury.',
    synonyms: ['hardship', 'difficulty', 'misfortune'],
    antonyms: ['prosperity', 'fortune', 'ease']
  },
  'aesthetic': {
    exampleSentence: 'The aesthetic beauty of the painting caught everyone\'s attention at the art show.',
    synonyms: ['artistic', 'visual', 'pleasing'],
    antonyms: ['ugly', 'unattractive', 'unsightly']
  },
  'affront': {
    exampleSentence: 'She considered the rude remark an affront to her dignity.',
    synonyms: ['insult', 'offense', 'slight'],
    antonyms: ['compliment', 'praise', 'honor']
  },
  'aggravate': {
    exampleSentence: 'Scratching the mosquito bite will only aggravate the itching.',
    synonyms: ['worsen', 'intensify', 'exacerbate'],
    antonyms: ['soothe', 'alleviate', 'improve']
  },
  'aggressive': {
    exampleSentence: 'The aggressive dog barked loudly at anyone who walked past the fence.',
    synonyms: ['hostile', 'forceful', 'combative'],
    antonyms: ['passive', 'gentle', 'peaceful']
  },
  'agitate': {
    exampleSentence: 'The unfair rule change began to agitate the students in the cafeteria.',
    synonyms: ['disturb', 'upset', 'provoke'],
    antonyms: ['calm', 'soothe', 'pacify']
  },
  'ailment': {
    exampleSentence: 'The nurse treated the minor ailment so the student could return to class.',
    synonyms: ['illness', 'sickness', 'affliction'],
    antonyms: ['health', 'wellness', 'vitality']
  },
  'ajar': {
    exampleSentence: 'She noticed that the door was slightly ajar and peeked inside the room.',
    synonyms: ['open', 'unlatched', 'gaping'],
    antonyms: ['closed', 'shut', 'sealed']
  },
  'allocate': {
    exampleSentence: 'The principal decided to allocate extra funds for new library books.',
    synonyms: ['assign', 'distribute', 'allot'],
    antonyms: ['withhold', 'retain', 'keep']
  },
  'allot': {
    exampleSentence: 'The teacher will allot fifteen minutes for each group to present their project.',
    synonyms: ['assign', 'distribute', 'designate'],
    antonyms: ['withhold', 'deny', 'keep']
  },
  'aloof': {
    exampleSentence: 'The new student seemed aloof at first, but she was actually just shy.',
    synonyms: ['distant', 'detached', 'reserved'],
    antonyms: ['friendly', 'sociable', 'approachable']
  },
  'alter': {
    exampleSentence: 'The tailor offered to alter the uniform so it would fit properly.',
    synonyms: ['change', 'modify', 'adjust'],
    antonyms: ['preserve', 'maintain', 'keep']
  },
  'altercation': {
    exampleSentence: 'An altercation broke out between two players during the basketball game.',
    synonyms: ['argument', 'dispute', 'quarrel'],
    antonyms: ['agreement', 'harmony', 'peace']
  },
  'altruistic': {
    exampleSentence: 'Her altruistic nature led her to volunteer at the animal shelter every weekend.',
    synonyms: ['selfless', 'generous', 'charitable'],
    antonyms: ['selfish', 'greedy', 'self-centered']
  },
  'amass': {
    exampleSentence: 'Over the years, the collector managed to amass hundreds of rare coins.',
    synonyms: ['gather', 'accumulate', 'collect'],
    antonyms: ['scatter', 'disperse', 'distribute']
  },
  'ambivalent': {
    exampleSentence: 'She felt ambivalent about moving because she was excited but also sad to leave friends.',
    synonyms: ['uncertain', 'undecided', 'torn'],
    antonyms: ['certain', 'decisive', 'resolute']
  },
  'amicable': {
    exampleSentence: 'The two neighbors reached an amicable agreement about sharing the fence repairs.',
    synonyms: ['friendly', 'cordial', 'harmonious'],
    antonyms: ['hostile', 'unfriendly', 'contentious']
  },
  'amiss': {
    exampleSentence: 'Something seemed amiss when the classroom door was locked during school hours.',
    synonyms: ['wrong', 'awry', 'faulty'],
    antonyms: ['right', 'correct', 'proper']
  },
  'amplify': {
    exampleSentence: 'The microphone helped amplify her voice so the entire auditorium could hear.',
    synonyms: ['increase', 'boost', 'intensify'],
    antonyms: ['reduce', 'diminish', 'muffle']
  },
  'analyze': {
    exampleSentence: 'The science class had to analyze the data from their experiment to draw conclusions.',
    synonyms: ['examine', 'study', 'evaluate'],
    antonyms: ['ignore', 'overlook', 'neglect']
  },
  'anecdote': {
    exampleSentence: 'The teacher shared a funny anecdote about her first day of teaching.',
    synonyms: ['story', 'tale', 'narrative'],
    antonyms: ['fact', 'statistic', 'report']
  },
  'animate': {
    exampleSentence: 'The puppeteer was able to animate the wooden figure with just a few strings.',
    synonyms: ['enliven', 'energize', 'invigorate'],
    antonyms: ['deaden', 'stifle', 'suppress']
  },
  'antagonist': {
    exampleSentence: 'The antagonist in the story tried to stop the hero from saving the kingdom.',
    synonyms: ['villain', 'opponent', 'rival'],
    antonyms: ['ally', 'protagonist', 'supporter']
  },
  'antagonize': {
    exampleSentence: 'Please do not antagonize your sister while she is trying to study.',
    synonyms: ['provoke', 'irritate', 'annoy'],
    antonyms: ['soothe', 'please', 'appease']
  },
  'anticipate': {
    exampleSentence: 'We anticipate a large crowd at the school concert this Friday.',
    synonyms: ['expect', 'foresee', 'predict'],
    antonyms: ['doubt', 'disregard', 'overlook']
  },
  'antidote': {
    exampleSentence: 'The doctor quickly administered the antidote to counteract the snake venom.',
    synonyms: ['remedy', 'cure', 'countermeasure'],
    antonyms: ['poison', 'toxin', 'venom']
  },
  'apathy': {
    exampleSentence: 'The student\'s apathy toward homework resulted in several missing assignments.',
    synonyms: ['indifference', 'disinterest', 'unconcern'],
    antonyms: ['enthusiasm', 'passion', 'interest']
  },
  'apex': {
    exampleSentence: 'Reaching the apex of the mountain gave the hikers a breathtaking view.',
    synonyms: ['peak', 'summit', 'pinnacle'],
    antonyms: ['base', 'bottom', 'nadir']
  },
  'appalling': {
    exampleSentence: 'The appalling conditions of the old building shocked the visiting inspectors.',
    synonyms: ['dreadful', 'horrifying', 'shocking'],
    antonyms: ['wonderful', 'delightful', 'pleasant']
  },
  'appeal': {
    exampleSentence: 'The charity made an appeal for donations to help families affected by the flood.',
    synonyms: ['request', 'plea', 'petition'],
    antonyms: ['refusal', 'denial', 'rejection']
  },
  'arbitrary': {
    exampleSentence: 'The decision felt arbitrary because no clear reason was given for the rule change.',
    synonyms: ['random', 'capricious', 'unjustified'],
    antonyms: ['deliberate', 'logical', 'reasoned']
  },
  'archaic': {
    exampleSentence: 'The archaic language in the old manuscript was difficult for modern readers.',
    synonyms: ['outdated', 'ancient', 'antiquated'],
    antonyms: ['modern', 'current', 'contemporary']
  },
  'arid': {
    exampleSentence: 'Very few plants can survive in the arid desert climate without extra water.',
    synonyms: ['dry', 'parched', 'barren'],
    antonyms: ['moist', 'humid', 'fertile']
  },
  'asperity': {
    exampleSentence: 'She spoke with asperity when her teammates refused to cooperate on the assignment.',
    synonyms: ['harshness', 'severity', 'sharpness'],
    antonyms: ['gentleness', 'kindness', 'mildness']
  },
  'aspire': {
    exampleSentence: 'Many young athletes aspire to compete in the Olympic Games someday.',
    synonyms: ['aim', 'strive', 'desire'],
    antonyms: ['despair', 'settle', 'quit']
  },
  'assent': {
    exampleSentence: 'The committee gave their assent to the plan after a thorough discussion.',
    synonyms: ['agreement', 'approval', 'consent'],
    antonyms: ['refusal', 'dissent', 'objection']
  },
  'assist': {
    exampleSentence: 'The older students volunteered to assist the kindergarteners during the fire drill.',
    synonyms: ['help', 'aid', 'support'],
    antonyms: ['hinder', 'obstruct', 'impede']
  },
  'atone': {
    exampleSentence: 'He tried to atone for his mistake by writing a sincere apology letter.',
    synonyms: ['make amends', 'compensate', 'redeem'],
    antonyms: ['offend', 'wrong', 'transgress']
  },
  'atrocious': {
    exampleSentence: 'The atrocious behavior of the bullies was immediately reported to the principal.',
    synonyms: ['terrible', 'dreadful', 'appalling'],
    antonyms: ['wonderful', 'admirable', 'excellent']
  },
  'atypical': {
    exampleSentence: 'The warm weather in January was atypical for our normally cold region.',
    synonyms: ['unusual', 'uncommon', 'abnormal'],
    antonyms: ['typical', 'normal', 'common']
  },
  'audible': {
    exampleSentence: 'Her voice was barely audible over the noise of the crowded hallway.',
    synonyms: ['hearable', 'perceptible', 'detectable'],
    antonyms: ['inaudible', 'silent', 'muted']
  },
  'augment': {
    exampleSentence: 'She decided to augment her study notes with diagrams and charts.',
    synonyms: ['increase', 'enhance', 'supplement'],
    antonyms: ['decrease', 'diminish', 'reduce']
  },
  'authentic': {
    exampleSentence: 'The museum confirmed that the ancient coin was authentic and not a replica.',
    synonyms: ['genuine', 'real', 'legitimate'],
    antonyms: ['fake', 'counterfeit', 'fraudulent']
  },
  'averse': {
    exampleSentence: 'He was averse to public speaking and always felt nervous before presentations.',
    synonyms: ['opposed', 'reluctant', 'unwilling'],
    antonyms: ['eager', 'willing', 'inclined']
  },
  'avert': {
    exampleSentence: 'Quick thinking by the crossing guard helped avert a dangerous accident.',
    synonyms: ['prevent', 'avoid', 'deflect'],
    antonyms: ['cause', 'attract', 'invite']
  },
  'avid': {
    exampleSentence: 'She is an avid reader who finishes at least two books every week.',
    synonyms: ['enthusiastic', 'passionate', 'eager'],
    antonyms: ['indifferent', 'apathetic', 'unenthusiastic']
  },
  'banal': {
    exampleSentence: 'The movie was so banal that half the audience fell asleep.',
    synonyms: ['boring', 'dull', 'unoriginal'],
    antonyms: ['original', 'fresh', 'interesting']
  },
  'banter': {
    exampleSentence: 'The friendly banter between the two comedians had everyone laughing.',
    synonyms: ['teasing', 'joking', 'repartee'],
    antonyms: ['silence', 'seriousness', 'formality']
  },
  'barter': {
    exampleSentence: 'In ancient times, people would barter goods instead of using money.',
    synonyms: ['trade', 'exchange', 'swap'],
    antonyms: ['buy', 'purchase', 'sell']
  },
  'belated': {
    exampleSentence: 'He sent a belated birthday card because he forgot the actual date.',
    synonyms: ['late', 'overdue', 'tardy'],
    antonyms: ['early', 'prompt', 'timely']
  },
  'belittle': {
    exampleSentence: 'It is unkind to belittle someone for making an honest mistake.',
    synonyms: ['diminish', 'disparage', 'mock'],
    antonyms: ['praise', 'compliment', 'encourage']
  },
  'benefit': {
    exampleSentence: 'Regular exercise can benefit your health in many important ways.',
    synonyms: ['advantage', 'gain', 'help'],
    antonyms: ['disadvantage', 'harm', 'drawback']
  },
  'benign': {
    exampleSentence: 'The doctor said the tumor was benign and would not cause any harm.',
    synonyms: ['harmless', 'gentle', 'mild'],
    antonyms: ['harmful', 'malignant', 'dangerous']
  },
  'berate': {
    exampleSentence: 'The manager began to berate the employee for arriving late again.',
    synonyms: ['scold', 'criticize', 'reprimand'],
    antonyms: ['praise', 'compliment', 'commend']
  },
  'biased': {
    exampleSentence: 'A biased judge cannot make fair decisions for either side.',
    synonyms: ['prejudiced', 'partial', 'unfair'],
    antonyms: ['impartial', 'fair', 'objective']
  },
  'bizarre': {
    exampleSentence: 'The bizarre costume with feathers and glitter attracted a lot of attention.',
    synonyms: ['strange', 'weird', 'peculiar'],
    antonyms: ['normal', 'ordinary', 'common']
  },
  'blatant': {
    exampleSentence: 'The student\'s blatant cheating was caught by the teacher immediately.',
    synonyms: ['obvious', 'flagrant', 'glaring'],
    antonyms: ['subtle', 'hidden', 'concealed']
  },
  'bleak': {
    exampleSentence: 'The bleak winter landscape was covered in nothing but gray snow and bare trees.',
    synonyms: ['gloomy', 'dreary', 'dismal'],
    antonyms: ['bright', 'cheerful', 'promising']
  },
  'blithe': {
    exampleSentence: 'Her blithe attitude about the upcoming exam worried her parents.',
    synonyms: ['carefree', 'cheerful', 'lighthearted'],
    antonyms: ['serious', 'worried', 'concerned']
  },
  'boisterous': {
    exampleSentence: 'The boisterous crowd cheered loudly when the winning goal was scored.',
    synonyms: ['loud', 'rowdy', 'noisy'],
    antonyms: ['quiet', 'calm', 'subdued']
  },
  'bolster': {
    exampleSentence: 'Extra practice sessions helped bolster the team\'s confidence before the finals.',
    synonyms: ['strengthen', 'support', 'reinforce'],
    antonyms: ['weaken', 'undermine', 'diminish']
  },
  'brash': {
    exampleSentence: 'His brash decision to skip practice cost the team a chance at the playoffs.',
    synonyms: ['reckless', 'bold', 'impulsive'],
    antonyms: ['cautious', 'careful', 'thoughtful']
  },
  'brazen': {
    exampleSentence: 'The brazen thief stole the bicycle in broad daylight.',
    synonyms: ['bold', 'shameless', 'audacious'],
    antonyms: ['timid', 'shy', 'modest']
  },
  'brisk': {
    exampleSentence: 'They took a brisk walk around the track before the morning bell rang.',
    synonyms: ['quick', 'lively', 'energetic'],
    antonyms: ['slow', 'sluggish', 'lazy']
  },
  'broach': {
    exampleSentence: 'She was nervous to broach the subject of her failing grade with her parents.',
    synonyms: ['introduce', 'raise', 'mention'],
    antonyms: ['suppress', 'avoid', 'ignore']
  },
  'buttress': {
    exampleSentence: 'Strong evidence will buttress your argument in the class debate.',
    synonyms: ['support', 'strengthen', 'reinforce'],
    antonyms: ['weaken', 'undermine', 'damage']
  },
  'callous': {
    exampleSentence: 'It was callous of him to laugh at someone who was clearly upset.',
    synonyms: ['heartless', 'insensitive', 'cruel'],
    antonyms: ['compassionate', 'caring', 'sensitive']
  },
  'cantankerous': {
    exampleSentence: 'The cantankerous old man yelled at kids who walked across his lawn.',
    synonyms: ['grumpy', 'irritable', 'cranky'],
    antonyms: ['pleasant', 'agreeable', 'cheerful']
  },
  'caustic': {
    exampleSentence: 'Her caustic remark about his art project made him feel terrible.',
    synonyms: ['harsh', 'biting', 'sarcastic'],
    antonyms: ['kind', 'gentle', 'mild']
  },
  'ceremonious': {
    exampleSentence: 'The ceremonious opening of the new school wing included speeches and ribbon cutting.',
    synonyms: ['formal', 'solemn', 'dignified'],
    antonyms: ['casual', 'informal', 'relaxed']
  },
  'champion': {
    exampleSentence: 'The student council president promised to champion the cause of longer lunch breaks.',
    synonyms: ['advocate', 'support', 'promote'],
    antonyms: ['oppose', 'hinder', 'resist']
  },
  'chastise': {
    exampleSentence: 'The teacher had to chastise the class for talking during the assembly.',
    synonyms: ['scold', 'discipline', 'reprimand'],
    antonyms: ['praise', 'reward', 'commend']
  },
  'cherish': {
    exampleSentence: 'She will always cherish the memories of summer camp with her friends.',
    synonyms: ['treasure', 'value', 'adore'],
    antonyms: ['neglect', 'disregard', 'despise']
  },
  'choleric': {
    exampleSentence: 'The choleric coach turned red in the face when the referee made a bad call.',
    synonyms: ['irritable', 'hot-tempered', 'angry'],
    antonyms: ['calm', 'easygoing', 'placid']
  },
  'circumvent': {
    exampleSentence: 'The students tried to circumvent the school\'s phone policy by hiding their devices.',
    synonyms: ['bypass', 'avoid', 'evade'],
    antonyms: ['confront', 'face', 'comply']
  },
  'clamor': {
    exampleSentence: 'The clamor of the excited fans could be heard from blocks away.',
    synonyms: ['uproar', 'noise', 'commotion'],
    antonyms: ['silence', 'quiet', 'calm']
  },
  'clandestine': {
    exampleSentence: 'The students held a clandestine meeting to plan the surprise party for their teacher.',
    synonyms: ['secret', 'covert', 'hidden'],
    antonyms: ['open', 'public', 'overt']
  },
  'clemency': {
    exampleSentence: 'The judge showed clemency and gave the first-time offender a lighter sentence.',
    synonyms: ['mercy', 'leniency', 'compassion'],
    antonyms: ['harshness', 'severity', 'cruelty']
  },
  'coarse': {
    exampleSentence: 'The coarse sandpaper was too rough for the delicate wood surface.',
    synonyms: ['rough', 'crude', 'harsh'],
    antonyms: ['smooth', 'fine', 'refined']
  },
  'cohesive': {
    exampleSentence: 'A cohesive team works well together and supports each member.',
    synonyms: ['united', 'connected', 'unified'],
    antonyms: ['divided', 'fragmented', 'disjointed']
  },
  'commence': {
    exampleSentence: 'The graduation ceremony will commence at ten o\'clock sharp.',
    synonyms: ['begin', 'start', 'initiate'],
    antonyms: ['end', 'finish', 'conclude']
  },
  'commend': {
    exampleSentence: 'The principal took time to commend the students for their community service.',
    synonyms: ['praise', 'applaud', 'congratulate'],
    antonyms: ['criticize', 'condemn', 'blame']
  },
  'competent': {
    exampleSentence: 'A competent swimmer should be able to tread water for at least five minutes.',
    synonyms: ['capable', 'skilled', 'qualified'],
    antonyms: ['incompetent', 'incapable', 'unskilled']
  },
  'compilation': {
    exampleSentence: 'The teacher created a compilation of the best student essays from the year.',
    synonyms: ['collection', 'anthology', 'assortment'],
    antonyms: ['single', 'individual', 'fragment']
  },
  'compile': {
    exampleSentence: 'The librarian helped compile a list of recommended books for summer reading.',
    synonyms: ['assemble', 'gather', 'collect'],
    antonyms: ['scatter', 'disperse', 'separate']
  },
  'complacent': {
    exampleSentence: 'The team became complacent after winning several games and stopped practicing hard.',
    synonyms: ['smug', 'self-satisfied', 'overconfident'],
    antonyms: ['ambitious', 'driven', 'vigilant']
  },
  'compliant': {
    exampleSentence: 'The compliant student always followed the classroom rules without complaint.',
    synonyms: ['obedient', 'cooperative', 'submissive'],
    antonyms: ['defiant', 'rebellious', 'resistant']
  },
  'comply': {
    exampleSentence: 'All visitors must comply with the safety regulations when entering the lab.',
    synonyms: ['obey', 'follow', 'conform'],
    antonyms: ['defy', 'resist', 'disobey']
  },
  'composure': {
    exampleSentence: 'She maintained her composure even when the presentation did not go as planned.',
    synonyms: ['calmness', 'poise', 'self-control'],
    antonyms: ['agitation', 'panic', 'anxiety']
  },
  'comprehensive': {
    exampleSentence: 'The teacher gave a comprehensive review that covered every topic on the final exam.',
    synonyms: ['thorough', 'complete', 'extensive'],
    antonyms: ['incomplete', 'partial', 'limited']
  },
  'compromise': {
    exampleSentence: 'Both sides had to compromise to reach an agreement about the field trip destination.',
    synonyms: ['settle', 'negotiate', 'concede'],
    antonyms: ['refuse', 'insist', 'disagree']
  },
  'concede': {
    exampleSentence: 'After looking at the evidence, he had to concede that his opponent was right.',
    synonyms: ['admit', 'acknowledge', 'yield'],
    antonyms: ['deny', 'dispute', 'contest']
  },
  'conceited': {
    exampleSentence: 'The conceited singer believed she was better than every other performer.',
    synonyms: ['vain', 'arrogant', 'egotistical'],
    antonyms: ['humble', 'modest', 'unassuming']
  },
  'conclude': {
    exampleSentence: 'Based on the clues, the detective was able to conclude who committed the crime.',
    synonyms: ['determine', 'decide', 'deduce'],
    antonyms: ['begin', 'start', 'initiate']
  },
  'concord': {
    exampleSentence: 'The two rival schools finally reached a state of concord after years of competition.',
    synonyms: ['harmony', 'agreement', 'peace'],
    antonyms: ['discord', 'conflict', 'disagreement']
  },
  'concur': {
    exampleSentence: 'Most scientists concur that exercise is good for both body and mind.',
    synonyms: ['agree', 'approve', 'consent'],
    antonyms: ['disagree', 'differ', 'oppose']
  },
  'condescend': {
    exampleSentence: 'It is rude to condescend to younger students just because you are older.',
    synonyms: ['patronize', 'talk down', 'belittle'],
    antonyms: ['respect', 'admire', 'esteem']
  },
  'condescending': {
    exampleSentence: 'His condescending tone made everyone feel like their ideas were not valued.',
    synonyms: ['patronizing', 'superior', 'snobbish'],
    antonyms: ['respectful', 'humble', 'considerate']
  },
  'condone': {
    exampleSentence: 'The school does not condone bullying of any kind.',
    synonyms: ['excuse', 'overlook', 'pardon'],
    antonyms: ['condemn', 'forbid', 'punish']
  },
  'confiscate': {
    exampleSentence: 'The teacher had to confiscate the phone because it was used during the test.',
    synonyms: ['seize', 'take', 'impound'],
    antonyms: ['return', 'give back', 'restore']
  },
  'conflagration': {
    exampleSentence: 'The conflagration spread through the forest and burned thousands of acres.',
    synonyms: ['fire', 'blaze', 'inferno'],
    antonyms: ['drizzle', 'frost', 'calm']
  },
  'congenial': {
    exampleSentence: 'The congenial host made every guest feel welcome at the dinner party.',
    synonyms: ['friendly', 'pleasant', 'agreeable'],
    antonyms: ['unfriendly', 'hostile', 'cold']
  },
  'consequently': {
    exampleSentence: 'He did not study for the quiz; consequently, he received a low grade.',
    synonyms: ['therefore', 'thus', 'as a result'],
    antonyms: ['regardless', 'nevertheless', 'however']
  },
  'conservative': {
    exampleSentence: 'She took a conservative approach to spending and saved most of her allowance.',
    synonyms: ['cautious', 'traditional', 'moderate'],
    antonyms: ['liberal', 'radical', 'progressive']
  },
  'consolidate': {
    exampleSentence: 'The teacher asked us to consolidate our notes into one study guide for the exam.',
    synonyms: ['combine', 'merge', 'unite'],
    antonyms: ['separate', 'divide', 'split']
  },
  'conspiracy': {
    exampleSentence: 'The detective uncovered a conspiracy among the suspects to hide the stolen jewels.',
    synonyms: ['plot', 'scheme', 'collusion'],
    antonyms: ['honesty', 'openness', 'transparency']
  },
  'construct': {
    exampleSentence: 'The students worked together to construct a model bridge for the science fair.',
    synonyms: ['build', 'create', 'assemble'],
    antonyms: ['destroy', 'demolish', 'dismantle']
  },
  'contagious': {
    exampleSentence: 'The flu is highly contagious, so the sick student was sent home from school.',
    synonyms: ['infectious', 'spreading', 'communicable'],
    antonyms: ['noninfectious', 'contained', 'harmless']
  },
  'contaminate': {
    exampleSentence: 'Chemical spills can contaminate the drinking water in nearby communities.',
    synonyms: ['pollute', 'taint', 'infect'],
    antonyms: ['purify', 'clean', 'sterilize']
  },
  'contemporary': {
    exampleSentence: 'The museum featured contemporary art created by living artists.',
    synonyms: ['modern', 'current', 'present-day'],
    antonyms: ['ancient', 'old-fashioned', 'outdated']
  },
  'content': {
    exampleSentence: 'After finishing a good book, she felt truly content and at peace.',
    synonyms: ['satisfied', 'pleased', 'happy'],
    antonyms: ['dissatisfied', 'unhappy', 'discontent']
  },
  'contort': {
    exampleSentence: 'The gymnast could contort her body into shapes that amazed the audience.',
    synonyms: ['twist', 'distort', 'bend'],
    antonyms: ['straighten', 'align', 'unbend']
  },
  'contradict': {
    exampleSentence: 'The witness began to contradict her earlier statement during the trial.',
    synonyms: ['deny', 'oppose', 'dispute'],
    antonyms: ['confirm', 'agree', 'support']
  },
  'contrite': {
    exampleSentence: 'The contrite student apologized sincerely for disrupting the class.',
    synonyms: ['remorseful', 'sorry', 'repentant'],
    antonyms: ['unrepentant', 'defiant', 'shameless']
  },
  'contrive': {
    exampleSentence: 'The clever students managed to contrive a plan to raise money for charity.',
    synonyms: ['devise', 'invent', 'create'],
    antonyms: ['destroy', 'demolish', 'wreck']
  },
  'conundrum': {
    exampleSentence: 'The math puzzle was a real conundrum that stumped even the best students.',
    synonyms: ['puzzle', 'riddle', 'dilemma'],
    antonyms: ['solution', 'answer', 'certainty']
  },
  'conventional': {
    exampleSentence: 'Instead of a conventional book report, the teacher let us create a video.',
    synonyms: ['traditional', 'standard', 'typical'],
    antonyms: ['unconventional', 'unusual', 'innovative']
  },
  'corrupt': {
    exampleSentence: 'The corrupt official was arrested for accepting bribes.',
    synonyms: ['dishonest', 'crooked', 'unethical'],
    antonyms: ['honest', 'ethical', 'upright']
  },
  'counterfeit': {
    exampleSentence: 'The store clerk spotted the counterfeit bill because it felt different from real money.',
    synonyms: ['fake', 'forged', 'fraudulent'],
    antonyms: ['genuine', 'real', 'authentic']
  },
  'courteous': {
    exampleSentence: 'The courteous student always held the door open for teachers and classmates.',
    synonyms: ['polite', 'respectful', 'civil'],
    antonyms: ['rude', 'impolite', 'discourteous']
  },
  'critical': {
    exampleSentence: 'Reading is a critical skill that helps you succeed in every subject.',
    synonyms: ['essential', 'vital', 'important'],
    antonyms: ['unimportant', 'trivial', 'insignificant']
  },
  'crucial': {
    exampleSentence: 'Getting enough sleep is crucial for doing well on exams.',
    synonyms: ['vital', 'essential', 'important'],
    antonyms: ['unimportant', 'insignificant', 'trivial']
  },
  'culprit': {
    exampleSentence: 'The principal quickly identified the culprit who had pulled the fire alarm.',
    synonyms: ['offender', 'wrongdoer', 'perpetrator'],
    antonyms: ['victim', 'innocent', 'bystander']
  },
  'culture': {
    exampleSentence: 'Learning about another culture can open your mind to new ways of thinking.',
    synonyms: ['civilization', 'heritage', 'customs'],
    antonyms: ['ignorance', 'barbarism']
  },
  'cumulative': {
    exampleSentence: 'The cumulative effect of missing several homework assignments lowered his grade.',
    synonyms: ['collective', 'total', 'combined'],
    antonyms: ['individual', 'separate', 'single']
  },
  'cursory': {
    exampleSentence: 'A cursory glance at the map was not enough to find the right directions.',
    synonyms: ['brief', 'hasty', 'superficial'],
    antonyms: ['thorough', 'detailed', 'careful']
  },
  'cynical': {
    exampleSentence: 'The cynical student doubted that the fundraiser would actually help anyone.',
    synonyms: ['skeptical', 'distrustful', 'pessimistic'],
    antonyms: ['trusting', 'optimistic', 'hopeful']
  },
  'debunk': {
    exampleSentence: 'The science teacher helped debunk the myth that lightning never strikes the same place twice.',
    synonyms: ['disprove', 'discredit', 'expose'],
    antonyms: ['confirm', 'validate', 'prove']
  },
  'decipher': {
    exampleSentence: 'It took hours to decipher the handwriting on the ancient letter.',
    synonyms: ['decode', 'interpret', 'figure out'],
    antonyms: ['encode', 'scramble', 'confuse']
  },
  'declare': {
    exampleSentence: 'The mayor was about to declare the new park officially open.',
    synonyms: ['announce', 'proclaim', 'state'],
    antonyms: ['conceal', 'hide', 'suppress']
  },
  'decree': {
    exampleSentence: 'The king issued a decree that all children must attend school.',
    synonyms: ['order', 'command', 'mandate'],
    antonyms: ['request', 'suggestion', 'plea']
  },
  'defer': {
    exampleSentence: 'She chose to defer to her lab partner\'s expertise on the chemistry experiment.',
    synonyms: ['yield', 'submit', 'postpone'],
    antonyms: ['lead', 'insist', 'confront']
  },
  'deficient': {
    exampleSentence: 'A diet deficient in vitamins can lead to serious health problems.',
    synonyms: ['lacking', 'insufficient', 'inadequate'],
    antonyms: ['sufficient', 'adequate', 'abundant']
  },
  'defile': {
    exampleSentence: 'Littering can defile the beauty of our local parks and beaches.',
    synonyms: ['pollute', 'tarnish', 'corrupt'],
    antonyms: ['purify', 'cleanse', 'honor']
  },
  'delay': {
    exampleSentence: 'Heavy traffic caused a significant delay on the way to school.',
    synonyms: ['postpone', 'hold up', 'stall'],
    antonyms: ['hasten', 'accelerate', 'advance']
  },
  'delegate': {
    exampleSentence: 'The team captain learned to delegate tasks so everyone could contribute.',
    synonyms: ['assign', 'entrust', 'appoint'],
    antonyms: ['retain', 'keep', 'withhold']
  },
  'delicate': {
    exampleSentence: 'The delicate glass ornament shattered when it fell from the shelf.',
    synonyms: ['fragile', 'dainty', 'fine'],
    antonyms: ['sturdy', 'tough', 'durable']
  },
  'delinquent': {
    exampleSentence: 'The delinquent student was frequently absent and caused disruptions in class.',
    synonyms: ['misbehaving', 'negligent', 'troublesome'],
    antonyms: ['well-behaved', 'responsible', 'dutiful']
  },
  'deplorable': {
    exampleSentence: 'The deplorable conditions of the old playground prompted a community fundraiser.',
    synonyms: ['terrible', 'dreadful', 'shameful'],
    antonyms: ['admirable', 'excellent', 'praiseworthy']
  },
  'derelict': {
    exampleSentence: 'The derelict building on the corner had broken windows and a sagging roof.',
    synonyms: ['abandoned', 'neglected', 'rundown'],
    antonyms: ['maintained', 'cared-for', 'pristine']
  },
  'desecrate': {
    exampleSentence: 'It is wrong to desecrate a memorial that honors those who served our country.',
    synonyms: ['vandalize', 'defile', 'dishonor'],
    antonyms: ['honor', 'respect', 'preserve']
  },
  'desist': {
    exampleSentence: 'The teacher demanded that the students desist from throwing paper airplanes.',
    synonyms: ['stop', 'cease', 'halt'],
    antonyms: ['continue', 'persist', 'proceed']
  },
  'despair': {
    exampleSentence: 'She felt despair after failing the test but decided to study harder next time.',
    synonyms: ['hopelessness', 'anguish', 'misery'],
    antonyms: ['hope', 'joy', 'optimism']
  },
  'destitute': {
    exampleSentence: 'The charity provided food and clothing to destitute families in the community.',
    synonyms: ['poor', 'impoverished', 'needy'],
    antonyms: ['wealthy', 'affluent', 'prosperous']
  },
  'detrimental': {
    exampleSentence: 'Staying up too late can be detrimental to your performance in school.',
    synonyms: ['harmful', 'damaging', 'destructive'],
    antonyms: ['beneficial', 'helpful', 'advantageous']
  },
  'devious': {
    exampleSentence: 'The devious fox tricked the other animals into giving up their food.',
    synonyms: ['sneaky', 'deceitful', 'cunning'],
    antonyms: ['honest', 'straightforward', 'trustworthy']
  },
  'dexterity': {
    exampleSentence: 'The surgeon\'s dexterity with her hands made the complex operation a success.',
    synonyms: ['skill', 'agility', 'nimbleness'],
    antonyms: ['clumsiness', 'awkwardness', 'ineptitude']
  },
  'diction': {
    exampleSentence: 'Good diction is important for public speaking so the audience can understand you.',
    synonyms: ['pronunciation', 'articulation', 'speech'],
    antonyms: ['mumbling', 'slurring']
  },
  'dilapidated': {
    exampleSentence: 'The dilapidated barn looked like it could collapse at any moment.',
    synonyms: ['rundown', 'crumbling', 'decrepit'],
    antonyms: ['restored', 'new', 'sturdy']
  },
  'disadvantage': {
    exampleSentence: 'Not having a calculator put the student at a disadvantage during the math exam.',
    synonyms: ['drawback', 'hindrance', 'setback'],
    antonyms: ['advantage', 'benefit', 'asset']
  },
  'disagreement': {
    exampleSentence: 'The disagreement between the two friends was resolved after they talked things out.',
    synonyms: ['dispute', 'conflict', 'argument'],
    antonyms: ['agreement', 'harmony', 'consensus']
  },
  'discern': {
    exampleSentence: 'It was difficult to discern the difference between the two identical-looking coins.',
    synonyms: ['detect', 'distinguish', 'perceive'],
    antonyms: ['overlook', 'miss', 'ignore']
  },
  'discredit': {
    exampleSentence: 'Spreading false rumors can discredit even the most honest person.',
    synonyms: ['dishonor', 'disgrace', 'undermine'],
    antonyms: ['honor', 'credit', 'validate']
  },
  'discrete': {
    exampleSentence: 'The science experiment had three discrete phases that could not overlap.',
    synonyms: ['separate', 'distinct', 'individual'],
    antonyms: ['combined', 'connected', 'merged']
  },
  'discriminate': {
    exampleSentence: 'It is wrong to discriminate against people because of their background.',
    synonyms: ['distinguish', 'differentiate', 'prejudge'],
    antonyms: ['include', 'accept', 'embrace']
  },
  'disdain': {
    exampleSentence: 'She looked at the messy locker with disdain and refused to share it.',
    synonyms: ['scorn', 'contempt', 'disrespect'],
    antonyms: ['respect', 'admiration', 'esteem']
  },
  'disheveled': {
    exampleSentence: 'After running through the rain, the students arrived at school looking disheveled.',
    synonyms: ['messy', 'unkempt', 'untidy'],
    antonyms: ['neat', 'tidy', 'groomed']
  },
  'dismal': {
    exampleSentence: 'The dismal weather with gray skies and rain made everyone feel gloomy.',
    synonyms: ['gloomy', 'dreary', 'depressing'],
    antonyms: ['cheerful', 'bright', 'sunny']
  },
  'dismantle': {
    exampleSentence: 'The crew began to dismantle the old stage after the school play ended.',
    synonyms: ['take apart', 'disassemble', 'demolish'],
    antonyms: ['assemble', 'build', 'construct']
  },
  'disparage': {
    exampleSentence: 'A good leader should never disparage team members in front of others.',
    synonyms: ['belittle', 'criticize', 'mock'],
    antonyms: ['praise', 'compliment', 'encourage']
  },
  'dispute': {
    exampleSentence: 'The students had a dispute about whose turn it was to use the computer.',
    synonyms: ['argument', 'disagreement', 'conflict'],
    antonyms: ['agreement', 'accord', 'harmony']
  },
  'disregard': {
    exampleSentence: 'If you disregard the safety instructions, you could get hurt in the lab.',
    synonyms: ['ignore', 'overlook', 'neglect'],
    antonyms: ['heed', 'observe', 'follow']
  },
  'dissent': {
    exampleSentence: 'Several members of the committee voiced their dissent against the proposed changes.',
    synonyms: ['disagreement', 'opposition', 'objection'],
    antonyms: ['agreement', 'approval', 'consent']
  },
  'distinct': {
    exampleSentence: 'Each snowflake has a distinct pattern that makes it one of a kind.',
    synonyms: ['clear', 'different', 'unique'],
    antonyms: ['vague', 'similar', 'unclear']
  },
  'distort': {
    exampleSentence: 'Rumors can distort the truth and make a small issue seem much bigger.',
    synonyms: ['twist', 'misrepresent', 'warp'],
    antonyms: ['clarify', 'correct', 'straighten']
  },
  'distraught': {
    exampleSentence: 'The distraught child searched everywhere for her lost puppy.',
    synonyms: ['upset', 'distressed', 'frantic'],
    antonyms: ['calm', 'composed', 'relaxed']
  },
  'distribute': {
    exampleSentence: 'The teacher asked a volunteer to distribute the worksheets to each desk.',
    synonyms: ['hand out', 'deliver', 'allocate'],
    antonyms: ['collect', 'gather', 'hoard']
  },
  'diverse': {
    exampleSentence: 'Our school is home to a diverse group of students from many different backgrounds.',
    synonyms: ['varied', 'assorted', 'mixed'],
    antonyms: ['uniform', 'identical', 'homogeneous']
  },
  'divulge': {
    exampleSentence: 'She promised not to divulge the surprise party plans to anyone.',
    synonyms: ['reveal', 'disclose', 'expose'],
    antonyms: ['conceal', 'hide', 'withhold']
  },
  'docile': {
    exampleSentence: 'The docile horse was gentle enough for even the youngest riders.',
    synonyms: ['obedient', 'gentle', 'tame'],
    antonyms: ['wild', 'unruly', 'rebellious']
  },
  'dominate': {
    exampleSentence: 'The basketball team continued to dominate every game in the tournament.',
    synonyms: ['control', 'overpower', 'rule'],
    antonyms: ['submit', 'yield', 'follow']
  },
  'dubious': {
    exampleSentence: 'The students were dubious about the rumor that school would be canceled.',
    synonyms: ['doubtful', 'uncertain', 'skeptical'],
    antonyms: ['certain', 'confident', 'sure']
  },
  'duress': {
    exampleSentence: 'The confession was given under duress and could not be used in court.',
    synonyms: ['coercion', 'pressure', 'force'],
    antonyms: ['freedom', 'choice', 'willingness']
  },
  'eccentric': {
    exampleSentence: 'The eccentric inventor wore mismatched socks and talked to his pet parrot.',
    synonyms: ['quirky', 'unusual', 'odd'],
    antonyms: ['conventional', 'normal', 'ordinary']
  },
  'ecstatic': {
    exampleSentence: 'She was ecstatic when she found out she had been accepted to her first-choice school.',
    synonyms: ['thrilled', 'overjoyed', 'elated'],
    antonyms: ['miserable', 'depressed', 'unhappy']
  },
  'edible': {
    exampleSentence: 'Not all mushrooms are edible, so you should never eat one you find in the wild.',
    synonyms: ['eatable', 'safe to eat', 'digestible'],
    antonyms: ['inedible', 'poisonous', 'toxic']
  },
  'effusive': {
    exampleSentence: 'The effusive greeting from her grandparents included hugs and tears of joy.',
    synonyms: ['enthusiastic', 'gushing', 'expressive'],
    antonyms: ['reserved', 'restrained', 'subdued']
  },
  'elated': {
    exampleSentence: 'The team was elated after winning the championship game in overtime.',
    synonyms: ['thrilled', 'overjoyed', 'delighted'],
    antonyms: ['depressed', 'dejected', 'miserable']
  },
  'elegant': {
    exampleSentence: 'The elegant ballroom was decorated with crystal chandeliers and silk curtains.',
    synonyms: ['graceful', 'refined', 'sophisticated'],
    antonyms: ['crude', 'clumsy', 'plain']
  },
  'elicit': {
    exampleSentence: 'The teacher tried to elicit responses from the quiet students during the discussion.',
    synonyms: ['draw out', 'provoke', 'extract'],
    antonyms: ['suppress', 'stifle', 'repress']
  },
  'elite': {
    exampleSentence: 'Only the elite athletes from each school were invited to the state competition.',
    synonyms: ['top', 'best', 'superior'],
    antonyms: ['ordinary', 'average', 'inferior']
  },
  'elude': {
    exampleSentence: 'The correct answer continued to elude her until she read the chapter again.',
    synonyms: ['escape', 'evade', 'avoid'],
    antonyms: ['confront', 'face', 'encounter']
  },
  'emancipate': {
    exampleSentence: 'The new law helped emancipate workers from unfair labor conditions.',
    synonyms: ['free', 'liberate', 'release'],
    antonyms: ['enslave', 'imprison', 'confine']
  },
  'embark': {
    exampleSentence: 'The eighth graders were about to embark on their week-long field trip to Washington D.C.',
    synonyms: ['begin', 'start', 'commence'],
    antonyms: ['finish', 'conclude', 'end']
  },
  'embellish': {
    exampleSentence: 'He tends to embellish his stories to make them sound more exciting.',
    synonyms: ['exaggerate', 'decorate', 'enhance'],
    antonyms: ['simplify', 'understate', 'diminish']
  },
  'enamored': {
    exampleSentence: 'She became enamored with marine biology after visiting the aquarium.',
    synonyms: ['charmed', 'captivated', 'fascinated'],
    antonyms: ['repulsed', 'uninterested', 'disgusted']
  },
  'encroach': {
    exampleSentence: 'The weeds began to encroach on the garden and choke out the flowers.',
    synonyms: ['intrude', 'invade', 'trespass'],
    antonyms: ['retreat', 'withdraw', 'respect']
  },
  'endanger': {
    exampleSentence: 'Pollution and habitat loss continue to endanger many animal species.',
    synonyms: ['threaten', 'jeopardize', 'imperil'],
    antonyms: ['protect', 'safeguard', 'preserve']
  },
  'endorse': {
    exampleSentence: 'Several teachers decided to endorse the student council\'s plan for a recycling program.',
    synonyms: ['support', 'approve', 'back'],
    antonyms: ['oppose', 'reject', 'denounce']
  },
  'enigma': {
    exampleSentence: 'The disappearance of the ancient civilization remains an enigma to historians.',
    synonyms: ['mystery', 'puzzle', 'riddle'],
    antonyms: ['solution', 'answer', 'certainty']
  },
  'ensure': {
    exampleSentence: 'Double-checking your work will ensure that you catch any mistakes.',
    synonyms: ['guarantee', 'confirm', 'secure'],
    antonyms: ['endanger', 'risk', 'jeopardize']
  },
  'enthrall': {
    exampleSentence: 'The magician\'s incredible tricks managed to enthrall the entire audience.',
    synonyms: ['captivate', 'fascinate', 'enchant'],
    antonyms: ['bore', 'repel', 'disgust']
  },
  'enumerate': {
    exampleSentence: 'The teacher asked us to enumerate the reasons why recycling is important.',
    synonyms: ['list', 'count', 'catalog'],
    antonyms: ['estimate', 'guess', 'generalize']
  },
  'envious': {
    exampleSentence: 'She was envious of her friend\'s ability to play the piano so beautifully.',
    synonyms: ['jealous', 'covetous', 'resentful'],
    antonyms: ['content', 'satisfied', 'generous']
  },
  'epitome': {
    exampleSentence: 'The straight-A student was the epitome of hard work and dedication.',
    synonyms: ['embodiment', 'example', 'model'],
    antonyms: ['opposite', 'antithesis', 'contradiction']
  },
  'erroneous': {
    exampleSentence: 'The erroneous answer on the test cost her five valuable points.',
    synonyms: ['incorrect', 'wrong', 'mistaken'],
    antonyms: ['correct', 'accurate', 'right']
  },
  'ethical': {
    exampleSentence: 'Making the ethical choice is not always easy, but it is always right.',
    synonyms: ['moral', 'principled', 'honest'],
    antonyms: ['unethical', 'immoral', 'dishonest']
  },
  'eulogy': {
    exampleSentence: 'The student delivered a touching eulogy honoring the beloved retired teacher.',
    synonyms: ['tribute', 'praise', 'memorial'],
    antonyms: ['criticism', 'condemnation', 'insult']
  },
  'excerpt': {
    exampleSentence: 'The teacher read an excerpt from the novel to get us interested in the story.',
    synonyms: ['passage', 'selection', 'extract'],
    antonyms: ['whole', 'entirety', 'complete work']
  },
  'exempt': {
    exampleSentence: 'Students who scored above ninety were exempt from taking the final exam.',
    synonyms: ['excused', 'free', 'released'],
    antonyms: ['required', 'obligated', 'bound']
  },
  'exhibit': {
    exampleSentence: 'The museum will exhibit paintings from local artists throughout the month.',
    synonyms: ['display', 'show', 'present'],
    antonyms: ['hide', 'conceal', 'withdraw']
  },
  'exorbitant': {
    exampleSentence: 'The exorbitant price of the sneakers made them impossible for most students to buy.',
    synonyms: ['excessive', 'outrageous', 'overpriced'],
    antonyms: ['reasonable', 'affordable', 'cheap']
  },
  'expedient': {
    exampleSentence: 'Taking the shortcut seemed like an expedient solution to get to class on time.',
    synonyms: ['convenient', 'practical', 'advantageous'],
    antonyms: ['inconvenient', 'impractical', 'disadvantageous']
  },
  'expedite': {
    exampleSentence: 'The principal promised to expedite the approval of the new after-school clubs.',
    synonyms: ['speed up', 'hasten', 'accelerate'],
    antonyms: ['delay', 'slow down', 'hinder']
  },
  'fallacy': {
    exampleSentence: 'The idea that goldfish have a three-second memory is a common fallacy.',
    synonyms: ['misconception', 'myth', 'error'],
    antonyms: ['truth', 'fact', 'reality']
  },
  'feign': {
    exampleSentence: 'He tried to feign illness so he could stay home from school.',
    synonyms: ['pretend', 'fake', 'simulate'],
    antonyms: ['reveal', 'show', 'be genuine']
  },
  'festive': {
    exampleSentence: 'The festive decorations made the gymnasium feel like a winter wonderland.',
    synonyms: ['celebratory', 'joyful', 'merry'],
    antonyms: ['somber', 'gloomy', 'dull']
  },
  'fiendish': {
    exampleSentence: 'The fiendish puzzle had so many twists that nobody could solve it.',
    synonyms: ['wicked', 'devilish', 'diabolical'],
    antonyms: ['kind', 'gentle', 'angelic']
  },
  'flagrant': {
    exampleSentence: 'The flagrant violation of the dress code resulted in an immediate trip to the office.',
    synonyms: ['blatant', 'obvious', 'outrageous'],
    antonyms: ['subtle', 'minor', 'hidden']
  },
  'flair': {
    exampleSentence: 'She had a natural flair for creative writing that impressed all her teachers.',
    synonyms: ['talent', 'skill', 'aptitude'],
    antonyms: ['inability', 'weakness', 'clumsiness']
  },
  'flaunt': {
    exampleSentence: 'It is not polite to flaunt expensive things in front of people who have less.',
    synonyms: ['show off', 'boast', 'parade'],
    antonyms: ['hide', 'conceal', 'downplay']
  },
  'flexible': {
    exampleSentence: 'A flexible schedule allows you to balance homework and extracurricular activities.',
    synonyms: ['adaptable', 'versatile', 'adjustable'],
    antonyms: ['rigid', 'stiff', 'inflexible']
  },
  'florid': {
    exampleSentence: 'The author\'s florid writing style used many descriptive words and long sentences.',
    synonyms: ['elaborate', 'ornate', 'flowery'],
    antonyms: ['plain', 'simple', 'unadorned']
  },
  'fluctuate': {
    exampleSentence: 'Temperatures in spring tend to fluctuate between warm and cold from day to day.',
    synonyms: ['vary', 'change', 'shift'],
    antonyms: ['stabilize', 'remain steady', 'stay constant']
  },
  'foresight': {
    exampleSentence: 'Her foresight in bringing an umbrella paid off when it started raining after school.',
    synonyms: ['forethought', 'planning', 'anticipation'],
    antonyms: ['hindsight', 'shortsightedness', 'carelessness']
  },
  'forfeit': {
    exampleSentence: 'The team had to forfeit the game because they did not have enough players.',
    synonyms: ['surrender', 'lose', 'give up'],
    antonyms: ['win', 'gain', 'retain']
  },
  'frantic': {
    exampleSentence: 'The frantic search for the missing homework ended when she found it in her locker.',
    synonyms: ['panicked', 'desperate', 'frenzied'],
    antonyms: ['calm', 'relaxed', 'composed']
  },
  'frenetic': {
    exampleSentence: 'The frenetic pace of the last week of school left everyone exhausted.',
    synonyms: ['frantic', 'hectic', 'wild'],
    antonyms: ['calm', 'relaxed', 'leisurely']
  },
  'frivolous': {
    exampleSentence: 'Spending your whole allowance on frivolous items leaves nothing for important things.',
    synonyms: ['silly', 'trivial', 'unimportant'],
    antonyms: ['serious', 'important', 'meaningful']
  },
  'fugitive': {
    exampleSentence: 'The police searched the entire city for the fugitive who had escaped from jail.',
    synonyms: ['runaway', 'escapee', 'outlaw'],
    antonyms: ['captive', 'prisoner', 'inmate']
  },
  'fundamental': {
    exampleSentence: 'Understanding fractions is fundamental to success in higher-level math.',
    synonyms: ['basic', 'essential', 'core'],
    antonyms: ['advanced', 'secondary', 'optional']
  },
  'garrulous': {
    exampleSentence: 'The garrulous student talked so much that the teacher had to ask him to be quiet.',
    synonyms: ['talkative', 'chatty', 'verbose'],
    antonyms: ['quiet', 'reserved', 'taciturn']
  },
  'gaunt': {
    exampleSentence: 'After being lost in the woods for three days, the hikers looked gaunt and tired.',
    synonyms: ['thin', 'haggard', 'emaciated'],
    antonyms: ['plump', 'healthy', 'robust']
  },
  'generate': {
    exampleSentence: 'Solar panels generate electricity from sunlight without creating pollution.',
    synonyms: ['produce', 'create', 'make'],
    antonyms: ['destroy', 'consume', 'deplete']
  },
  'generous': {
    exampleSentence: 'The generous donation from the local business helped build a new playground.',
    synonyms: ['giving', 'charitable', 'liberal'],
    antonyms: ['stingy', 'selfish', 'greedy']
  },
  'genial': {
    exampleSentence: 'The genial bus driver greeted every student with a warm smile each morning.',
    synonyms: ['friendly', 'cheerful', 'warm'],
    antonyms: ['unfriendly', 'cold', 'hostile']
  },
  'gingerly': {
    exampleSentence: 'She gingerly placed the fragile vase back on the shelf so it would not break.',
    synonyms: ['carefully', 'cautiously', 'delicately'],
    antonyms: ['carelessly', 'roughly', 'recklessly']
  },
  'gist': {
    exampleSentence: 'Even though he missed the beginning, he understood the gist of the presentation.',
    synonyms: ['essence', 'main point', 'summary'],
    antonyms: ['details', 'specifics', 'elaboration']
  },
  'grandiose': {
    exampleSentence: 'His grandiose plan to build a full-size castle for the science fair was unrealistic.',
    synonyms: ['impressive', 'ambitious', 'extravagant'],
    antonyms: ['modest', 'humble', 'simple']
  },
  'gratify': {
    exampleSentence: 'It will gratify the volunteers to see how their hard work helped the community.',
    synonyms: ['please', 'satisfy', 'delight'],
    antonyms: ['disappoint', 'displease', 'frustrate']
  },
  'grave': {
    exampleSentence: 'The principal spoke in a grave tone about the importance of fire safety.',
    synonyms: ['serious', 'solemn', 'severe'],
    antonyms: ['lighthearted', 'trivial', 'unimportant']
  },
  'gusto': {
    exampleSentence: 'The hungry students ate their pizza with great gusto during the class party.',
    synonyms: ['enthusiasm', 'zeal', 'relish'],
    antonyms: ['apathy', 'indifference', 'reluctance']
  },
  'hapless': {
    exampleSentence: 'The hapless goalkeeper let in three goals during the first half of the game.',
    synonyms: ['unlucky', 'unfortunate', 'ill-fated'],
    antonyms: ['lucky', 'fortunate', 'blessed']
  },
  'harbor': {
    exampleSentence: 'It is unhealthy to harbor anger toward someone instead of talking it out.',
    synonyms: ['shelter', 'hold', 'conceal'],
    antonyms: ['release', 'expose', 'express']
  },
  'harmonious': {
    exampleSentence: 'The choir produced a harmonious sound that filled the entire auditorium.',
    synonyms: ['melodious', 'balanced', 'peaceful'],
    antonyms: ['discordant', 'clashing', 'conflicting']
  },
  'hasten': {
    exampleSentence: 'The teacher asked the students to hasten their work so they could finish before the bell.',
    synonyms: ['hurry', 'rush', 'speed up'],
    antonyms: ['delay', 'slow down', 'linger']
  },
  'hindrance': {
    exampleSentence: 'Poor internet was a major hindrance to completing the online homework.',
    synonyms: ['obstacle', 'barrier', 'impediment'],
    antonyms: ['help', 'aid', 'advantage']
  },
  'humane': {
    exampleSentence: 'The animal shelter promotes humane treatment of all pets in the community.',
    synonyms: ['compassionate', 'kind', 'merciful'],
    antonyms: ['cruel', 'inhumane', 'brutal']
  },
  'humble': {
    exampleSentence: 'Despite winning the award, the humble student thanked her teammates for their help.',
    synonyms: ['modest', 'unassuming', 'meek'],
    antonyms: ['arrogant', 'proud', 'conceited']
  },
  'hybrid': {
    exampleSentence: 'The hybrid car runs on both electricity and gasoline to save fuel.',
    synonyms: ['mix', 'blend', 'combination'],
    antonyms: ['pure', 'unmixed', 'single']
  },
  'hypothesis': {
    exampleSentence: 'Before starting the experiment, each student had to write a hypothesis.',
    synonyms: ['theory', 'assumption', 'prediction'],
    antonyms: ['fact', 'proof', 'certainty']
  },
  'illiterate': {
    exampleSentence: 'Volunteers taught illiterate adults how to read and write at the community center.',
    synonyms: ['uneducated', 'unlettered', 'untaught'],
    antonyms: ['literate', 'educated', 'learned']
  },
  'illustrious': {
    exampleSentence: 'The illustrious scientist was known around the world for her discoveries.',
    synonyms: ['famous', 'renowned', 'distinguished'],
    antonyms: ['unknown', 'obscure', 'insignificant']
  },
  'immaculate': {
    exampleSentence: 'The immaculate classroom was spotless after the students cleaned it for open house.',
    synonyms: ['spotless', 'pristine', 'flawless'],
    antonyms: ['dirty', 'messy', 'filthy']
  },
  'immensely': {
    exampleSentence: 'The students enjoyed the field trip immensely and talked about it for weeks.',
    synonyms: ['greatly', 'enormously', 'tremendously'],
    antonyms: ['slightly', 'barely', 'minimally']
  },
  'immune': {
    exampleSentence: 'After getting the vaccine, she was immune to the flu for the rest of the season.',
    synonyms: ['resistant', 'protected', 'unaffected'],
    antonyms: ['vulnerable', 'susceptible', 'exposed']
  },
  'impair': {
    exampleSentence: 'Lack of sleep can impair your ability to concentrate during class.',
    synonyms: ['weaken', 'damage', 'diminish'],
    antonyms: ['improve', 'strengthen', 'enhance']
  },
  'impartial': {
    exampleSentence: 'A good referee must be impartial and not favor either team.',
    synonyms: ['fair', 'unbiased', 'neutral'],
    antonyms: ['biased', 'partial', 'prejudiced']
  },
  'impediment': {
    exampleSentence: 'A speech impediment did not stop the student from winning the debate competition.',
    synonyms: ['obstacle', 'hindrance', 'barrier'],
    antonyms: ['aid', 'advantage', 'assistance']
  },
  'imperative': {
    exampleSentence: 'It is imperative that you study for the HSPT if you want a high score.',
    synonyms: ['essential', 'crucial', 'vital'],
    antonyms: ['optional', 'unnecessary', 'unimportant']
  },
  'incensed': {
    exampleSentence: 'The students were incensed when they found out the field trip was canceled.',
    synonyms: ['furious', 'enraged', 'angry'],
    antonyms: ['calm', 'pleased', 'delighted']
  },
  'incompetent': {
    exampleSentence: 'The incompetent babysitter could not even heat up a simple meal.',
    synonyms: ['incapable', 'unskilled', 'inept'],
    antonyms: ['competent', 'capable', 'skilled']
  },
  'inconspicuous': {
    exampleSentence: 'He tried to be inconspicuous as he snuck into the back row of the assembly.',
    synonyms: ['unnoticeable', 'hidden', 'discreet'],
    antonyms: ['conspicuous', 'obvious', 'noticeable']
  },
  'incriminate': {
    exampleSentence: 'The security camera footage helped incriminate the person who vandalized the gym.',
    synonyms: ['accuse', 'implicate', 'charge'],
    antonyms: ['exonerate', 'clear', 'absolve']
  },
  'indecent': {
    exampleSentence: 'The indecent behavior at the assembly led to new rules about conduct.',
    synonyms: ['inappropriate', 'offensive', 'improper'],
    antonyms: ['decent', 'proper', 'appropriate']
  },
  'indifferent': {
    exampleSentence: 'The indifferent student shrugged when asked about his missing homework.',
    synonyms: ['unconcerned', 'apathetic', 'uninterested'],
    antonyms: ['interested', 'concerned', 'passionate']
  },
  'indispensable': {
    exampleSentence: 'A good dictionary is indispensable for building your vocabulary.',
    synonyms: ['essential', 'necessary', 'vital'],
    antonyms: ['unnecessary', 'expendable', 'optional']
  },
  'induce': {
    exampleSentence: 'The warm milk was meant to induce sleep before the early morning field trip.',
    synonyms: ['cause', 'trigger', 'bring about'],
    antonyms: ['prevent', 'stop', 'deter']
  },
  'induct': {
    exampleSentence: 'The school will induct ten new members into the National Honor Society this year.',
    synonyms: ['admit', 'install', 'initiate'],
    antonyms: ['expel', 'dismiss', 'remove']
  },
  'inert': {
    exampleSentence: 'The inert gas did not react with any of the other chemicals in the experiment.',
    synonyms: ['inactive', 'motionless', 'still'],
    antonyms: ['active', 'reactive', 'energetic']
  },
  'infamous': {
    exampleSentence: 'The infamous pirate was feared by every sailor on the seven seas.',
    synonyms: ['notorious', 'disreputable', 'scandalous'],
    antonyms: ['reputable', 'respected', 'honorable']
  },
  'infinite': {
    exampleSentence: 'The night sky seemed to contain an infinite number of stars.',
    synonyms: ['endless', 'limitless', 'boundless'],
    antonyms: ['finite', 'limited', 'restricted']
  },
  'infirmity': {
    exampleSentence: 'Despite her infirmity, the elderly woman still tended her garden every day.',
    synonyms: ['weakness', 'ailment', 'frailty'],
    antonyms: ['strength', 'health', 'vigor']
  },
  'infringe': {
    exampleSentence: 'Copying someone else\'s artwork without permission can infringe on their rights.',
    synonyms: ['violate', 'breach', 'transgress'],
    antonyms: ['respect', 'honor', 'uphold']
  },
  'inordinate': {
    exampleSentence: 'She spent an inordinate amount of time perfecting her science project poster.',
    synonyms: ['excessive', 'extreme', 'unreasonable'],
    antonyms: ['moderate', 'reasonable', 'modest']
  },
  'inquisitive': {
    exampleSentence: 'The inquisitive child asked questions about everything she saw at the museum.',
    synonyms: ['curious', 'questioning', 'nosy'],
    antonyms: ['uninterested', 'indifferent', 'apathetic']
  },
  'insinuate': {
    exampleSentence: 'He did not say it directly but tried to insinuate that someone had cheated.',
    synonyms: ['imply', 'suggest', 'hint'],
    antonyms: ['declare', 'state clearly', 'announce']
  },
  'insipid': {
    exampleSentence: 'The insipid cafeteria food had almost no flavor at all.',
    synonyms: ['bland', 'tasteless', 'dull'],
    antonyms: ['flavorful', 'exciting', 'interesting']
  },
  'insolent': {
    exampleSentence: 'The insolent student talked back to the teacher and was sent to the office.',
    synonyms: ['rude', 'disrespectful', 'impertinent'],
    antonyms: ['polite', 'respectful', 'courteous']
  },
  'instigate': {
    exampleSentence: 'The troublemaker tried to instigate a food fight during lunch.',
    synonyms: ['provoke', 'incite', 'start'],
    antonyms: ['prevent', 'stop', 'discourage']
  },
  'instill': {
    exampleSentence: 'Good teachers instill a love of learning in their students.',
    synonyms: ['implant', 'inspire', 'teach'],
    antonyms: ['remove', 'extract', 'discourage']
  },
  'instinctively': {
    exampleSentence: 'She instinctively reached out to catch the ball before it hit the window.',
    synonyms: ['naturally', 'automatically', 'intuitively'],
    antonyms: ['deliberately', 'consciously', 'intentionally']
  },
  'intact': {
    exampleSentence: 'Amazingly, the glass vase remained intact even after falling off the table.',
    synonyms: ['whole', 'undamaged', 'unbroken'],
    antonyms: ['broken', 'damaged', 'shattered']
  },
  'integrity': {
    exampleSentence: 'A person of integrity always tells the truth, even when it is difficult.',
    synonyms: ['honesty', 'honor', 'morality'],
    antonyms: ['dishonesty', 'corruption', 'deceit']
  },
  'interfere': {
    exampleSentence: 'Parents should not interfere when children are learning to solve problems on their own.',
    synonyms: ['meddle', 'intrude', 'intervene'],
    antonyms: ['assist', 'help', 'ignore']
  },
  'interminable': {
    exampleSentence: 'The interminable wait for test results made everyone anxious.',
    synonyms: ['endless', 'unending', 'never-ending'],
    antonyms: ['brief', 'short', 'fleeting']
  },
  'interval': {
    exampleSentence: 'There was a short interval between classes to allow students to get to their lockers.',
    synonyms: ['gap', 'break', 'pause'],
    antonyms: ['continuation', 'extension']
  },
  'intimidate': {
    exampleSentence: 'The older students sometimes intimidate the younger ones without realizing it.',
    synonyms: ['frighten', 'scare', 'bully'],
    antonyms: ['encourage', 'reassure', 'comfort']
  },
  'intricate': {
    exampleSentence: 'The intricate design of the snowflake could only be seen under a microscope.',
    synonyms: ['complex', 'detailed', 'elaborate'],
    antonyms: ['simple', 'plain', 'basic']
  },
  'intriguing': {
    exampleSentence: 'The mystery novel had an intriguing plot that kept the reader guessing.',
    synonyms: ['fascinating', 'captivating', 'interesting'],
    antonyms: ['boring', 'dull', 'uninteresting']
  },
  'intrusive': {
    exampleSentence: 'The intrusive questions about her personal life made her uncomfortable.',
    synonyms: ['invasive', 'nosy', 'prying'],
    antonyms: ['respectful', 'discreet', 'reserved']
  },
  'inundate': {
    exampleSentence: 'Heavy rains can inundate low-lying areas and cause widespread flooding.',
    synonyms: ['flood', 'overwhelm', 'swamp'],
    antonyms: ['drain', 'dry out', 'empty']
  },
  'invigorate': {
    exampleSentence: 'A morning jog can invigorate you and give you energy for the whole day.',
    synonyms: ['energize', 'refresh', 'stimulate'],
    antonyms: ['tire', 'exhaust', 'weaken']
  },
  'invincible': {
    exampleSentence: 'After winning ten games in a row, the team felt invincible.',
    synonyms: ['unbeatable', 'unconquerable', 'unstoppable'],
    antonyms: ['vulnerable', 'weak', 'beatable']
  },
  'irrational': {
    exampleSentence: 'His irrational fear of butterflies made his friends laugh.',
    synonyms: ['unreasonable', 'illogical', 'absurd'],
    antonyms: ['rational', 'logical', 'sensible']
  },
  'irrelevant': {
    exampleSentence: 'The student\'s comment about lunch was irrelevant to the math lesson.',
    synonyms: ['unrelated', 'unimportant', 'immaterial'],
    antonyms: ['relevant', 'pertinent', 'important']
  },
  'isolate': {
    exampleSentence: 'The scientist had to isolate the bacteria to study them more closely.',
    synonyms: ['separate', 'detach', 'segregate'],
    antonyms: ['connect', 'join', 'integrate']
  },
  'isolated': {
    exampleSentence: 'The isolated cabin in the mountains had no phone service or internet.',
    synonyms: ['remote', 'secluded', 'lonely'],
    antonyms: ['connected', 'central', 'populated']
  },
  'jeer': {
    exampleSentence: 'It is wrong to jeer at someone who makes a mistake during a game.',
    synonyms: ['mock', 'taunt', 'ridicule'],
    antonyms: ['cheer', 'encourage', 'applaud']
  },
  'jeopardize': {
    exampleSentence: 'Missing too many classes could jeopardize your chances of passing the course.',
    synonyms: ['endanger', 'risk', 'threaten'],
    antonyms: ['protect', 'safeguard', 'secure']
  },
  'jovial': {
    exampleSentence: 'The jovial teacher always started class with a joke to put students at ease.',
    synonyms: ['cheerful', 'merry', 'jolly'],
    antonyms: ['gloomy', 'sad', 'miserable']
  },
  'jubilant': {
    exampleSentence: 'The jubilant fans rushed the field after their team won the championship.',
    synonyms: ['joyful', 'triumphant', 'elated'],
    antonyms: ['sad', 'dejected', 'disappointed']
  },
  'knoll': {
    exampleSentence: 'The students sat on the grassy knoll to eat lunch and enjoy the sunshine.',
    synonyms: ['hill', 'mound', 'rise'],
    antonyms: ['valley', 'hollow', 'depression']
  },
  'lament': {
    exampleSentence: 'Students lament the end of summer vacation every year when school starts.',
    synonyms: ['mourn', 'grieve', 'regret'],
    antonyms: ['celebrate', 'rejoice', 'cheer']
  },
  'latitude': {
    exampleSentence: 'The teacher gave students the latitude to choose their own research topics.',
    synonyms: ['freedom', 'flexibility', 'leeway'],
    antonyms: ['restriction', 'constraint', 'limitation']
  },
  'lavish': {
    exampleSentence: 'The lavish banquet featured gourmet food and elegant decorations.',
    synonyms: ['extravagant', 'luxurious', 'opulent'],
    antonyms: ['modest', 'simple', 'frugal']
  },
  'legitimate': {
    exampleSentence: 'Having a doctor\'s note is a legitimate reason for missing school.',
    synonyms: ['valid', 'lawful', 'genuine'],
    antonyms: ['illegitimate', 'invalid', 'fake']
  },
  'liberate': {
    exampleSentence: 'The firefighters worked to liberate the kitten that was stuck in the tree.',
    synonyms: ['free', 'release', 'rescue'],
    antonyms: ['imprison', 'confine', 'capture']
  },
  'linger': {
    exampleSentence: 'The smell of fresh cookies seemed to linger in the hallway all afternoon.',
    synonyms: ['remain', 'stay', 'persist'],
    antonyms: ['leave', 'depart', 'vanish']
  },
  'listlessness': {
    exampleSentence: 'The hot weather caused a sense of listlessness that made it hard to focus on studying.',
    synonyms: ['lethargy', 'apathy', 'sluggishness'],
    antonyms: ['energy', 'enthusiasm', 'vitality']
  },
  'livid': {
    exampleSentence: 'Mom was livid when she discovered the muddy footprints across the clean floor.',
    synonyms: ['furious', 'enraged', 'infuriated'],
    antonyms: ['calm', 'pleased', 'delighted']
  },
  'loathe': {
    exampleSentence: 'Many students loathe waking up early on cold winter mornings.',
    synonyms: ['despise', 'hate', 'detest'],
    antonyms: ['love', 'adore', 'enjoy']
  },
  'lofty': {
    exampleSentence: 'She had lofty goals of becoming the first person in her family to attend college.',
    synonyms: ['high', 'elevated', 'ambitious'],
    antonyms: ['low', 'modest', 'humble']
  },
  'lucrative': {
    exampleSentence: 'Her lemonade stand turned out to be a lucrative business on hot summer days.',
    synonyms: ['profitable', 'rewarding', 'gainful'],
    antonyms: ['unprofitable', 'worthless', 'losing']
  },
  'maintain': {
    exampleSentence: 'It is important to maintain good study habits throughout the school year.',
    synonyms: ['preserve', 'sustain', 'keep'],
    antonyms: ['neglect', 'abandon', 'destroy']
  },
  'malcontent': {
    exampleSentence: 'The malcontent in the group complained about every decision the team made.',
    synonyms: ['complainer', 'grumbler', 'dissatisfied person'],
    antonyms: ['optimist', 'supporter', 'enthusiast']
  },
  'malice': {
    exampleSentence: 'She did not act with malice; it was simply an honest mistake.',
    synonyms: ['spite', 'ill will', 'hatred'],
    antonyms: ['goodwill', 'kindness', 'benevolence']
  },
  'malignant': {
    exampleSentence: 'The doctor was relieved to find that the growth was not malignant.',
    synonyms: ['harmful', 'dangerous', 'destructive'],
    antonyms: ['harmless', 'benign', 'beneficial']
  },
  'malleable': {
    exampleSentence: 'Gold is a malleable metal that can be shaped into thin sheets.',
    synonyms: ['flexible', 'pliable', 'adaptable'],
    antonyms: ['rigid', 'stiff', 'inflexible']
  },
  'mandate': {
    exampleSentence: 'The school issued a mandate requiring all students to wear identification badges.',
    synonyms: ['order', 'command', 'decree'],
    antonyms: ['request', 'suggestion', 'option']
  },
  'mar': {
    exampleSentence: 'One careless scratch can mar the surface of a brand-new desk.',
    synonyms: ['damage', 'spoil', 'blemish'],
    antonyms: ['repair', 'improve', 'enhance']
  },
  'meander': {
    exampleSentence: 'The stream seemed to meander lazily through the meadow.',
    synonyms: ['wander', 'wind', 'roam'],
    antonyms: ['rush', 'hurry', 'go straight']
  },
  'mediocre': {
    exampleSentence: 'His mediocre test score showed that he needed to study harder.',
    synonyms: ['average', 'ordinary', 'so-so'],
    antonyms: ['excellent', 'outstanding', 'exceptional']
  },
  'meek': {
    exampleSentence: 'The meek student never spoke up in class, even when she knew the answer.',
    synonyms: ['timid', 'submissive', 'mild'],
    antonyms: ['bold', 'assertive', 'aggressive']
  },
  'melancholy': {
    exampleSentence: 'A feeling of melancholy came over him on the last day of summer camp.',
    synonyms: ['sadness', 'gloom', 'sorrow'],
    antonyms: ['happiness', 'joy', 'cheerfulness']
  },
  'merge': {
    exampleSentence: 'The two small reading groups decided to merge into one larger discussion circle.',
    synonyms: ['combine', 'unite', 'blend'],
    antonyms: ['separate', 'divide', 'split']
  },
  'merit': {
    exampleSentence: 'Students are chosen for the honor roll based on merit, not favoritism.',
    synonyms: ['worth', 'value', 'excellence'],
    antonyms: ['fault', 'weakness', 'deficiency']
  },
  'misconception': {
    exampleSentence: 'It is a common misconception that bats are blind.',
    synonyms: ['misunderstanding', 'fallacy', 'false belief'],
    antonyms: ['truth', 'fact', 'understanding']
  },
  'miscreant': {
    exampleSentence: 'The miscreant who pulled the fire alarm was quickly identified by the cameras.',
    synonyms: ['troublemaker', 'wrongdoer', 'villain'],
    antonyms: ['hero', 'saint', 'model citizen']
  },
  'modify': {
    exampleSentence: 'The teacher offered to modify the assignment for students who needed extra support.',
    synonyms: ['change', 'alter', 'adjust'],
    antonyms: ['preserve', 'maintain', 'keep']
  },
  'monotonous': {
    exampleSentence: 'The monotonous lecture put several students to sleep within the first ten minutes.',
    synonyms: ['boring', 'tedious', 'repetitive'],
    antonyms: ['exciting', 'varied', 'interesting']
  },
  'moral': {
    exampleSentence: 'The moral of the fable was that honesty is always the best policy.',
    synonyms: ['ethical', 'virtuous', 'righteous'],
    antonyms: ['immoral', 'unethical', 'corrupt']
  },
  'morose': {
    exampleSentence: 'He became morose after losing the student council election.',
    synonyms: ['gloomy', 'sullen', 'melancholy'],
    antonyms: ['cheerful', 'happy', 'optimistic']
  },
  'muddle': {
    exampleSentence: 'Too many instructions can muddle even the simplest task.',
    synonyms: ['confuse', 'mix up', 'jumble'],
    antonyms: ['clarify', 'organize', 'simplify']
  },
  'municipality': {
    exampleSentence: 'The municipality approved the construction of a new library downtown.',
    synonyms: ['city', 'town', 'district'],
    antonyms: ['countryside', 'rural area']
  },
  'mythical': {
    exampleSentence: 'The mythical unicorn is a popular creature in children\'s stories.',
    synonyms: ['legendary', 'fictional', 'imaginary'],
    antonyms: ['real', 'actual', 'factual']
  },
  'naive': {
    exampleSentence: 'The naive freshman believed everything the older students told him.',
    synonyms: ['innocent', 'gullible', 'trusting'],
    antonyms: ['sophisticated', 'worldly', 'skeptical']
  },
  'nimble': {
    exampleSentence: 'The nimble gymnast performed a flawless routine on the balance beam.',
    synonyms: ['agile', 'quick', 'light-footed'],
    antonyms: ['clumsy', 'slow', 'awkward']
  },
  'nocturnal': {
    exampleSentence: 'Owls are nocturnal animals that are most active during the night.',
    synonyms: ['nighttime', 'night-active'],
    antonyms: ['diurnal', 'daytime']
  },
  'noisome': {
    exampleSentence: 'The noisome smell from the dumpster made students hold their noses.',
    synonyms: ['foul', 'disgusting', 'offensive'],
    antonyms: ['pleasant', 'fragrant', 'sweet']
  },
  'nomad': {
    exampleSentence: 'The ancient nomad traveled from place to place in search of food and water.',
    synonyms: ['wanderer', 'traveler', 'rover'],
    antonyms: ['settler', 'resident', 'homebody']
  },
  'nomadic': {
    exampleSentence: 'The nomadic tribe moved with the seasons to find the best grazing land.',
    synonyms: ['wandering', 'roaming', 'traveling'],
    antonyms: ['settled', 'stationary', 'fixed']
  },
  'notorious': {
    exampleSentence: 'The school bully was notorious for picking on younger students.',
    synonyms: ['infamous', 'well-known', 'disreputable'],
    antonyms: ['unknown', 'reputable', 'respected']
  },
  'novice': {
    exampleSentence: 'As a novice at chess, she still had a lot to learn about strategy.',
    synonyms: ['beginner', 'newcomer', 'amateur'],
    antonyms: ['expert', 'veteran', 'professional']
  },
  'noxious': {
    exampleSentence: 'The noxious fumes from the chemistry experiment forced everyone to open the windows.',
    synonyms: ['toxic', 'harmful', 'poisonous'],
    antonyms: ['harmless', 'safe', 'beneficial']
  },
  'objective': {
    exampleSentence: 'The objective of the science fair project was to test the effects of sunlight on plants.',
    synonyms: ['goal', 'purpose', 'aim'],
    antonyms: ['subjective', 'biased', 'personal']
  },
  'obliterate': {
    exampleSentence: 'The powerful storm threatened to obliterate the sand castles on the beach.',
    synonyms: ['destroy', 'annihilate', 'erase'],
    antonyms: ['create', 'build', 'preserve']
  },
  'oblivious': {
    exampleSentence: 'He was so absorbed in his book that he was oblivious to the noise around him.',
    synonyms: ['unaware', 'ignorant', 'unconscious'],
    antonyms: ['aware', 'conscious', 'alert']
  },
  'obsolete': {
    exampleSentence: 'Typewriters are now obsolete because everyone uses computers.',
    synonyms: ['outdated', 'old-fashioned', 'antiquated'],
    antonyms: ['modern', 'current', 'up-to-date']
  },
  'obstacle': {
    exampleSentence: 'A lack of funding was the biggest obstacle to building a new gym.',
    synonyms: ['barrier', 'hindrance', 'hurdle'],
    antonyms: ['aid', 'advantage', 'benefit']
  },
  'obstruct': {
    exampleSentence: 'Fallen branches obstruct the path after every big storm.',
    synonyms: ['block', 'hinder', 'impede'],
    antonyms: ['clear', 'open', 'facilitate']
  },
  'omnipotent': {
    exampleSentence: 'In the story, the wizard was described as an omnipotent being who controlled all of nature.',
    synonyms: ['all-powerful', 'supreme', 'almighty'],
    antonyms: ['powerless', 'weak', 'helpless']
  },
  'opaque': {
    exampleSentence: 'The opaque curtains blocked all sunlight from entering the room.',
    synonyms: ['cloudy', 'non-transparent', 'dark'],
    antonyms: ['transparent', 'clear', 'see-through']
  },
  'oration': {
    exampleSentence: 'The valedictorian delivered a moving oration at the graduation ceremony.',
    synonyms: ['speech', 'address', 'lecture'],
    antonyms: ['silence', 'whisper']
  },
  'ornate': {
    exampleSentence: 'The ornate picture frame was covered with gold leaf and tiny jewels.',
    synonyms: ['elaborate', 'decorative', 'fancy'],
    antonyms: ['plain', 'simple', 'unadorned']
  },
  'orthodox': {
    exampleSentence: 'The orthodox approach to teaching math focuses on memorizing formulas.',
    synonyms: ['traditional', 'conventional', 'standard'],
    antonyms: ['unconventional', 'unorthodox', 'radical']
  },
  'ostracize': {
    exampleSentence: 'It is cruel to ostracize someone simply because they are different.',
    synonyms: ['exclude', 'shun', 'reject'],
    antonyms: ['include', 'welcome', 'accept']
  },
  'pacify': {
    exampleSentence: 'The teacher tried to pacify the upset students by explaining the reason for the change.',
    synonyms: ['calm', 'soothe', 'appease'],
    antonyms: ['agitate', 'provoke', 'enrage']
  },
  'palatable': {
    exampleSentence: 'Adding a little salt made the bland soup much more palatable.',
    synonyms: ['tasty', 'acceptable', 'appetizing'],
    antonyms: ['unpalatable', 'disgusting', 'distasteful']
  },
  'paltry': {
    exampleSentence: 'The paltry reward of a single sticker did not motivate the students very much.',
    synonyms: ['meager', 'small', 'insignificant'],
    antonyms: ['generous', 'substantial', 'significant']
  },
  'parched': {
    exampleSentence: 'After running laps in the heat, the athletes were parched and needed water.',
    synonyms: ['thirsty', 'dry', 'dehydrated'],
    antonyms: ['hydrated', 'moist', 'quenched']
  },
  'passive': {
    exampleSentence: 'The passive student rarely participated in class discussions.',
    synonyms: ['inactive', 'submissive', 'docile'],
    antonyms: ['active', 'assertive', 'aggressive']
  },
  'pathetic': {
    exampleSentence: 'The pathetic sight of the abandoned puppy in the rain moved everyone to tears.',
    synonyms: ['pitiful', 'sad', 'wretched'],
    antonyms: ['admirable', 'impressive', 'commendable']
  },
  'patron': {
    exampleSentence: 'The generous patron donated money to build a new wing for the school library.',
    synonyms: ['supporter', 'sponsor', 'benefactor'],
    antonyms: ['opponent', 'critic', 'detractor']
  },
  'pedigree': {
    exampleSentence: 'The dog show judges carefully examined each animal\'s pedigree and training.',
    synonyms: ['lineage', 'ancestry', 'heritage'],
    antonyms: ['unknown origin']
  },
  'perceptive': {
    exampleSentence: 'The perceptive student noticed that the teacher seemed unusually tired that day.',
    synonyms: ['observant', 'insightful', 'sharp'],
    antonyms: ['oblivious', 'unaware', 'inattentive']
  },
  'perplex': {
    exampleSentence: 'The riddle continued to perplex everyone until the answer was finally revealed.',
    synonyms: ['confuse', 'puzzle', 'baffle'],
    antonyms: ['clarify', 'explain', 'enlighten']
  },
  'persist': {
    exampleSentence: 'If you persist in practicing every day, you will improve your piano skills.',
    synonyms: ['continue', 'persevere', 'endure'],
    antonyms: ['quit', 'stop', 'give up']
  },
  'perturb': {
    exampleSentence: 'Loud noises from the hallway began to perturb the students taking their test.',
    synonyms: ['disturb', 'upset', 'bother'],
    antonyms: ['calm', 'soothe', 'reassure']
  },
  'peruse': {
    exampleSentence: 'She took time to peruse the entire menu before deciding what to order.',
    synonyms: ['read', 'examine', 'study'],
    antonyms: ['skim', 'glance', 'ignore']
  },
  'petite': {
    exampleSentence: 'The petite dancer moved gracefully across the stage despite her small stature.',
    synonyms: ['small', 'tiny', 'dainty'],
    antonyms: ['large', 'tall', 'big']
  },
  'philanthropy': {
    exampleSentence: 'The billionaire was known for his philanthropy and donated millions to education.',
    synonyms: ['charity', 'generosity', 'benevolence'],
    antonyms: ['greed', 'selfishness', 'stinginess']
  },
  'pilot': {
    exampleSentence: 'The school decided to pilot a new tutoring program with the seventh graders.',
    synonyms: ['test', 'trial', 'guide'],
    antonyms: ['follow', 'abandon', 'cancel']
  },
  'pinnacle': {
    exampleSentence: 'Winning the national spelling bee was the pinnacle of her academic career.',
    synonyms: ['peak', 'summit', 'top'],
    antonyms: ['bottom', 'base', 'nadir']
  },
  'pious': {
    exampleSentence: 'The pious woman attended services every week and volunteered at the church.',
    synonyms: ['devout', 'religious', 'reverent'],
    antonyms: ['irreverent', 'impious', 'ungodly']
  },
  'pivotal': {
    exampleSentence: 'The eighth grade year is pivotal in preparing students for high school.',
    synonyms: ['crucial', 'critical', 'key'],
    antonyms: ['insignificant', 'unimportant', 'minor']
  },
  'placate': {
    exampleSentence: 'The coach tried to placate the angry parents by explaining his decision.',
    synonyms: ['calm', 'appease', 'soothe'],
    antonyms: ['provoke', 'enrage', 'anger']
  },
  'plethora': {
    exampleSentence: 'The library offers a plethora of resources for students working on research projects.',
    synonyms: ['abundance', 'excess', 'surplus'],
    antonyms: ['scarcity', 'lack', 'shortage']
  },
  'plight': {
    exampleSentence: 'The documentary raised awareness about the plight of endangered sea turtles.',
    synonyms: ['difficulty', 'predicament', 'hardship'],
    antonyms: ['comfort', 'prosperity', 'ease']
  },
  'poise': {
    exampleSentence: 'She delivered her presentation with poise and confidence despite her nerves.',
    synonyms: ['grace', 'composure', 'elegance'],
    antonyms: ['awkwardness', 'clumsiness', 'nervousness']
  },
  'poised': {
    exampleSentence: 'The poised speaker handled the tough questions from the audience with ease.',
    synonyms: ['composed', 'confident', 'self-assured'],
    antonyms: ['nervous', 'flustered', 'awkward']
  },
  'ponder': {
    exampleSentence: 'Take some time to ponder the question before writing your essay response.',
    synonyms: ['consider', 'think about', 'reflect'],
    antonyms: ['ignore', 'dismiss', 'disregard']
  },
  'precision': {
    exampleSentence: 'The surgeon performed the operation with incredible precision and skill.',
    synonyms: ['accuracy', 'exactness', 'care'],
    antonyms: ['carelessness', 'inaccuracy', 'imprecision']
  },
  'precocious': {
    exampleSentence: 'The precocious five-year-old could already read books meant for third graders.',
    synonyms: ['advanced', 'gifted', 'mature'],
    antonyms: ['slow', 'underdeveloped', 'average']
  },
  'predominant': {
    exampleSentence: 'Blue is the predominant color in the school\'s uniform and decorations.',
    synonyms: ['main', 'chief', 'dominant'],
    antonyms: ['minor', 'secondary', 'subordinate']
  },
  'preface': {
    exampleSentence: 'The author wrote a preface to explain the inspiration behind her novel.',
    synonyms: ['introduction', 'foreword', 'prologue'],
    antonyms: ['epilogue', 'conclusion', 'afterword']
  },
  'premonition': {
    exampleSentence: 'She had a strange premonition that something exciting was going to happen.',
    synonyms: ['feeling', 'intuition', 'foreboding'],
    antonyms: ['hindsight', 'afterthought']
  },
  'prerogative': {
    exampleSentence: 'It is the teacher\'s prerogative to decide how much homework to assign.',
    synonyms: ['right', 'privilege', 'authority'],
    antonyms: ['obligation', 'duty', 'restriction']
  },
  'preserve': {
    exampleSentence: 'National parks help preserve natural habitats for future generations.',
    synonyms: ['protect', 'maintain', 'conserve'],
    antonyms: ['destroy', 'damage', 'ruin']
  },
  'pretentious': {
    exampleSentence: 'The pretentious student bragged about his expensive clothes to everyone.',
    synonyms: ['showy', 'conceited', 'pompous'],
    antonyms: ['humble', 'modest', 'unassuming']
  },
  'preview': {
    exampleSentence: 'The teacher gave a preview of next week\'s science experiment to build excitement.',
    synonyms: ['sneak peek', 'glimpse', 'advance showing'],
    antonyms: ['review', 'recap', 'summary']
  },
  'principal': {
    exampleSentence: 'The principal reason for her success was her unwavering determination.',
    synonyms: ['main', 'chief', 'primary'],
    antonyms: ['minor', 'secondary', 'lesser']
  },
  'prior': {
    exampleSentence: 'Prior to the test, the teacher held a review session for all students.',
    synonyms: ['previous', 'earlier', 'preceding'],
    antonyms: ['subsequent', 'later', 'following']
  },
  'proclaim': {
    exampleSentence: 'The mayor stood at the podium to proclaim the opening of the new community center.',
    synonyms: ['announce', 'declare', 'state'],
    antonyms: ['conceal', 'hide', 'suppress']
  },
  'procrastinate': {
    exampleSentence: 'If you procrastinate on your homework, you will end up rushing at the last minute.',
    synonyms: ['delay', 'postpone', 'put off'],
    antonyms: ['act', 'hurry', 'proceed']
  },
  'proficient': {
    exampleSentence: 'After months of practice, she became proficient in playing the violin.',
    synonyms: ['skilled', 'capable', 'competent'],
    antonyms: ['incompetent', 'unskilled', 'amateur']
  },
  'prohibit': {
    exampleSentence: 'School rules prohibit the use of cell phones during class time.',
    synonyms: ['forbid', 'ban', 'prevent'],
    antonyms: ['allow', 'permit', 'encourage']
  },
  'prolific': {
    exampleSentence: 'The prolific author published three new books in a single year.',
    synonyms: ['productive', 'creative', 'fertile'],
    antonyms: ['unproductive', 'barren', 'inactive']
  },
  'prolong': {
    exampleSentence: 'The rain delay helped prolong the baseball game by two extra hours.',
    synonyms: ['extend', 'lengthen', 'stretch'],
    antonyms: ['shorten', 'reduce', 'curtail']
  },
  'prompt': {
    exampleSentence: 'The fire drill required a prompt evacuation of the entire building.',
    synonyms: ['quick', 'immediate', 'swift'],
    antonyms: ['slow', 'delayed', 'late']
  },
  'provoke': {
    exampleSentence: 'Do not provoke the dog by pulling its tail; it might snap at you.',
    synonyms: ['irritate', 'anger', 'incite'],
    antonyms: ['calm', 'soothe', 'pacify']
  },
  'pungent': {
    exampleSentence: 'The pungent odor of the onions made everyone in the kitchen cry.',
    synonyms: ['strong', 'sharp', 'acrid'],
    antonyms: ['mild', 'faint', 'sweet']
  },
  'pursue': {
    exampleSentence: 'She decided to pursue her dream of becoming a marine biologist.',
    synonyms: ['chase', 'follow', 'seek'],
    antonyms: ['abandon', 'avoid', 'retreat']
  },
  'qualified': {
    exampleSentence: 'Only qualified lifeguards are allowed to supervise the school swimming pool.',
    synonyms: ['capable', 'certified', 'competent'],
    antonyms: ['unqualified', 'incompetent', 'unfit']
  },
  'quandary': {
    exampleSentence: 'She was in a quandary about whether to join the soccer team or the drama club.',
    synonyms: ['dilemma', 'predicament', 'difficulty'],
    antonyms: ['certainty', 'solution', 'decision']
  },
  'quarrelsome': {
    exampleSentence: 'The quarrelsome siblings argued about everything from toys to television shows.',
    synonyms: ['argumentative', 'contentious', 'combative'],
    antonyms: ['peaceful', 'agreeable', 'easygoing']
  },
  'quench': {
    exampleSentence: 'A cold glass of water was all she needed to quench her thirst after the race.',
    synonyms: ['satisfy', 'relieve', 'sate'],
    antonyms: ['intensify', 'increase', 'aggravate']
  },
  'querulous': {
    exampleSentence: 'The querulous passenger complained about the seat, the food, and the temperature.',
    synonyms: ['whiny', 'complaining', 'petulant'],
    antonyms: ['content', 'satisfied', 'cheerful']
  },
  'radiant': {
    exampleSentence: 'The radiant smile on her face showed how happy she was about the award.',
    synonyms: ['bright', 'glowing', 'beaming'],
    antonyms: ['dull', 'dim', 'gloomy']
  },
  'radical': {
    exampleSentence: 'The radical new approach to teaching science got students excited about experiments.',
    synonyms: ['extreme', 'revolutionary', 'drastic'],
    antonyms: ['conservative', 'moderate', 'traditional']
  },
  'rampant': {
    exampleSentence: 'Cheating became rampant when students were allowed to use their phones during tests.',
    synonyms: ['widespread', 'uncontrolled', 'rife'],
    antonyms: ['controlled', 'contained', 'rare']
  },
  'ratify': {
    exampleSentence: 'The student council voted to ratify the new constitution for the club.',
    synonyms: ['approve', 'confirm', 'endorse'],
    antonyms: ['reject', 'deny', 'veto']
  },
  'rational': {
    exampleSentence: 'A rational approach to solving problems involves looking at the facts first.',
    synonyms: ['logical', 'sensible', 'reasonable'],
    antonyms: ['irrational', 'illogical', 'unreasonable']
  },
  'ravenous': {
    exampleSentence: 'After the long hike, the ravenous campers ate every last morsel of food.',
    synonyms: ['starving', 'famished', 'hungry'],
    antonyms: ['full', 'satisfied', 'satiated']
  },
  'recalcitrant': {
    exampleSentence: 'The recalcitrant student refused to follow the teacher\'s instructions.',
    synonyms: ['defiant', 'stubborn', 'disobedient'],
    antonyms: ['obedient', 'compliant', 'cooperative']
  },
  'reconcile': {
    exampleSentence: 'After their argument, the two friends decided to reconcile and move forward.',
    synonyms: ['resolve', 'settle', 'make peace'],
    antonyms: ['argue', 'fight', 'separate']
  },
  'rectify': {
    exampleSentence: 'The teacher gave students a chance to rectify their mistakes on the quiz.',
    synonyms: ['correct', 'fix', 'remedy'],
    antonyms: ['worsen', 'damage', 'break']
  },
  'recuperate': {
    exampleSentence: 'After the surgery, the athlete needed several months to recuperate.',
    synonyms: ['recover', 'heal', 'mend'],
    antonyms: ['worsen', 'decline', 'deteriorate']
  },
  'redundant': {
    exampleSentence: 'Using both "small" and "tiny" in the same sentence is redundant.',
    synonyms: ['unnecessary', 'repetitive', 'superfluous'],
    antonyms: ['essential', 'necessary', 'needed']
  },
  'refine': {
    exampleSentence: 'She continued to refine her essay until every sentence was clear and polished.',
    synonyms: ['improve', 'polish', 'perfect'],
    antonyms: ['worsen', 'damage', 'corrupt']
  },
  'reflective': {
    exampleSentence: 'The reflective student took time to think about what he had learned each day.',
    synonyms: ['thoughtful', 'contemplative', 'pensive'],
    antonyms: ['thoughtless', 'impulsive', 'careless']
  },
  'refurbish': {
    exampleSentence: 'Volunteers helped refurbish the old community center with new paint and furniture.',
    synonyms: ['renovate', 'restore', 'repair'],
    antonyms: ['damage', 'destroy', 'neglect']
  },
  'refute': {
    exampleSentence: 'The student used strong evidence to refute the opposing team\'s argument in the debate.',
    synonyms: ['disprove', 'deny', 'counter'],
    antonyms: ['confirm', 'prove', 'support']
  },
  'regimen': {
    exampleSentence: 'The coach put the team on a strict training regimen before the championship.',
    synonyms: ['routine', 'schedule', 'program'],
    antonyms: ['disorder', 'chaos', 'randomness']
  },
  'reimburse': {
    exampleSentence: 'The school promised to reimburse families for the cost of the canceled field trip.',
    synonyms: ['repay', 'refund', 'compensate'],
    antonyms: ['charge', 'bill', 'owe']
  },
  'rejuvenate': {
    exampleSentence: 'A good night of sleep can rejuvenate your body and mind before a big test.',
    synonyms: ['refresh', 'revitalize', 'restore'],
    antonyms: ['tire', 'exhaust', 'deplete']
  },
  'relic': {
    exampleSentence: 'The ancient relic discovered at the dig site was over two thousand years old.',
    synonyms: ['artifact', 'antique', 'remnant'],
    antonyms: ['novelty', 'modern item']
  },
  'relinquish': {
    exampleSentence: 'The captain had to relinquish her position when she moved to a different school.',
    synonyms: ['surrender', 'give up', 'release'],
    antonyms: ['keep', 'retain', 'hold']
  },
  'reluctance': {
    exampleSentence: 'His reluctance to try new foods meant he always ordered the same thing.',
    synonyms: ['hesitation', 'unwillingness', 'resistance'],
    antonyms: ['eagerness', 'willingness', 'enthusiasm']
  },
  'remorse': {
    exampleSentence: 'He felt deep remorse after realizing how much his words had hurt his friend.',
    synonyms: ['regret', 'guilt', 'sorrow'],
    antonyms: ['pride', 'satisfaction', 'indifference']
  },
  'repeal': {
    exampleSentence: 'The student council voted to repeal the outdated rule about hallway passes.',
    synonyms: ['revoke', 'cancel', 'abolish'],
    antonyms: ['enact', 'establish', 'enforce']
  },
  'replenish': {
    exampleSentence: 'The cafeteria staff hurried to replenish the salad bar during the lunch rush.',
    synonyms: ['refill', 'restock', 'restore'],
    antonyms: ['deplete', 'drain', 'empty']
  },
  'reprimand': {
    exampleSentence: 'The teacher had to reprimand the student for talking during the assembly.',
    synonyms: ['scold', 'rebuke', 'admonish'],
    antonyms: ['praise', 'commend', 'reward']
  },
  'reprisal': {
    exampleSentence: 'The coach warned the team that any reprisal against the rival players would lead to suspension.',
    synonyms: ['retaliation', 'revenge', 'payback'],
    antonyms: ['forgiveness', 'mercy', 'pardon']
  },
  'reproach': {
    exampleSentence: 'The disappointed teacher looked at the cheating student with reproach.',
    synonyms: ['blame', 'criticism', 'disapproval'],
    antonyms: ['praise', 'approval', 'compliment']
  },
  'reputable': {
    exampleSentence: 'Always check that your sources are reputable when writing a research paper.',
    synonyms: ['respected', 'trustworthy', 'reliable'],
    antonyms: ['disreputable', 'untrustworthy', 'shady']
  },
  'resolve': {
    exampleSentence: 'The two students agreed to resolve their disagreement through calm discussion.',
    synonyms: ['settle', 'fix', 'determine'],
    antonyms: ['complicate', 'worsen', 'ignore']
  },
  'restore': {
    exampleSentence: 'Volunteers worked hard to restore the historic building to its original condition.',
    synonyms: ['repair', 'renew', 'rebuild'],
    antonyms: ['destroy', 'damage', 'ruin']
  },
  'resume': {
    exampleSentence: 'After the fire drill, the class will resume their regular activities.',
    synonyms: ['continue', 'restart', 'proceed'],
    antonyms: ['stop', 'pause', 'cease']
  },
  'retain': {
    exampleSentence: 'Using flashcards can help you retain vocabulary words for the HSPT.',
    synonyms: ['keep', 'hold', 'maintain'],
    antonyms: ['lose', 'release', 'forget']
  },
  'reticent': {
    exampleSentence: 'The reticent student preferred to listen rather than share her opinions in class.',
    synonyms: ['reserved', 'quiet', 'shy'],
    antonyms: ['talkative', 'outgoing', 'open']
  },
  'retort': {
    exampleSentence: 'When asked why he was late, the student had a clever retort ready.',
    synonyms: ['reply', 'response', 'comeback'],
    antonyms: ['question', 'inquiry', 'silence']
  },
  'retract': {
    exampleSentence: 'The newspaper had to retract the story after discovering it contained errors.',
    synonyms: ['withdraw', 'take back', 'reverse'],
    antonyms: ['confirm', 'maintain', 'assert']
  },
  'revere': {
    exampleSentence: 'Many students revere the retired teacher who inspired generations of learners.',
    synonyms: ['admire', 'respect', 'honor'],
    antonyms: ['disrespect', 'despise', 'scorn']
  },
  'revive': {
    exampleSentence: 'The cool breeze helped revive the exhausted runners after the marathon.',
    synonyms: ['restore', 'refresh', 'renew'],
    antonyms: ['weaken', 'kill', 'extinguish']
  },
  'rickety': {
    exampleSentence: 'The rickety old bridge swayed dangerously when the students tried to cross it.',
    synonyms: ['shaky', 'unstable', 'wobbly'],
    antonyms: ['sturdy', 'solid', 'stable']
  },
  'rigor': {
    exampleSentence: 'The academic rigor of the honors class prepared students well for high school.',
    synonyms: ['strictness', 'toughness', 'thoroughness'],
    antonyms: ['leniency', 'ease', 'flexibility']
  },
  'rigorous': {
    exampleSentence: 'The rigorous training schedule left the athletes exhausted but stronger.',
    synonyms: ['strict', 'demanding', 'thorough'],
    antonyms: ['easy', 'lenient', 'relaxed']
  },
  'robust': {
    exampleSentence: 'The robust oak tree has withstood storms for over a hundred years.',
    synonyms: ['strong', 'sturdy', 'vigorous'],
    antonyms: ['weak', 'frail', 'feeble']
  },
  'routine': {
    exampleSentence: 'Having a good morning routine helps students arrive at school prepared and on time.',
    synonyms: ['habit', 'schedule', 'pattern'],
    antonyms: ['irregularity', 'spontaneity', 'variation']
  },
  'sage': {
    exampleSentence: 'The sage advice from the counselor helped her choose the right classes.',
    synonyms: ['wise', 'knowledgeable', 'insightful'],
    antonyms: ['foolish', 'ignorant', 'unwise']
  },
  'salvage': {
    exampleSentence: 'The team tried to salvage the project after their computer crashed and lost their data.',
    synonyms: ['rescue', 'save', 'recover'],
    antonyms: ['destroy', 'waste', 'abandon']
  },
  'satiate': {
    exampleSentence: 'The large Thanksgiving dinner was enough to satiate even the hungriest guest.',
    synonyms: ['satisfy', 'fill', 'quench'],
    antonyms: ['starve', 'deprive', 'dissatisfy']
  },
  'saunter': {
    exampleSentence: 'He liked to saunter through the park on sunny afternoons with no rush at all.',
    synonyms: ['stroll', 'walk slowly', 'amble'],
    antonyms: ['rush', 'hurry', 'sprint']
  },
  'scheme': {
    exampleSentence: 'The students devised a clever scheme to raise money for the class trip.',
    synonyms: ['plan', 'plot', 'strategy'],
    antonyms: ['honesty', 'frankness']
  },
  'sedentary': {
    exampleSentence: 'A sedentary lifestyle with too much screen time can be bad for your health.',
    synonyms: ['inactive', 'stationary', 'idle'],
    antonyms: ['active', 'energetic', 'mobile']
  },
  'sever': {
    exampleSentence: 'The storm was strong enough to sever the power lines across the neighborhood.',
    synonyms: ['cut', 'separate', 'disconnect'],
    antonyms: ['connect', 'join', 'attach']
  },
  'severe': {
    exampleSentence: 'The severe winter storm caused school closures for three consecutive days.',
    synonyms: ['harsh', 'extreme', 'intense'],
    antonyms: ['mild', 'gentle', 'moderate']
  },
  'shrewd': {
    exampleSentence: 'The shrewd negotiator got a much better deal by knowing exactly what to ask for.',
    synonyms: ['clever', 'astute', 'sharp'],
    antonyms: ['naive', 'gullible', 'foolish']
  },
  'significant': {
    exampleSentence: 'The discovery of the new planet was a significant achievement for the scientists.',
    synonyms: ['important', 'major', 'notable'],
    antonyms: ['insignificant', 'trivial', 'minor']
  },
  'simulate': {
    exampleSentence: 'The flight simulator allowed students to simulate flying a real airplane.',
    synonyms: ['imitate', 'replicate', 'mimic'],
    antonyms: ['differ', 'contrast']
  },
  'skeptical': {
    exampleSentence: 'The skeptical student asked for proof before believing the surprising claim.',
    synonyms: ['doubtful', 'questioning', 'suspicious'],
    antonyms: ['trusting', 'gullible', 'believing']
  },
  'slovenly': {
    exampleSentence: 'The slovenly appearance of his homework showed that he had rushed through it.',
    synonyms: ['messy', 'sloppy', 'unkempt'],
    antonyms: ['neat', 'tidy', 'organized']
  },
  'solace': {
    exampleSentence: 'She found solace in reading whenever she felt stressed about school.',
    synonyms: ['comfort', 'consolation', 'relief'],
    antonyms: ['distress', 'anguish', 'torment']
  },
  'sparse': {
    exampleSentence: 'The sparse vegetation in the desert makes it difficult for animals to find food.',
    synonyms: ['scarce', 'thin', 'scattered'],
    antonyms: ['dense', 'thick', 'abundant']
  },
  'spiteful': {
    exampleSentence: 'The spiteful comment was meant to hurt her feelings, not to be helpful.',
    synonyms: ['malicious', 'vindictive', 'mean'],
    antonyms: ['kind', 'generous', 'forgiving']
  },
  'spontaneous': {
    exampleSentence: 'The spontaneous decision to have a class party made everyone happy.',
    synonyms: ['unplanned', 'impulsive', 'impromptu'],
    antonyms: ['planned', 'deliberate', 'calculated']
  },
  'staunch': {
    exampleSentence: 'She was a staunch supporter of the school recycling program.',
    synonyms: ['loyal', 'devoted', 'steadfast'],
    antonyms: ['disloyal', 'unfaithful', 'wavering']
  },
  'stealthy': {
    exampleSentence: 'The cat made a stealthy approach toward the bird on the windowsill.',
    synonyms: ['sneaky', 'secretive', 'covert'],
    antonyms: ['obvious', 'loud', 'conspicuous']
  },
  'sterile': {
    exampleSentence: 'The nurse made sure all the equipment was sterile before the procedure.',
    synonyms: ['clean', 'sanitized', 'germ-free'],
    antonyms: ['contaminated', 'dirty', 'infected']
  },
  'stern': {
    exampleSentence: 'The stern principal gave a serious warning about behavior at the assembly.',
    synonyms: ['strict', 'firm', 'severe'],
    antonyms: ['lenient', 'gentle', 'easygoing']
  },
  'stimulate': {
    exampleSentence: 'Hands-on experiments stimulate curiosity and make science class more engaging.',
    synonyms: ['encourage', 'motivate', 'inspire'],
    antonyms: ['discourage', 'bore', 'suppress']
  },
  'strife': {
    exampleSentence: 'The strife between the two groups of friends made lunchtime uncomfortable.',
    synonyms: ['conflict', 'discord', 'fighting'],
    antonyms: ['peace', 'harmony', 'agreement']
  },
  'stringent': {
    exampleSentence: 'The school enforced stringent rules about academic honesty during exams.',
    synonyms: ['strict', 'rigid', 'demanding'],
    antonyms: ['lenient', 'relaxed', 'flexible']
  },
  'subsequent': {
    exampleSentence: 'The initial meeting was followed by several subsequent discussions throughout the week.',
    synonyms: ['following', 'later', 'ensuing'],
    antonyms: ['previous', 'prior', 'preceding']
  },
  'substantial': {
    exampleSentence: 'She made a substantial improvement in her grades after starting the tutoring program.',
    synonyms: ['considerable', 'significant', 'large'],
    antonyms: ['small', 'insignificant', 'trivial']
  },
  'subtle': {
    exampleSentence: 'The subtle hint in the teacher\'s comment helped her figure out the answer.',
    synonyms: ['slight', 'faint', 'understated'],
    antonyms: ['obvious', 'blatant', 'bold']
  },
  'succinct': {
    exampleSentence: 'The teacher asked for a succinct summary, no longer than three sentences.',
    synonyms: ['brief', 'concise', 'short'],
    antonyms: ['verbose', 'lengthy', 'wordy']
  },
  'suitable': {
    exampleSentence: 'Sneakers are not suitable footwear for the formal school dance.',
    synonyms: ['appropriate', 'fitting', 'proper'],
    antonyms: ['unsuitable', 'inappropriate', 'wrong']
  },
  'sullen': {
    exampleSentence: 'The sullen teenager refused to participate in the family game night.',
    synonyms: ['moody', 'gloomy', 'grumpy'],
    antonyms: ['cheerful', 'happy', 'pleasant']
  },
  'superficial': {
    exampleSentence: 'The cut was only superficial and did not require any stitches.',
    synonyms: ['shallow', 'surface-level', 'minor'],
    antonyms: ['deep', 'thorough', 'profound']
  },
  'superfluous': {
    exampleSentence: 'The extra paragraph was superfluous and did not add anything to the essay.',
    synonyms: ['unnecessary', 'excess', 'redundant'],
    antonyms: ['necessary', 'essential', 'needed']
  },
  'surge': {
    exampleSentence: 'A surge of excitement swept through the crowd when the home team scored.',
    synonyms: ['rush', 'wave', 'increase'],
    antonyms: ['decline', 'decrease', 'drop']
  },
  'surplus': {
    exampleSentence: 'The school had a surplus of textbooks after the new digital curriculum was adopted.',
    synonyms: ['excess', 'extra', 'abundance'],
    antonyms: ['shortage', 'deficit', 'lack']
  },
  'sustain': {
    exampleSentence: 'A balanced diet can sustain your energy levels throughout the school day.',
    synonyms: ['maintain', 'support', 'uphold'],
    antonyms: ['exhaust', 'deplete', 'weaken']
  },
  'swelter': {
    exampleSentence: 'The students began to swelter in the gymnasium because the air conditioning was broken.',
    synonyms: ['overheat', 'boil', 'bake'],
    antonyms: ['freeze', 'chill', 'cool']
  },
  'sympathy': {
    exampleSentence: 'The class showed sympathy for their classmate who was going through a difficult time.',
    synonyms: ['compassion', 'empathy', 'understanding'],
    antonyms: ['indifference', 'hostility', 'cruelty']
  },
  'taciturn': {
    exampleSentence: 'The taciturn librarian preferred silence and rarely engaged in conversation.',
    synonyms: ['quiet', 'reserved', 'uncommunicative'],
    antonyms: ['talkative', 'chatty', 'loquacious']
  },
  'tactile': {
    exampleSentence: 'The tactile learner understood concepts better when she could touch and build models.',
    synonyms: ['touchable', 'tangible', 'hands-on'],
    antonyms: ['intangible', 'abstract', 'visual']
  },
  'taint': {
    exampleSentence: 'One bad experience can taint your opinion of an entire subject.',
    synonyms: ['contaminate', 'spoil', 'corrupt'],
    antonyms: ['purify', 'cleanse', 'improve']
  },
  'tangible': {
    exampleSentence: 'The improved test scores were tangible proof that the new study method worked.',
    synonyms: ['concrete', 'real', 'solid'],
    antonyms: ['intangible', 'abstract', 'invisible']
  },
  'tarnish': {
    exampleSentence: 'One mistake should not tarnish an otherwise excellent academic record.',
    synonyms: ['stain', 'damage', 'blemish'],
    antonyms: ['polish', 'enhance', 'brighten']
  },
  'taunt': {
    exampleSentence: 'It is wrong to taunt other students about their appearance or abilities.',
    synonyms: ['tease', 'mock', 'ridicule'],
    antonyms: ['encourage', 'compliment', 'praise']
  },
  'tedious': {
    exampleSentence: 'Copying notes by hand from the board was a tedious task that took forever.',
    synonyms: ['boring', 'tiresome', 'monotonous'],
    antonyms: ['exciting', 'interesting', 'engaging']
  },
  'temperate': {
    exampleSentence: 'The temperate climate of the region made it perfect for growing fruit trees.',
    synonyms: ['mild', 'moderate', 'balanced'],
    antonyms: ['extreme', 'harsh', 'severe']
  },
  'tempest': {
    exampleSentence: 'The tempest at sea tossed the small fishing boat around like a toy.',
    synonyms: ['storm', 'hurricane', 'gale'],
    antonyms: ['calm', 'tranquility', 'peace']
  },
  'tense': {
    exampleSentence: 'The room was tense as the students waited for their test results.',
    synonyms: ['anxious', 'nervous', 'strained'],
    antonyms: ['relaxed', 'calm', 'easygoing']
  },
  'terse': {
    exampleSentence: 'The teacher\'s terse response of "see me after class" made the student nervous.',
    synonyms: ['brief', 'short', 'curt'],
    antonyms: ['verbose', 'long-winded', 'elaborate']
  },
  'throb': {
    exampleSentence: 'His ankle began to throb with pain after he twisted it during the game.',
    synonyms: ['pulse', 'beat', 'pound'],
    antonyms: ['still', 'numb', 'stop']
  },
  'timid': {
    exampleSentence: 'The timid puppy hid behind its owner whenever a stranger approached.',
    synonyms: ['shy', 'fearful', 'nervous'],
    antonyms: ['bold', 'brave', 'confident']
  },
  'tirade': {
    exampleSentence: 'The coach went on a tirade after the team showed up late to practice.',
    synonyms: ['rant', 'outburst', 'lecture'],
    antonyms: ['praise', 'compliment', 'whisper']
  },
  'tolerant': {
    exampleSentence: 'A tolerant community welcomes people from all different backgrounds.',
    synonyms: ['accepting', 'open-minded', 'patient'],
    antonyms: ['intolerant', 'bigoted', 'narrow-minded']
  },
  'trance': {
    exampleSentence: 'The beautiful music seemed to put the entire audience into a trance.',
    synonyms: ['daze', 'stupor', 'spell'],
    antonyms: ['alertness', 'awareness', 'consciousness']
  },
  'transform': {
    exampleSentence: 'A fresh coat of paint can transform an old room into a bright, inviting space.',
    synonyms: ['change', 'convert', 'alter'],
    antonyms: ['preserve', 'maintain', 'keep']
  },
  'transgression': {
    exampleSentence: 'The student\'s transgression of the honor code resulted in a meeting with the dean.',
    synonyms: ['violation', 'offense', 'wrongdoing'],
    antonyms: ['obedience', 'compliance', 'virtue']
  },
  'transient': {
    exampleSentence: 'The transient feeling of nervousness before a test usually fades once you begin.',
    synonyms: ['temporary', 'fleeting', 'brief'],
    antonyms: ['permanent', 'lasting', 'enduring']
  },
  'transitory': {
    exampleSentence: 'Adolescence is a transitory phase between childhood and adulthood.',
    synonyms: ['temporary', 'short-lived', 'passing'],
    antonyms: ['permanent', 'lasting', 'eternal']
  },
  'translucent': {
    exampleSentence: 'The translucent glass allowed soft light to fill the room without glare.',
    synonyms: ['semi-transparent', 'clear', 'see-through'],
    antonyms: ['opaque', 'dark', 'solid']
  },
  'traverse': {
    exampleSentence: 'The hikers had to traverse a narrow bridge over a deep canyon.',
    synonyms: ['cross', 'travel across', 'pass through'],
    antonyms: ['avoid', 'bypass', 'stay']
  },
  'tremble': {
    exampleSentence: 'Her hands began to tremble as she stood up to give her speech.',
    synonyms: ['shake', 'shiver', 'quiver'],
    antonyms: ['steady', 'calm', 'stabilize']
  },
  'truant': {
    exampleSentence: 'The truant student was caught at the mall when he should have been in class.',
    synonyms: ['absent', 'delinquent', 'skipping'],
    antonyms: ['present', 'attending', 'punctual']
  },
  'turmoil': {
    exampleSentence: 'The sudden schedule change caused turmoil among students trying to find their classes.',
    synonyms: ['chaos', 'confusion', 'upheaval'],
    antonyms: ['peace', 'order', 'calm']
  },
  'tycoon': {
    exampleSentence: 'The business tycoon donated a million dollars to build a new school.',
    synonyms: ['magnate', 'mogul', 'entrepreneur'],
    antonyms: ['worker', 'employee', 'laborer']
  },
  'tyrant': {
    exampleSentence: 'The cruel tyrant ruled the kingdom with fear and harsh punishments.',
    synonyms: ['dictator', 'despot', 'oppressor'],
    antonyms: ['democrat', 'liberator', 'servant']
  },
  'ultimate': {
    exampleSentence: 'Winning a gold medal at the Olympics is the ultimate achievement for many athletes.',
    synonyms: ['final', 'greatest', 'supreme'],
    antonyms: ['initial', 'least', 'worst']
  },
  'undaunted': {
    exampleSentence: 'Undaunted by the difficult exam, she studied harder and retook it.',
    synonyms: ['fearless', 'brave', 'courageous'],
    antonyms: ['afraid', 'discouraged', 'intimidated']
  },
  'uniform': {
    exampleSentence: 'The school requires a uniform dress code to promote equality among students.',
    synonyms: ['consistent', 'standard', 'identical'],
    antonyms: ['varied', 'different', 'diverse']
  },
  'unique': {
    exampleSentence: 'Every student has a unique set of talents and abilities to share.',
    synonyms: ['one-of-a-kind', 'distinct', 'special'],
    antonyms: ['common', 'ordinary', 'typical']
  },
  'unkempt': {
    exampleSentence: 'His unkempt hair and wrinkled shirt showed he had overslept that morning.',
    synonyms: ['messy', 'disheveled', 'untidy'],
    antonyms: ['neat', 'groomed', 'tidy']
  },
  'unorthodox': {
    exampleSentence: 'The teacher\'s unorthodox method of using games to teach math was surprisingly effective.',
    synonyms: ['unconventional', 'unusual', 'nontraditional'],
    antonyms: ['orthodox', 'conventional', 'traditional']
  },
  'unqualified': {
    exampleSentence: 'Without proper training, the volunteer was unqualified to lead the advanced class.',
    synonyms: ['incompetent', 'incapable', 'unfit'],
    antonyms: ['qualified', 'capable', 'competent']
  },
  'unsung': {
    exampleSentence: 'The janitor was the unsung hero who kept the entire school running smoothly.',
    synonyms: ['unrecognized', 'overlooked', 'unacknowledged'],
    antonyms: ['famous', 'celebrated', 'renowned']
  },
  'usurp': {
    exampleSentence: 'The vice president tried to usurp the president\'s role in leading the student council.',
    synonyms: ['seize', 'take over', 'commandeer'],
    antonyms: ['relinquish', 'surrender', 'yield']
  },
  'utilize': {
    exampleSentence: 'Students should utilize all available resources when preparing for the HSPT.',
    synonyms: ['use', 'employ', 'apply'],
    antonyms: ['waste', 'neglect', 'ignore']
  },
  'utmost': {
    exampleSentence: 'Safety is of the utmost importance during any science laboratory experiment.',
    synonyms: ['greatest', 'highest', 'maximum'],
    antonyms: ['least', 'minimum', 'lowest']
  },
  'vacant': {
    exampleSentence: 'The vacant lot next to the school was turned into a community garden.',
    synonyms: ['empty', 'unoccupied', 'bare'],
    antonyms: ['occupied', 'full', 'inhabited']
  },
  'vague': {
    exampleSentence: 'The directions were so vague that half the class went to the wrong room.',
    synonyms: ['unclear', 'ambiguous', 'imprecise'],
    antonyms: ['clear', 'specific', 'precise']
  },
  'vain': {
    exampleSentence: 'The vain actor spent more time looking in the mirror than rehearsing his lines.',
    synonyms: ['conceited', 'proud', 'narcissistic'],
    antonyms: ['humble', 'modest', 'selfless']
  },
  'valid': {
    exampleSentence: 'You need a valid student ID to check out books from the school library.',
    synonyms: ['legitimate', 'authentic', 'genuine'],
    antonyms: ['invalid', 'fake', 'illegitimate']
  },
  'validate': {
    exampleSentence: 'The experiment helped validate the hypothesis that plants grow faster with music.',
    synonyms: ['confirm', 'verify', 'prove'],
    antonyms: ['disprove', 'invalidate', 'deny']
  },
  'variegated': {
    exampleSentence: 'The variegated leaves of the plant displayed beautiful patterns of green and white.',
    synonyms: ['multicolored', 'diverse', 'patterned'],
    antonyms: ['uniform', 'plain', 'monochrome']
  },
  'verbose': {
    exampleSentence: 'His verbose essay used ten pages to explain something that could fit in two.',
    synonyms: ['wordy', 'long-winded', 'rambling'],
    antonyms: ['concise', 'brief', 'succinct']
  },
  'verge': {
    exampleSentence: 'The exhausted runner was on the verge of collapsing before crossing the finish line.',
    synonyms: ['brink', 'edge', 'threshold'],
    antonyms: ['center', 'middle', 'interior']
  },
  'viable': {
    exampleSentence: 'Solar power is a viable alternative to fossil fuels for generating electricity.',
    synonyms: ['feasible', 'practical', 'workable'],
    antonyms: ['impractical', 'impossible', 'unworkable']
  },
  'vicious': {
    exampleSentence: 'The vicious storm uprooted trees and knocked out power for thousands of homes.',
    synonyms: ['fierce', 'brutal', 'savage'],
    antonyms: ['gentle', 'kind', 'mild']
  },
  'vigorous': {
    exampleSentence: 'The coach led the team through a vigorous warm-up before the big game.',
    synonyms: ['energetic', 'strong', 'active'],
    antonyms: ['weak', 'feeble', 'lethargic']
  },
  'vindicate': {
    exampleSentence: 'The new evidence helped vindicate the student who had been wrongly accused.',
    synonyms: ['clear', 'acquit', 'exonerate'],
    antonyms: ['blame', 'accuse', 'condemn']
  },
  'virtually': {
    exampleSentence: 'The test was so easy that virtually every student in the class passed.',
    synonyms: ['nearly', 'almost', 'practically'],
    antonyms: ['hardly', 'barely', 'scarcely']
  },
  'vital': {
    exampleSentence: 'Drinking enough water is vital for staying healthy during sports practice.',
    synonyms: ['essential', 'crucial', 'important'],
    antonyms: ['unimportant', 'unnecessary', 'trivial']
  },
  'vitality': {
    exampleSentence: 'The young puppy was full of vitality and could play for hours without stopping.',
    synonyms: ['energy', 'liveliness', 'vigor'],
    antonyms: ['weakness', 'lethargy', 'fatigue']
  },
  'voracious': {
    exampleSentence: 'The voracious reader finished an entire book series in just one weekend.',
    synonyms: ['insatiable', 'ravenous', 'greedy'],
    antonyms: ['satisfied', 'moderate', 'content']
  },
  'vulgar': {
    exampleSentence: 'Using vulgar language in school is disrespectful and against the rules.',
    synonyms: ['crude', 'offensive', 'coarse'],
    antonyms: ['refined', 'polite', 'elegant']
  },
  'wage': {
    exampleSentence: 'Many students earn a small wage by doing chores or babysitting for neighbors.',
    synonyms: ['pay', 'salary', 'earnings'],
    antonyms: ['debt', 'expense', 'cost']
  },
  'waver': {
    exampleSentence: 'Her determination did not waver even when the project became extremely challenging.',
    synonyms: ['hesitate', 'falter', 'fluctuate'],
    antonyms: ['persist', 'stand firm', 'decide']
  },
  'wearisome': {
    exampleSentence: 'The wearisome journey through traffic made everyone wish they had left earlier.',
    synonyms: ['tiring', 'tedious', 'exhausting'],
    antonyms: ['refreshing', 'energizing', 'exciting']
  },
  'weary': {
    exampleSentence: 'After studying for hours, the weary students could barely keep their eyes open.',
    synonyms: ['tired', 'exhausted', 'fatigued'],
    antonyms: ['energetic', 'refreshed', 'alert']
  },
  'whimsical': {
    exampleSentence: 'The whimsical illustrations in the book featured talking animals and flying houses.',
    synonyms: ['playful', 'fanciful', 'quirky'],
    antonyms: ['serious', 'practical', 'conventional']
  },
  'wily': {
    exampleSentence: 'The wily fox outsmarted the farmer and stole a chicken from the coop.',
    synonyms: ['cunning', 'crafty', 'sly'],
    antonyms: ['honest', 'straightforward', 'naive']
  },
  'wretched': {
    exampleSentence: 'The wretched conditions in the old building made it unsafe for students.',
    synonyms: ['miserable', 'terrible', 'awful'],
    antonyms: ['wonderful', 'excellent', 'pleasant']
  },
  'yearn': {
    exampleSentence: 'After months of winter, the students began to yearn for warm summer days.',
    synonyms: ['long for', 'desire', 'crave'],
    antonyms: ['dread', 'despise', 'reject']
  },
  'youthful': {
    exampleSentence: 'Her youthful energy made her the perfect leader for the school spirit committee.',
    synonyms: ['young', 'vibrant', 'energetic'],
    antonyms: ['old', 'aged', 'elderly']
  },
  'zeal': {
    exampleSentence: 'The volunteers approached the community cleanup project with tremendous zeal.',
    synonyms: ['enthusiasm', 'passion', 'fervor'],
    antonyms: ['apathy', 'indifference', 'laziness']
  },
  'zealot': {
    exampleSentence: 'The fitness zealot exercised every single day, rain or shine.',
    synonyms: ['fanatic', 'extremist', 'devotee'],
    antonyms: ['moderate', 'skeptic', 'critic']
  },
  'zenith': {
    exampleSentence: 'The team reached the zenith of their success when they won the state championship.',
    synonyms: ['peak', 'summit', 'highest point'],
    antonyms: ['nadir', 'bottom', 'lowest point']
  },
};

async function enrichVocabulary() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database\n');

    const allVocab = await Vocabulary.findAll();
    let enriched = 0;
    let skipped = 0;
    let alreadyEnriched = 0;

    for (const vocab of allVocab) {
      const data = enrichmentData[vocab.word.toLowerCase()];
      if (!data) {
        skipped++;
        continue;
      }

      // Skip if already enriched
      if (vocab.exampleSentence) {
        alreadyEnriched++;
        continue;
      }

      await vocab.update({
        exampleSentence: data.exampleSentence,
        synonyms: data.synonyms,
        antonyms: data.antonyms,
      });
      enriched++;

      if (enriched % 25 === 0) {
        process.stdout.write(`\rEnriched: ${enriched}`);
      }
    }

    console.log(`\nEnrichment complete!`);
    console.log(`  Enriched: ${enriched}`);
    console.log(`  Already enriched: ${alreadyEnriched}`);
    console.log(`  No data available: ${skipped}`);
    console.log(`  Total vocabulary: ${allVocab.length}`);
    console.log(`  Coverage: ${Math.round(((enriched + alreadyEnriched) / allVocab.length) * 100)}%`);
    process.exit(0);
  } catch (error) {
    console.error('Enrichment failed:', error);
    process.exit(1);
  }
}

enrichVocabulary();
