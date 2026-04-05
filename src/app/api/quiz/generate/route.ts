import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const API_KEYS = [
  process.env.OPENROUTER_API_KEY,
  process.env.OPENROUTER_API_KEY_2,
].filter(Boolean) as string[];

const MODELS = [
  "google/gemma-3-8b-it:free",
  "qwen/qwen3.6-plus:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

interface Question {
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
}

const grammarQuestions: Record<string, Question[]> = {
  "Tenses": [
    { question: "She ____ to the market every morning.", options: { A: "go", B: "goes", C: "going", D: "gone" }, correctAnswer: "B" },
    { question: "If it rains, we ____ the picnic.", options: { A: "cancel", B: "cancels", C: "will cancel", D: "cancelling" }, correctAnswer: "C" },
    { question: "They ____ the movie yesterday.", options: { A: "watch", B: "watched", C: "watching", D: "watches" }, correctAnswer: "B" },
    { question: "I ____ my homework now.", options: { A: "do", B: "does", C: "did", D: "am doing" }, correctAnswer: "D" },
    { question: "She ____ in this house for 5 years.", options: { A: "live", B: "lives", C: "lived", D: "has lived" }, correctAnswer: "D" },
    { question: "By next year, I ____ this course.", options: { A: "complete", B: "will complete", C: "will have completed", D: "am completing" }, correctAnswer: "C" },
    { question: "He ____ to London next week.", options: { A: "travels", B: "traveled", C: "is traveling", D: "travel" }, correctAnswer: "C" },
    { question: "When I reached home, she ____ dinner.", options: { A: "cook", B: "cooks", C: "was cooking", D: "cooking" }, correctAnswer: "C" },
    { question: "The sun ____ in the east.", options: { A: "rise", B: "rises", C: "rising", D: "rose" }, correctAnswer: "B" },
    { question: "I wish I ____ fly.", options: { A: "can", B: "could", C: "will", D: "would" }, correctAnswer: "B" },
    { question: "We ____ to the park last Sunday.", options: { A: "go", B: "went", C: "gone", D: "going" }, correctAnswer: "B" },
    { question: "She ____ English for 3 years.", options: { A: "studies", B: "studied", C: "has been studying", D: "is studying" }, correctAnswer: "C" },
    { question: "Look! The boys ____ football.", options: { A: "play", B: "played", C: "are playing", D: "have played" }, correctAnswer: "C" },
    { question: "I ____ never been to London.", options: { A: "have", B: "has", C: "had", D: "am" }, correctAnswer: "A" },
    { question: "He ____ TV when the phone rang.", options: { A: "watches", B: "watched", C: "was watching", D: "is watching" }, correctAnswer: "C" }
  ],
  "Articles (A, An, The)": [
    { question: "She is ____ honest girl.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "B" },
    { question: "I need ____ apple.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "B" },
    { question: "The book is on ____ table.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "C" },
    { question: "He is ____ student.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "A" },
    { question: "____ Earth revolves around the Sun.", options: { A: "A", B: "An", C: "The", D: "No article" }, correctAnswer: "C" },
    { question: "She is ____ best teacher.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "C" },
    { question: "I saw ____ unique painting.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "B" },
    { question: "Please give me ____ water.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "D" },
    { question: "She is ____ University student.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "A" },
    { question: "____ sun is shining brightly.", options: { A: "A", B: "An", C: "The", D: "No article" }, correctAnswer: "C" },
    { question: "He is ____ honest man.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "B" },
    { question: "I read ____ interesting book yesterday.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "B" },
    { question: "____ Ganga is a holy river.", options: { A: "A", B: "An", C: "The", D: "No article" }, correctAnswer: "C" },
    { question: "She plays ____ piano very well.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "C" },
    { question: "I have ____ one rupee coin.", options: { A: "a", B: "an", C: "the", D: "no article" }, correctAnswer: "A" }
  ],
  "Prepositions": [
    { question: "The cat is ____ the table.", options: { A: "in", B: "on", C: "at", D: "to" }, correctAnswer: "B" },
    { question: "She lives ____ Delhi.", options: { A: "in", B: "on", C: "at", D: "to" }, correctAnswer: "A" },
    { question: "I will meet you ____ 5 PM.", options: { A: "in", B: "on", C: "at", D: "to" }, correctAnswer: "C" },
    { question: "He arrived ____ Monday.", options: { A: "in", B: "on", C: "at", D: "to" }, correctAnswer: "B" },
    { question: "The bird flew ____ the tree.", options: { A: "in", B: "on", C: "at", D: "to" }, correctAnswer: "A" },
    { question: "She is fond ____ music.", options: { A: "of", B: "to", C: "for", D: "in" }, correctAnswer: "A" },
    { question: "I am waiting ____ you.", options: { A: "of", B: "to", C: "for", D: "in" }, correctAnswer: "C" },
    { question: "He went ____ home.", options: { A: "to", B: "at", C: "no preposition", D: "in" }, correctAnswer: "C" },
    { question: "The train is bound ____ Mumbai.", options: { A: "for", B: "to", C: "at", D: "in" }, correctAnswer: "A" },
    { question: "She is good ____ mathematics.", options: { A: "at", B: "in", C: "on", D: "to" }, correctAnswer: "A" },
    { question: "The dog jumped ____ the wall.", options: { A: "over", B: "on", C: "at", D: "in" }, correctAnswer: "A" },
    { question: "He is afraid ____ spiders.", options: { A: "of", B: "from", C: "with", D: "by" }, correctAnswer: "A" },
    { question: "She sat ____ her mother.", options: { A: "beside", B: "besides", C: "between", D: "among" }, correctAnswer: "A" },
    { question: "The cat hid ____ the bed.", options: { A: "under", B: "below", C: "beneath", D: "underneath" }, correctAnswer: "A" },
    { question: "He walked ____ the road.", options: { A: "along", B: "on", C: "in", D: "at" }, correctAnswer: "A" }
  ],
  "Subject-Verb Agreement": [
    { question: "Each student ____ a pen.", options: { A: "have", B: "has", C: "having", D: "had" }, correctAnswer: "B" },
    { question: "Neither the teacher nor the students ____ present.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "The team ____ playing well.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "There ____ many reasons.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "One of the boys ____ late.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "Physics ____ a difficult subject.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "The news ____ true.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "My family ____ to the park.", options: { A: "go", B: "goes", C: "going", D: "gone" }, correctAnswer: "B" },
    { question: "You or he ____ responsible.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "The books on the shelf ____ mine.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "Everyone ____ present today.", options: { A: "is", B: "are", C: "were", D: "have" }, correctAnswer: "A" },
    { question: "The committee ____ divided on this issue.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "Bread and butter ____ my favorite breakfast.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "Neither of them ____ correct.", options: { A: "is", B: "are", C: "were", D: "have" }, correctAnswer: "A" },
    { question: "The number of students ____ increasing.", options: { A: "is", B: "are", C: "were", D: "have" }, correctAnswer: "A" }
  ],
  "Voice (Active/Passive)": [
    { question: "The cake ____ by my mother.", options: { A: "was baked", B: "baked", C: "is baking", D: "bakes" }, correctAnswer: "A" },
    { question: "The letter ____ yesterday.", options: { A: "was written", B: "wrote", C: "is writing", D: "writes" }, correctAnswer: "A" },
    { question: "The song ____ sung by her.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "The door ____ locked every night.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "A" },
    { question: "The work ____ completed by tomorrow.", options: { A: "will be", B: "is", C: "was", D: "has been" }, correctAnswer: "A" },
    { question: "The book ____ by the author.", options: { A: "was written", B: "wrote", C: "is writing", D: "writes" }, correctAnswer: "A" },
    { question: "The car ____ repaired now.", options: { A: "is being", B: "was being", C: "has been", D: "will be" }, correctAnswer: "A" },
    { question: "The house ____ built last year.", options: { A: "was", B: "is", C: "has been", D: "will be" }, correctAnswer: "A" },
    { question: "The food ____ eaten by the children.", options: { A: "was", B: "is", C: "has been", D: "will be" }, correctAnswer: "A" },
    { question: "The exam ____ taken by all students.", options: { A: "was", B: "is", C: "has been", D: "will be" }, correctAnswer: "A" }
  ],
  "Narration (Direct/Indirect)": [
    { question: "He said, 'I am happy.' He said that he ____ happy.", options: { A: "was", B: "is", C: "were", D: "been" }, correctAnswer: "A" },
    { question: "She said, 'I will come.' She said that she ____ come.", options: { A: "would", B: "will", C: "shall", D: "can" }, correctAnswer: "A" },
    { question: "He said, 'I have finished.' He said that he ____ finished.", options: { A: "had", B: "has", C: "have", D: "having" }, correctAnswer: "A" },
    { question: "She said, 'I can swim.' She said that she ____ swim.", options: { A: "could", B: "can", C: "may", D: "might" }, correctAnswer: "A" },
    { question: "He said, 'Do you like it?' He asked if I ____ it.", options: { A: "liked", B: "like", C: "likes", D: "liking" }, correctAnswer: "A" },
    { question: "She said, 'I am reading.' She said that she ____ reading.", options: { A: "was", B: "is", C: "were", D: "been" }, correctAnswer: "A" },
    { question: "He said, 'I will help you.' He said that he ____ help me.", options: { A: "would", B: "will", C: "shall", D: "can" }, correctAnswer: "A" },
    { question: "She said, 'I have been waiting.' She said that she ____ been waiting.", options: { A: "had", B: "has", C: "have", D: "having" }, correctAnswer: "A" },
    { question: "He said, 'I must go.' He said that he ____ go.", options: { A: "had to", B: "must", C: "should", D: "ought to" }, correctAnswer: "A" },
    { question: "She said, 'I may come.' She said that she ____ come.", options: { A: "might", B: "may", C: "can", D: "could" }, correctAnswer: "A" }
  ],
  "Error Spotting": [
    { question: "Find the error: He don't like coffee.", options: { A: "He", B: "don't", C: "like", D: "coffee" }, correctAnswer: "B" },
    { question: "Find the error: She is more taller than me.", options: { A: "She", B: "is", C: "more taller", D: "than me" }, correctAnswer: "C" },
    { question: "Find the error: I have went to the market.", options: { A: "I", B: "have", C: "went", D: "to the market" }, correctAnswer: "C" },
    { question: "Find the error: Each of the boys have a pen.", options: { A: "Each", B: "of the boys", C: "have", D: "a pen" }, correctAnswer: "C" },
    { question: "Find the error: She is good in mathematics.", options: { A: "She", B: "is", C: "good in", D: "mathematics" }, correctAnswer: "C" },
    { question: "Find the error: He is one of the best student.", options: { A: "He", B: "is", C: "one of the best", D: "student" }, correctAnswer: "D" },
    { question: "Find the error: I am waiting since morning.", options: { A: "I am", B: "waiting", C: "since", D: "morning" }, correctAnswer: "C" },
    { question: "Find the error: Neither he nor I is going.", options: { A: "Neither", B: "nor I", C: "is", D: "going" }, correctAnswer: "C" },
    { question: "Find the error: She sings very beautifully.", options: { A: "She", B: "sings", C: "very", D: "beautifully" }, correctAnswer: "D" },
    { question: "Find the error: The news are true.", options: { A: "The", B: "news", C: "are", D: "true" }, correctAnswer: "C" }
  ],
  "Fill in the Blanks": [
    { question: "He is ____ than his brother.", options: { A: "tall", B: "taller", C: "tallest", D: "more tall" }, correctAnswer: "B" },
    { question: "This is the ____ book I have ever read.", options: { A: "interesting", B: "more interesting", C: "most interesting", D: "very interesting" }, correctAnswer: "C" },
    { question: "He drove the car ____.", options: { A: "careful", B: "carefully", C: "more careful", D: "most careful" }, correctAnswer: "B" },
    { question: "The weather is too ____ for a walk.", options: { A: "hot", B: "hotter", C: "hottest", D: "more hot" }, correctAnswer: "A" },
    { question: "She speaks English very ____.", options: { A: "good", B: "better", C: "best", D: "well" }, correctAnswer: "D" },
    { question: "I would like ____ water.", options: { A: "some", B: "any", C: "many", D: "much" }, correctAnswer: "A" },
    { question: "There are ____ students in the class.", options: { A: "few", B: "little", C: "much", D: "lot" }, correctAnswer: "A" },
    { question: "He is not as tall ____ his father.", options: { A: "than", B: "then", C: "as", D: "like" }, correctAnswer: "C" },
    { question: "The scenery is too beautiful ____ words.", options: { A: "for", B: "to", C: "in", D: "beyond" }, correctAnswer: "D" },
    { question: "She behaves as if she ____ the owner.", options: { A: "is", B: "was", C: "were", D: "are" }, correctAnswer: "C" },
    { question: "I have been waiting ____ two hours.", options: { A: "since", B: "for", C: "from", D: "by" }, correctAnswer: "B" },
    { question: "He is the ____ boy in the class.", options: { A: "tall", B: "taller", C: "tallest", D: "more tall" }, correctAnswer: "C" },
    { question: "She ____ to school every day.", options: { A: "go", B: "goes", C: "going", D: "gone" }, correctAnswer: "B" },
    { question: "They ____ playing football now.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "I ____ never been to America.", options: { A: "have", B: "has", C: "had", D: "am" }, correctAnswer: "A" }
  ],
  "Sentence Improvement": [
    { question: "Improve: He is more stronger than me.", options: { A: "more strong", B: "stronger", C: "most stronger", D: "No improvement" }, correctAnswer: "B" },
    { question: "Improve: She sings very good.", options: { A: "good", B: "well", C: "better", D: "best" }, correctAnswer: "B" },
    { question: "Improve: I have went to the market.", options: { A: "went", B: "gone", C: "going", D: "go" }, correctAnswer: "B" },
    { question: "Improve: He is one of the best student.", options: { A: "student", B: "students", C: "student's", D: "students'" }, correctAnswer: "B" },
    { question: "Improve: She is good in mathematics.", options: { A: "good in", B: "good at", C: "good with", D: "good on" }, correctAnswer: "B" },
    { question: "Improve: I am waiting since morning.", options: { A: "since", B: "for", C: "from", D: "by" }, correctAnswer: "B" },
    { question: "Improve: He don't like coffee.", options: { A: "don't", B: "doesn't", C: "isn't", D: "aren't" }, correctAnswer: "B" },
    { question: "Improve: Neither he nor I is going.", options: { A: "is", B: "are", C: "am", D: "were" }, correctAnswer: "C" },
    { question: "Improve: The news are true.", options: { A: "are", B: "is", C: "were", D: "have" }, correctAnswer: "B" },
    { question: "Improve: She is more taller than me.", options: { A: "more taller", B: "taller", C: "most taller", D: "tallest" }, correctAnswer: "B" }
  ],
  "Synonyms & Antonyms": [
    { question: "Synonym of 'Happy':", options: { A: "Sad", B: "Joyful", C: "Angry", D: "Tired" }, correctAnswer: "B" },
    { question: "Antonym of 'Hot':", options: { A: "Warm", B: "Cold", C: "Cool", D: "Freezing" }, correctAnswer: "B" },
    { question: "Synonym of 'Big':", options: { A: "Small", B: "Tiny", C: "Large", D: "Little" }, correctAnswer: "C" },
    { question: "Antonym of 'Fast':", options: { A: "Quick", B: "Slow", C: "Rapid", D: "Swift" }, correctAnswer: "B" },
    { question: "Synonym of 'Beautiful':", options: { A: "Ugly", B: "Pretty", C: "Plain", D: "Dull" }, correctAnswer: "B" },
    { question: "Antonym of 'Rich':", options: { A: "Wealthy", B: "Poor", C: "Affluent", D: "Prosperous" }, correctAnswer: "B" },
    { question: "Synonym of 'Brave':", options: { A: "Coward", B: "Courageous", C: "Timid", D: "Fearful" }, correctAnswer: "B" },
    { question: "Antonym of 'Easy':", options: { A: "Simple", B: "Difficult", C: "Effortless", D: "Smooth" }, correctAnswer: "B" },
    { question: "Synonym of 'Intelligent':", options: { A: "Stupid", B: "Smart", C: "Dull", D: "Ignorant" }, correctAnswer: "B" },
    { question: "Antonym of 'Love':", options: { A: "Like", B: "Hate", C: "Adore", D: "Cherish" }, correctAnswer: "B" },
    { question: "Synonym of 'Angry':", options: { A: "Calm", B: "Furious", C: "Happy", D: "Peaceful" }, correctAnswer: "B" },
    { question: "Antonym of 'Strong':", options: { A: "Powerful", B: "Weak", C: "Mighty", D: "Robust" }, correctAnswer: "B" },
    { question: "Synonym of 'Quick':", options: { A: "Slow", B: "Fast", C: "Lazy", D: "Sluggish" }, correctAnswer: "B" },
    { question: "Antonym of 'Old':", options: { A: "Ancient", B: "Young", C: "Aged", D: "Elderly" }, correctAnswer: "B" },
    { question: "Synonym of 'Sad':", options: { A: "Happy", B: "Sorrowful", C: "Joyful", D: "Cheerful" }, correctAnswer: "B" }
  ],
  "Idioms & Phrases": [
    { question: "Meaning of 'Break the ice':", options: { A: "Destroy something", B: "Start a conversation", C: "Freeze water", D: "Break something" }, correctAnswer: "B" },
    { question: "Meaning of 'Hit the nail on the head':", options: { A: "Hit something hard", B: "Be exactly right", C: "Make a mistake", D: "Nail something" }, correctAnswer: "B" },
    { question: "Meaning of 'A piece of cake':", options: { A: "A piece of food", B: "Very easy", C: "Very difficult", D: "A small thing" }, correctAnswer: "B" },
    { question: "Meaning of 'Cost an arm and a leg':", options: { A: "Very cheap", B: "Very expensive", C: "Free", D: "Affordable" }, correctAnswer: "B" },
    { question: "Meaning of 'Let the cat out of the bag':", options: { A: "Release a cat", B: "Reveal a secret", C: "Keep a secret", D: "Buy a cat" }, correctAnswer: "B" },
    { question: "Meaning of 'Bite the bullet':", options: { A: "Eat something hard", B: "Face a difficult situation", C: "Avoid something", D: "Run away" }, correctAnswer: "B" },
    { question: "Meaning of 'Burn the midnight oil':", options: { A: "Waste oil", B: "Work late at night", C: "Sleep early", D: "Start a fire" }, correctAnswer: "B" },
    { question: "Meaning of 'Once in a blue moon':", options: { A: "Very often", B: "Very rarely", C: "Every month", D: "Every week" }, correctAnswer: "B" },
    { question: "Meaning of 'Spill the beans':", options: { A: "Drop beans", B: "Reveal a secret", C: "Cook beans", D: "Buy beans" }, correctAnswer: "B" },
    { question: "Meaning of 'Under the weather':", options: { A: "Under rain", B: "Feeling sick", C: "Feeling happy", D: "Under cloud" }, correctAnswer: "B" }
  ],
  "Miscellaneous": [
    { question: "She is ____ than her brother.", options: { A: "tall", B: "taller", C: "tallest", D: "more tall" }, correctAnswer: "B" },
    { question: "This is the ____ book I have ever read.", options: { A: "interesting", B: "more interesting", C: "most interesting", D: "very interesting" }, correctAnswer: "C" },
    { question: "He drove the car ____.", options: { A: "careful", B: "carefully", C: "more careful", D: "most careful" }, correctAnswer: "B" },
    { question: "The weather is too ____ for a walk.", options: { A: "hot", B: "hotter", C: "hottest", D: "more hot" }, correctAnswer: "A" },
    { question: "She speaks English very ____.", options: { A: "good", B: "better", C: "best", D: "well" }, correctAnswer: "D" },
    { question: "I would like ____ water.", options: { A: "some", B: "any", C: "many", D: "much" }, correctAnswer: "A" },
    { question: "There are ____ students in the class.", options: { A: "few", B: "little", C: "much", D: "lot" }, correctAnswer: "A" },
    { question: "He is not as tall ____ his father.", options: { A: "than", B: "then", C: "as", D: "like" }, correctAnswer: "C" },
    { question: "The scenery is too beautiful ____ words.", options: { A: "for", B: "to", C: "in", D: "beyond" }, correctAnswer: "D" },
    { question: "She behaves as if she ____ the owner.", options: { A: "is", B: "was", C: "were", D: "are" }, correctAnswer: "C" },
    { question: "I have been waiting ____ two hours.", options: { A: "since", B: "for", C: "from", D: "by" }, correctAnswer: "B" },
    { question: "He is the ____ boy in the class.", options: { A: "tall", B: "taller", C: "tallest", D: "more tall" }, correctAnswer: "C" },
    { question: "She ____ to school every day.", options: { A: "go", B: "goes", C: "going", D: "gone" }, correctAnswer: "B" },
    { question: "They ____ playing football now.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" },
    { question: "I ____ never been to America.", options: { A: "have", B: "has", C: "had", D: "am" }, correctAnswer: "A" }
  ]
};

const gkQuestions: Record<string, Question[]> = {
  "Indian History": [
    { question: "Who was the first Emperor of the Maurya Empire?", options: { A: "Bindusara", B: "Ashoka", C: "Chandragupta Maurya", D: "Chanakya" }, correctAnswer: "C" },
    { question: "The Battle of Plassey was fought in which year?", options: { A: "1757", B: "1764", C: "1857", D: "1947" }, correctAnswer: "A" },
    { question: "Who founded the Mughal Empire in India?", options: { A: "Akbar", B: "Babur", C: "Humayun", D: "Shah Jahan" }, correctAnswer: "B" },
    { question: "The Quit India Movement was launched in which year?", options: { A: "1940", B: "1942", C: "1944", D: "1946" }, correctAnswer: "B" },
    { question: "Who was the last Viceroy of British India?", options: { A: "Lord Mountbatten", B: "Lord Wavell", C: "Lord Curzon", D: "Lord Linlithgow" }, correctAnswer: "A" },
    { question: "The Jallianwala Bagh massacre took place in which city?", options: { A: "Delhi", B: "Amritsar", C: "Lahore", D: "Kolkata" }, correctAnswer: "B" },
    { question: "Who wrote the book 'The Discovery of India'?", options: { A: "Mahatma Gandhi", B: "Jawaharlal Nehru", C: "Subhas Chandra Bose", D: "Dr. B.R. Ambedkar" }, correctAnswer: "B" },
    { question: "Which fort was built by Shivaji Maharaj?", options: { A: "Red Fort", B: "Agra Fort", C: "Sinhagad Fort", D: "Gwalior Fort" }, correctAnswer: "C" },
    { question: "Who is known as the 'Father of the Nation'?", options: { A: "Jawaharlal Nehru", B: "Mahatma Gandhi", C: "Subhas Chandra Bose", D: "Dr. B.R. Ambedkar" }, correctAnswer: "B" },
    { question: "In which year did India gain independence?", options: { A: "1945", B: "1946", C: "1947", D: "1948" }, correctAnswer: "C" },
    { question: "Who was the first President of India?", options: { A: "Dr. Rajendra Prasad", B: "Jawaharlal Nehru", C: "Sardar Patel", D: "Dr. Radhakrishnan" }, correctAnswer: "A" },
    { question: "The Battle of Haldighati was fought between Akbar and?", options: { A: "Shivaji", B: "Maharana Pratap", C: "Rana Sanga", D: "Hemu" }, correctAnswer: "B" },
    { question: "Who founded the Arya Samaj?", options: { A: "Swami Vivekananda", B: "Dayanand Saraswati", C: "Raja Ram Mohan Roy", D: "Ishwar Chandra Vidyasagar" }, correctAnswer: "B" },
    { question: "The Sepoy Mutiny of 1857 started from?", options: { A: "Delhi", B: "Meerut", C: "Lucknow", D: "Kanpur" }, correctAnswer: "B" },
    { question: "Who was the first Governor-General of independent India?", options: { A: "Lord Mountbatten", B: "C. Rajagopalachari", C: "Dr. Rajendra Prasad", D: "Jawaharlal Nehru" }, correctAnswer: "A" }
  ],
  "Indian Geography": [
    { question: "Which is the longest river in India?", options: { A: "Yamuna", B: "Ganga", C: "Brahmaputra", D: "Godavari" }, correctAnswer: "B" },
    { question: "Which is the highest peak in India?", options: { A: "Nanda Devi", B: "Kangchenjunga", C: "K2", D: "Mount Everest" }, correctAnswer: "B" },
    { question: "Which state has the longest coastline in India?", options: { A: "Gujarat", B: "Maharashtra", C: "Tamil Nadu", D: "Andhra Pradesh" }, correctAnswer: "A" },
    { question: "Which desert is found in India?", options: { A: "Thar", B: "Sahara", C: "Gobi", D: "Kalahari" }, correctAnswer: "A" },
    { question: "Which is the largest state of India by area?", options: { A: "Madhya Pradesh", B: "Maharashtra", C: "Rajasthan", D: "Uttar Pradesh" }, correctAnswer: "C" },
    { question: "Which pass connects India and China?", options: { A: "Banihal", B: "Rohtang", C: "Nathu La", D: "Zoji La" }, correctAnswer: "C" },
    { question: "Which is the smallest state of India by area?", options: { A: "Goa", B: "Sikkim", C: "Mizoram", D: "Puducherry" }, correctAnswer: "A" },
    { question: "Which river flows through the Grand Canyon?", options: { A: "Narmada", B: "Krishna", C: "Mahanadi", D: "Son" }, correctAnswer: "A" },
    { question: "Which is the easternmost state of India?", options: { A: "Arunachal Pradesh", B: "Assam", C: "West Bengal", D: "Odisha" }, correctAnswer: "A" },
    { question: "Lake Chilika is located in which state?", options: { A: "West Bengal", B: "Odisha", C: "Andhra Pradesh", D: "Tamil Nadu" }, correctAnswer: "B" },
    { question: "Which is the largest freshwater lake in India?", options: { A: "Dal Lake", B: "Wular Lake", C: "Chilika Lake", D: "Loktak Lake" }, correctAnswer: "B" },
    { question: "Which river is known as the 'Sorrow of Bengal'?", options: { A: "Ganga", B: "Damodar", C: "Brahmaputra", D: "Hooghly" }, correctAnswer: "B" },
    { question: "Which is the southernmost point of India?", options: { A: "Kanyakumari", B: "Indira Point", C: "Rameswaram", D: "Kochi" }, correctAnswer: "B" },
    { question: "Which mountain range separates India from Myanmar?", options: { A: "Himalayas", B: "Arakan Yoma", C: "Vindhyas", D: "Satpuras" }, correctAnswer: "B" },
    { question: "Which is the largest delta in the world?", options: { A: "Sundarbans", B: "Nile Delta", C: "Amazon Delta", D: "Mekong Delta" }, correctAnswer: "A" }
  ],
  "Indian Polity": [
    { question: "Who is the head of the Indian government?", options: { A: "President", B: "Prime Minister", C: "Chief Justice", D: "Speaker" }, correctAnswer: "B" },
    { question: "How many fundamental rights are there in the Indian Constitution?", options: { A: "5", B: "6", C: "7", D: "8" }, correctAnswer: "B" },
    { question: "Who is the guardian of the Indian Constitution?", options: { A: "President", B: "Prime Minister", C: "Supreme Court", D: "Parliament" }, correctAnswer: "C" },
    { question: "The Indian Constitution was adopted on?", options: { A: "26 January 1950", B: "26 November 1949", C: "15 August 1947", D: "2 October 1950" }, correctAnswer: "B" },
    { question: "Who was the Chairman of the Drafting Committee?", options: { A: "Jawaharlal Nehru", B: "Dr. B.R. Ambedkar", C: "Sardar Patel", D: "Dr. Rajendra Prasad" }, correctAnswer: "B" },
    { question: "The Panchayati Raj system was introduced in India in?", options: { A: "1950", B: "1959", C: "1965", D: "1975" }, correctAnswer: "B" },
    { question: "How many schedules are there in the Indian Constitution?", options: { A: "10", B: "11", C: "12", D: "13" }, correctAnswer: "C" },
    { question: "Who appoints the Chief Justice of India?", options: { A: "President", B: "Prime Minister", C: "Parliament", D: "Law Minister" }, correctAnswer: "A" },
    { question: "The minimum age to become the President of India is?", options: { A: "25 years", B: "30 years", C: "35 years", D: "40 years" }, correctAnswer: "C" },
    { question: "Which article of the Indian Constitution deals with Right to Education?", options: { A: "Article 19", B: "Article 21", C: "Article 21A", D: "Article 32" }, correctAnswer: "C" },
    { question: "Who can dissolve the Lok Sabha?", options: { A: "Prime Minister", B: "President", C: "Speaker", D: "Chief Justice" }, correctAnswer: "B" },
    { question: "The Rajya Sabha is also known as?", options: { A: "Lower House", B: "Upper House", C: "House of People", D: "Council of States" }, correctAnswer: "D" },
    { question: "How many members can the President nominate to Rajya Sabha?", options: { A: "10", B: "12", C: "14", D: "16" }, correctAnswer: "B" },
    { question: "The concept of Fundamental Duties was borrowed from?", options: { A: "USA", B: "UK", C: "USSR", D: "Canada" }, correctAnswer: "C" },
    { question: "Which amendment reduced the voting age from 21 to 18?", options: { A: "42nd", B: "44th", C: "61st", D: "73rd" }, correctAnswer: "C" }
  ],
  "Indian Economy": [
    { question: "What is the currency of India?", options: { A: "Dollar", B: "Pound", C: "Rupee", D: "Yen" }, correctAnswer: "C" },
    { question: "The Reserve Bank of India was established in?", options: { A: "1935", B: "1947", C: "1950", D: "1960" }, correctAnswer: "A" },
    { question: "What is the GDP of India approximately (2024)?", options: { A: "$2 trillion", B: "$3 trillion", C: "$4 trillion", D: "$5 trillion" }, correctAnswer: "C" },
    { question: "Which sector contributes the most to India's GDP?", options: { A: "Agriculture", B: "Industry", C: "Services", D: "Manufacturing" }, correctAnswer: "C" },
    { question: "The first Five Year Plan was launched in?", options: { A: "1947", B: "1950", C: "1951", D: "1955" }, correctAnswer: "C" },
    { question: "What is the repo rate?", options: { A: "Rate at which RBI lends to banks", B: "Rate at which banks lend to public", C: "Rate of inflation", D: "Rate of interest on savings" }, correctAnswer: "A" },
    { question: "Which organization prepares the National Income estimates in India?", options: { A: "RBI", B: "CSO", C: "Planning Commission", D: "Finance Ministry" }, correctAnswer: "B" },
    { question: "The Green Revolution in India was related to?", options: { A: "Industry", B: "Agriculture", C: "Services", D: "Mining" }, correctAnswer: "B" },
    { question: "What is the minimum age to open a bank account in India?", options: { A: "10 years", B: "14 years", C: "18 years", D: "21 years" }, correctAnswer: "C" },
    { question: "Which tax is levied on goods and services in India?", options: { A: "Income Tax", B: "GST", C: "Customs Duty", D: "Excise Duty" }, correctAnswer: "B" },
    { question: "The headquarters of RBI is located in?", options: { A: "Delhi", B: "Mumbai", C: "Kolkata", D: "Chennai" }, correctAnswer: "B" },
    { question: "Which scheme is related to financial inclusion in India?", options: { A: "Swachh Bharat", B: "Jan Dhan Yojana", C: "Make in India", D: "Digital India" }, correctAnswer: "B" },
    { question: "What is the full form of GDP?", options: { A: "Gross Domestic Product", B: "General Domestic Product", C: "Gross Development Plan", D: "General Development Product" }, correctAnswer: "A" },
    { question: "Which is the largest public sector bank in India?", options: { A: "Bank of India", B: "SBI", C: "PNB", D: "BOB" }, correctAnswer: "B" },
    { question: "The concept of Mixed Economy in India means?", options: { A: "Only public sector", B: "Only private sector", C: "Both public and private sectors", D: "Foreign investment only" }, correctAnswer: "C" }
  ],
  "Science & Technology": [
    { question: "What is the chemical formula of water?", options: { A: "HO", B: "H2O", C: "H2O2", D: "OH2" }, correctAnswer: "B" },
    { question: "Which planet is known as the Red Planet?", options: { A: "Venus", B: "Mars", C: "Jupiter", D: "Saturn" }, correctAnswer: "B" },
    { question: "What is the unit of force?", options: { A: "Watt", B: "Joule", C: "Newton", D: "Pascal" }, correctAnswer: "C" },
    { question: "Which organ produces insulin?", options: { A: "Liver", B: "Kidney", C: "Pancreas", D: "Heart" }, correctAnswer: "C" },
    { question: "What is the speed of light?", options: { A: "3,00,000 km/s", B: "3,00,000 m/s", C: "3,000 km/s", D: "30,000 km/s" }, correctAnswer: "A" },
    { question: "Which gas do plants absorb from the atmosphere?", options: { A: "Oxygen", B: "Nitrogen", C: "Carbon Dioxide", D: "Hydrogen" }, correctAnswer: "C" },
    { question: "What type of rock is marble?", options: { A: "Igneous", B: "Sedimentary", C: "Metamorphic", D: "Volcanic" }, correctAnswer: "C" },
    { question: "Which vitamin is produced by sunlight?", options: { A: "Vitamin A", B: "Vitamin B", C: "Vitamin C", D: "Vitamin D" }, correctAnswer: "D" },
    { question: "Which metal is liquid at room temperature?", options: { A: "Mercury", B: "Iron", C: "Gold", D: "Copper" }, correctAnswer: "A" },
    { question: "What is the boiling point of water?", options: { A: "90°C", B: "100°C", C: "110°C", D: "120°C" }, correctAnswer: "B" },
    { question: "What is the chemical symbol for Gold?", options: { A: "Go", B: "Gd", C: "Au", D: "Ag" }, correctAnswer: "C" },
    { question: "Which is the largest planet in our solar system?", options: { A: "Earth", B: "Mars", C: "Jupiter", D: "Saturn" }, correctAnswer: "C" },
    { question: "What is the pH value of pure water?", options: { A: "5", B: "6", C: "7", D: "8" }, correctAnswer: "C" },
    { question: "Which gas is most abundant in the atmosphere?", options: { A: "Oxygen", B: "Nitrogen", C: "Carbon Dioxide", D: "Hydrogen" }, correctAnswer: "B" },
    { question: "What is the unit of electric current?", options: { A: "Volt", B: "Watt", C: "Ampere", D: "Ohm" }, correctAnswer: "C" }
  ],
  "Sports": [
    { question: "How many players are there in a cricket team?", options: { A: "9", B: "10", C: "11", D: "12" }, correctAnswer: "C" },
    { question: "In which sport is the term 'Home Run' used?", options: { A: "Football", B: "Baseball", C: "Cricket", D: "Hockey" }, correctAnswer: "B" },
    { question: "Which country won the 2022 FIFA World Cup?", options: { A: "Brazil", B: "France", C: "Argentina", D: "Germany" }, correctAnswer: "C" },
    { question: "What is the national sport of Japan?", options: { A: "Judo", B: "Karate", C: "Sumo Wrestling", D: "Baseball" }, correctAnswer: "C" },
    { question: "In which sport would you perform a 'slam dunk'?", options: { A: "Volleyball", B: "Basketball", C: "Tennis", D: "Badminton" }, correctAnswer: "B" },
    { question: "How many rings are there in the Olympic logo?", options: { A: "4", B: "5", C: "6", D: "7" }, correctAnswer: "B" },
    { question: "Which sport uses a shuttlecock?", options: { A: "Badminton", B: "Squash", C: "Tennis", D: "Table Tennis" }, correctAnswer: "A" },
    { question: "How many holes are there in a standard golf course?", options: { A: "9", B: "12", C: "18", D: "21" }, correctAnswer: "C" },
    { question: "Which country is known as the birthplace of cricket?", options: { A: "Australia", B: "India", C: "England", D: "South Africa" }, correctAnswer: "C" },
    { question: "In tennis, what is a score of zero called?", options: { A: "Nil", B: "Zero", C: "Love", D: "Nothing" }, correctAnswer: "C" },
    { question: "How many players are there in a football team?", options: { A: "9", B: "10", C: "11", D: "12" }, correctAnswer: "C" },
    { question: "Which sport is associated with the term 'Grand Slam'?", options: { A: "Cricket", B: "Tennis", C: "Football", D: "Hockey" }, correctAnswer: "B" },
    { question: "The Olympics are held every ____ years.", options: { A: "2", B: "3", C: "4", D: "5" }, correctAnswer: "C" },
    { question: "Which country won the most Olympic gold medals in 2024?", options: { A: "China", B: "USA", C: "India", D: "Russia" }, correctAnswer: "B" },
    { question: "What is the duration of a football match?", options: { A: "60 minutes", B: "70 minutes", C: "90 minutes", D: "120 minutes" }, correctAnswer: "C" }
  ],
  "Awards & Honours": [
    { question: "Who was the first Indian to win a Nobel Prize?", options: { A: "C.V. Raman", B: "Rabindranath Tagore", C: "Mother Teresa", D: "Amartya Sen" }, correctAnswer: "B" },
    { question: "The Bharat Ratna is awarded for?", options: { A: "Sports", B: "Literature", C: "Highest civilian honour", D: "Military service" }, correctAnswer: "C" },
    { question: "Who won the Nobel Peace Prize in 2014?", options: { A: "Malala Yousafzai", B: "Kailash Satyarthi", C: "Both A and B", D: "Nelson Mandela" }, correctAnswer: "C" },
    { question: "The Padma Shri is the ____ highest civilian award in India.", options: { A: "First", B: "Second", C: "Third", D: "Fourth" }, correctAnswer: "D" },
    { question: "Who was the first Indian woman to win an Olympic medal?", options: { A: "P.V. Sindhu", B: "Karnam Malleswari", C: "Saina Nehwal", D: "Mary Kom" }, correctAnswer: "B" },
    { question: "The Arjuna Award is given for excellence in?", options: { A: "Literature", B: "Science", C: "Sports", D: "Arts" }, correctAnswer: "C" },
    { question: "Who won the Booker Prize for 'Midnight's Children'?", options: { A: "Salman Rushdie", B: "Arundhati Roy", C: "Vikram Seth", D: "R.K. Narayan" }, correctAnswer: "A" },
    { question: "The Dronacharya Award is given to?", options: { A: "Players", B: "Coaches", C: "Referees", D: "Sports administrators" }, correctAnswer: "B" },
    { question: "Who was the first Indian to win an individual Olympic gold medal?", options: { A: "Leander Paes", B: "Abhinav Bindra", C: "Sushil Kumar", D: "Vijender Singh" }, correctAnswer: "B" },
    { question: "The Ramon Magsaysay Award is often called?", options: { A: "Asian Nobel Prize", B: "European Nobel Prize", C: "Indian Nobel Prize", D: "World Nobel Prize" }, correctAnswer: "A" }
  ],
  "Important Days": [
    { question: "When is Republic Day celebrated in India?", options: { A: "15 August", B: "26 January", C: "2 October", D: "14 November" }, correctAnswer: "B" },
    { question: "When is Independence Day celebrated in India?", options: { A: "15 August", B: "26 January", C: "2 October", D: "14 November" }, correctAnswer: "A" },
    { question: "When is Gandhi Jayanti celebrated?", options: { A: "15 August", B: "26 January", C: "2 October", D: "14 November" }, correctAnswer: "C" },
    { question: "When is International Women's Day?", options: { A: "8 March", B: "15 March", C: "1 May", D: "5 June" }, correctAnswer: "A" },
    { question: "When is World Environment Day?", options: { A: "5 April", B: "5 May", C: "5 June", D: "5 July" }, correctAnswer: "C" },
    { question: "When is Teachers' Day celebrated in India?", options: { A: "5 September", B: "14 November", C: "2 October", D: "15 August" }, correctAnswer: "A" },
    { question: "When is Children's Day celebrated in India?", options: { A: "5 September", B: "14 November", C: "2 October", D: "15 August" }, correctAnswer: "B" },
    { question: "When is World Health Day?", options: { A: "7 April", B: "7 May", C: "7 June", D: "7 July" }, correctAnswer: "A" },
    { question: "When is Human Rights Day?", options: { A: "10 December", B: "10 November", C: "10 October", D: "10 September" }, correctAnswer: "A" },
    { question: "When is National Handloom Day?", options: { A: "7 August", B: "15 August", C: "26 January", D: "2 October" }, correctAnswer: "A" }
  ],
  "Static GK": [
    { question: "Which is the national animal of India?", options: { A: "Lion", B: "Tiger", C: "Elephant", D: "Peacock" }, correctAnswer: "B" },
    { question: "What is the national bird of India?", options: { A: "Parrot", B: "Peacock", C: "Pigeon", D: "Sparrow" }, correctAnswer: "B" },
    { question: "What is the national flower of India?", options: { A: "Lotus", B: "Rose", C: "Marigold", D: "Jasmine" }, correctAnswer: "A" },
    { question: "What is the national tree of India?", options: { A: "Banyan", B: "Neem", C: "Peepal", D: "Mango" }, correctAnswer: "A" },
    { question: "What is the national anthem of India?", options: { A: "Vande Mataram", B: "Jana Gana Mana", C: "Saare Jahan Se Acha", D: "Mile Sur Mera Tumhara" }, correctAnswer: "B" },
    { question: "What is the national sport of India?", options: { A: "Cricket", B: "Hockey", C: "Football", D: "Badminton" }, correctAnswer: "B" },
    { question: "What is the capital of India?", options: { A: "Mumbai", B: "Kolkata", C: "New Delhi", D: "Chennai" }, correctAnswer: "C" },
    { question: "How many states are there in India?", options: { A: "26", B: "28", C: "29", D: "30" }, correctAnswer: "B" },
    { question: "How many Union Territories are there in India?", options: { A: "6", B: "7", C: "8", D: "9" }, correctAnswer: "C" },
    { question: "Which city is known as the 'Pink City' of India?", options: { A: "Jaipur", B: "Udaipur", C: "Jodhpur", D: "Bikaner" }, correctAnswer: "A" },
    { question: "Which country has the longest common border with India?", options: { A: "China", B: "Pakistan", C: "Bangladesh", D: "Nepal" }, correctAnswer: "C" },
    { question: "Which is the national emblem of India?", options: { A: "Ashoka Chakra", B: "Lion Capital", C: "Tricolour", D: "Peacock" }, correctAnswer: "B" },
    { question: "What is the national song of India?", options: { A: "Vande Mataram", B: "Jana Gana Mana", C: "Saare Jahan Se Acha", D: "Mile Sur Mera Tumhara" }, correctAnswer: "A" },
    { question: "Which is the largest state of India by population?", options: { A: "Maharashtra", B: "Uttar Pradesh", C: "Bihar", D: "West Bengal" }, correctAnswer: "B" },
    { question: "Which is the smallest state of India by population?", options: { A: "Goa", B: "Sikkim", C: "Mizoram", D: "Puducherry" }, correctAnswer: "B" }
  ],
  "Miscellaneous": [
    { question: "Who wrote the Indian National Anthem?", options: { A: "Bankim Chandra", B: "Rabindranath Tagore", C: "Mahatma Gandhi", D: "Jawaharlal Nehru" }, correctAnswer: "B" },
    { question: "Who built the Taj Mahal?", options: { A: "Akbar", B: "Shah Jahan", C: "Jahangir", D: "Aurangzeb" }, correctAnswer: "B" },
    { question: "What is the currency of India?", options: { A: "Rupee", B: "Dollar", C: "Pound", D: "Yen" }, correctAnswer: "A" },
    { question: "Which is the national emblem of India?", options: { A: "Ashoka Chakra", B: "Lion Capital", C: "Tricolour", D: "Peacock" }, correctAnswer: "B" },
    { question: "What is the full form of ATM?", options: { A: "Automated Teller Machine", B: "Automatic Transfer Money", C: "Automated Transfer Machine", D: "Automatic Teller Mode" }, correctAnswer: "A" },
    { question: "How many colors are there in a rainbow?", options: { A: "5", B: "6", C: "7", D: "8" }, correctAnswer: "C" },
    { question: "Which festival is known as the 'Festival of Lights'?", options: { A: "Holi", B: "Diwali", C: "Eid", D: "Christmas" }, correctAnswer: "B" },
    { question: "What is the tallest structure in the world?", options: { A: "Eiffel Tower", B: "Burj Khalifa", C: "Shanghai Tower", D: "One World Trade Center" }, correctAnswer: "B" },
    { question: "How many sides does a hexagon have?", options: { A: "5", B: "6", C: "7", D: "8" }, correctAnswer: "B" },
    { question: "Which is the largest mammal?", options: { A: "Elephant", B: "Blue Whale", C: "Giraffe", D: "Hippopotamus" }, correctAnswer: "B" },
    { question: "Who is the author of 'Mahabharata'?", options: { A: "Valmiki", B: "Vyasa", C: "Tulsidas", D: "Kalidas" }, correctAnswer: "B" },
    { question: "Which city is known as the 'Pink City' of India?", options: { A: "Jaipur", B: "Udaipur", C: "Jodhpur", D: "Bikaner" }, correctAnswer: "A" },
    { question: "How many Union Territories are there in India?", options: { A: "6", B: "7", C: "8", D: "9" }, correctAnswer: "C" },
    { question: "Which is the longest railway platform in India?", options: { A: "Howrah", B: "Gorakhpur", C: "Kharagpur", D: "New Delhi" }, correctAnswer: "B" },
    { question: "Which is the largest continent?", options: { A: "Africa", B: "North America", C: "Asia", D: "Europe" }, correctAnswer: "C" }
  ]
};

const mathQuestions: Record<string, Question[]> = {
  "Number System": [
    { question: "What is the place value of 7 in the number 47,358?", options: { A: "7", B: "70", C: "700", D: "7000" }, correctAnswer: "D" },
    { question: "Which is the smallest prime number?", options: { A: "0", B: "1", C: "2", D: "3" }, correctAnswer: "C" },
    { question: "Find the value of 2³ × 3²", options: { A: "36", B: "72", C: "48", D: "54" }, correctAnswer: "B" },
    { question: "What is the LCM of 12 and 18?", options: { A: "36", B: "72", C: "18", D: "24" }, correctAnswer: "A" },
    { question: "Find the HCF of 24 and 36.", options: { A: "6", B: "12", C: "18", D: "4" }, correctAnswer: "B" },
    { question: "Which of the following is a composite number?", options: { A: "17", B: "29", C: "43", D: "51" }, correctAnswer: "D" },
    { question: "What is 15% of 200?", options: { A: "25", B: "30", C: "35", D: "40" }, correctAnswer: "B" },
    { question: "Square root of 144 is", options: { A: "10", B: "11", C: "12", D: "14" }, correctAnswer: "C" },
    { question: "What is 123 × 0?", options: { A: "0", B: "123", C: "1", D: "1230" }, correctAnswer: "A" },
    { question: "Which is the largest 4-digit number?", options: { A: "9999", B: "9998", C: "10000", D: "9000" }, correctAnswer: "A" },
    { question: "What is the value of 5! (5 factorial)?", options: { A: "25", B: "60", C: "120", D: "720" }, correctAnswer: "C" },
    { question: "Which of the following is an irrational number?", options: { A: "√4", B: "√9", C: "√2", D: "√16" }, correctAnswer: "C" },
    { question: "What is the sum of first 10 natural numbers?", options: { A: "45", B: "50", C: "55", D: "60" }, correctAnswer: "C" },
    { question: "What is 2⁵?", options: { A: "16", B: "32", C: "64", D: "128" }, correctAnswer: "B" },
    { question: "Which is the smallest composite number?", options: { A: "2", B: "3", C: "4", D: "6" }, correctAnswer: "C" }
  ],
  "Simplification": [
    { question: "Simplify: 2 + 3 × 4", options: { A: "20", B: "14", C: "24", D: "10" }, correctAnswer: "B" },
    { question: "Simplify: (15 + 5) ÷ 4", options: { A: "3", B: "4", C: "5", D: "6" }, correctAnswer: "C" },
    { question: "Simplify: 12 × 3 - 6", options: { A: "30", B: "36", C: "42", D: "24" }, correctAnswer: "A" },
    { question: "Simplify: 100 - 25 × 3", options: { A: "225", B: "75", C: "25", D: "50" }, correctAnswer: "C" },
    { question: "Simplify: 8² - 6²", options: { A: "28", B: "32", C: "36", D: "40" }, correctAnswer: "A" },
    { question: "Simplify: 3/4 + 1/2", options: { A: "4/6", B: "5/4", C: "1/6", D: "3/8" }, correctAnswer: "B" },
    { question: "Simplify: 0.5 × 0.5", options: { A: "0.25", B: "0.5", C: "0.1", D: "0.025" }, correctAnswer: "A" },
    { question: "Simplify: √81 + √49", options: { A: "14", B: "16", C: "18", D: "20" }, correctAnswer: "B" },
    { question: "Simplify: 2³ + 3²", options: { A: "13", B: "15", C: "17", D: "19" }, correctAnswer: "C" },
    { question: "Simplify: 45 ÷ 9 × 2", options: { A: "5", B: "10", C: "15", D: "20" }, correctAnswer: "B" }
  ],
  "Percentage": [
    { question: "What is 25% of 80?", options: { A: "15", B: "20", C: "25", D: "30" }, correctAnswer: "B" },
    { question: "What percent is 25 of 200?", options: { A: "10%", B: "12.5%", C: "15%", D: "20%" }, correctAnswer: "B" },
    { question: "If price increases from Rs. 100 to Rs. 120, what is the percentage increase?", options: { A: "10%", B: "15%", C: "20%", D: "25%" }, correctAnswer: "C" },
    { question: "What is 50% of 150?", options: { A: "65", B: "70", C: "75", D: "80" }, correctAnswer: "C" },
    { question: "A shopkeeper gives 10% discount. What is the selling price of Rs. 500 item?", options: { A: "Rs. 450", B: "Rs. 460", C: "Rs. 440", D: "Rs. 480" }, correctAnswer: "A" },
    { question: "What percent of 1 hour is 15 minutes?", options: { A: "20%", B: "25%", C: "30%", D: "35%" }, correctAnswer: "B" },
    { question: "If 20% of X is 40, find X.", options: { A: "150", B: "180", C: "200", D: "220" }, correctAnswer: "C" },
    { question: "What is 75% of 60?", options: { A: "40", B: "45", C: "50", D: "55" }, correctAnswer: "B" },
    { question: "A number is 30% less than 100. Find the number.", options: { A: "60", B: "65", C: "70", D: "75" }, correctAnswer: "C" },
    { question: "What percent is 3 of 75?", options: { A: "3%", B: "4%", C: "5%", D: "6%" }, correctAnswer: "B" },
    { question: "If a number increases by 20% and becomes 120, what was the original number?", options: { A: "90", B: "96", C: "100", D: "108" }, correctAnswer: "C" },
    { question: "What is 12.5% of 400?", options: { A: "40", B: "45", C: "50", D: "55" }, correctAnswer: "C" },
    { question: "If 60% of students passed and 200 passed, how many students appeared?", options: { A: "300", B: "333", C: "350", D: "400" }, correctAnswer: "B" },
    { question: "A salary of Rs. 10,000 is increased by 15%. New salary is?", options: { A: "Rs. 11,000", B: "Rs. 11,500", C: "Rs. 12,000", D: "Rs. 12,500" }, correctAnswer: "B" },
    { question: "What is 1% of 1% of 100?", options: { A: "0.001", B: "0.01", C: "0.1", D: "1" }, correctAnswer: "B" }
  ],
  "Profit & Loss": [
    { question: "A shopkeeper buys an article for Rs. 100 and sells for Rs. 120. Find profit %.", options: { A: "15%", B: "20%", C: "25%", D: "30%" }, correctAnswer: "B" },
    { question: "A TV is bought for Rs. 10000 and sold for Rs. 9000. Find loss %.", options: { A: "5%", B: "8%", C: "10%", D: "12%" }, correctAnswer: "C" },
    { question: "Cost price of an article is Rs. 200. Profit is 25%. Find selling price.", options: { A: "Rs. 220", B: "Rs. 225", C: "Rs. 240", D: "Rs. 250" }, correctAnswer: "D" },
    { question: "An article is sold at a loss of 10%. If cost price is Rs. 500, find selling price.", options: { A: "Rs. 440", B: "Rs. 450", C: "Rs. 460", D: "Rs. 480" }, correctAnswer: "B" },
    { question: "Profit of Rs. 50 is earned on an article costing Rs. 250. Find profit %.", options: { A: "15%", B: "18%", C: "20%", D: "22%" }, correctAnswer: "C" },
    { question: "A man buys 10 apples for Rs. 100 and sells 8 apples for Rs. 100. Find profit %.", options: { A: "20%", B: "25%", C: "30%", D: "35%" }, correctAnswer: "B" },
    { question: "Marked price of an article is Rs. 200. Discount is 10%. Find selling price.", options: { A: "Rs. 170", B: "Rs. 180", C: "Rs. 190", D: "Rs. 200" }, correctAnswer: "B" },
    { question: "If profit % is 20% and cost price is Rs. 300, find selling price.", options: { A: "Rs. 340", B: "Rs. 350", C: "Rs. 360", D: "Rs. 380" }, correctAnswer: "C" },
    { question: "A shopkeeper sells two items at Rs. 100 each. On one he gains 10%, on other loses 10%. Find net result.", options: { A: "No profit no loss", B: "Loss", C: "Profit", D: "Cannot be determined" }, correctAnswer: "B" },
    { question: "Cost price of 15 articles equals selling price of 12 articles. Find profit %.", options: { A: "20%", B: "22%", C: "25%", D: "30%" }, correctAnswer: "C" },
    { question: "An article is bought for Rs. 450 and sold for Rs. 400. Find loss %.", options: { A: "10%", B: "11.11%", C: "12%", D: "15%" }, correctAnswer: "B" },
    { question: "If CP is Rs. 500 and SP is Rs. 600, find profit.", options: { A: "Rs. 50", B: "Rs. 100", C: "Rs. 150", D: "Rs. 200" }, correctAnswer: "B" },
    { question: "A book is sold at 20% profit. If CP is Rs. 250, find SP.", options: { A: "Rs. 280", B: "Rs. 290", C: "Rs. 300", D: "Rs. 310" }, correctAnswer: "C" },
    { question: "A man sells an article at 10% loss. If he had sold it for Rs. 50 more, he would have gained 10%. Find CP.", options: { A: "Rs. 200", B: "Rs. 250", C: "Rs. 300", D: "Rs. 350" }, correctAnswer: "B" },
    { question: "If SP is Rs. 450 and profit is 20%, find CP.", options: { A: "Rs. 350", B: "Rs. 360", C: "Rs. 375", D: "Rs. 380" }, correctAnswer: "C" }
  ],
  "Ratio & Proportion": [
    { question: "What is the ratio of 1 hour to 90 minutes?", options: { A: "2:3", B: "3:2", C: "1:2", D: "2:1" }, correctAnswer: "A" },
    { question: "If a:b = 2:3 and b:c = 4:5, find a:c.", options: { A: "8:15", B: "6:20", C: "2:5", D: "3:5" }, correctAnswer: "A" },
    { question: "Divide Rs. 100 in ratio 2:3.", options: { A: "Rs. 40, Rs. 60", B: "Rs. 30, Rs. 70", C: "Rs. 50, Rs. 50", D: "Rs. 20, Rs. 80" }, correctAnswer: "A" },
    { question: "If 3x = 4y, find x:y.", options: { A: "3:4", B: "4:3", C: "1:1", D: "2:3" }, correctAnswer: "B" },
    { question: "The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls?", options: { A: "15", B: "20", C: "25", D: "30" }, correctAnswer: "B" },
    { question: "If a:b = 5:7, then (a+b):b = ?", options: { A: "12:7", B: "5:7", C: "7:5", D: "12:5" }, correctAnswer: "A" },
    { question: "Two numbers are in ratio 4:5. If their sum is 90, find the numbers.", options: { A: "36, 54", B: "40, 50", C: "45, 45", D: "30, 60" }, correctAnswer: "B" },
    { question: "If 5:8 :: x:24, find x.", options: { A: "10", B: "15", C: "20", D: "25" }, correctAnswer: "B" },
    { question: "The ratio of ages of A and B is 3:5. If A is 15 years old, how old is B?", options: { A: "20", B: "25", C: "30", D: "35" }, correctAnswer: "B" },
    { question: "If x:y = 2:3, find (2x+3y):(3x+2y).", options: { A: "13:12", B: "12:13", C: "5:5", D: "6:6" }, correctAnswer: "A" }
  ],
  "Time & Work": [
    { question: "A man can complete a work in 10 days. In how many days can 2 men complete it?", options: { A: "3 days", B: "4 days", C: "5 days", D: "6 days" }, correctAnswer: "C" },
    { question: "A work can be done in 20 days by 10 men. How many days will 25 men take?", options: { A: "6 days", B: "8 days", C: "10 days", D: "12 days" }, correctAnswer: "B" },
    { question: "A pipe fills a tank in 10 hours. Another pipe empties it in 15 hours. How long to fill?", options: { A: "20 hours", B: "25 hours", C: "30 hours", D: "35 hours" }, correctAnswer: "C" },
    { question: "If 5 men can build a wall in 12 days, how many days for 6 men?", options: { A: "8 days", B: "9 days", C: "10 days", D: "11 days" }, correctAnswer: "C" },
    { question: "A work done by 3 men in 8 days. Same work done by 6 men in how many days?", options: { A: "2 days", B: "3 days", C: "4 days", D: "5 days" }, correctAnswer: "C" },
    { question: "20 workers complete a work in 30 days. How many workers needed to complete in 15 days?", options: { A: "30", B: "35", C: "40", D: "45" }, correctAnswer: "C" },
    { question: "If A can do a work in 6 days and B in 9 days, together they can do in?", options: { A: "3.6 days", B: "4.5 days", C: "5.4 days", D: "6 days" }, correctAnswer: "A" },
    { question: "A work worth Rs. 300 is done by 10 men in 5 days. Find daily wage per man.", options: { A: "Rs. 5", B: "Rs. 6", C: "Rs. 7", D: "Rs. 8" }, correctAnswer: "B" },
    { question: "Two pipes fill a tank in 10 and 15 hours. Together they fill in?", options: { A: "5 hours", B: "6 hours", C: "7 hours", D: "8 hours" }, correctAnswer: "B" },
    { question: "A worker gets Rs. 200 for 5 days work. What will he get for 20 days?", options: { A: "Rs. 600", B: "Rs. 700", C: "Rs. 800", D: "Rs. 900" }, correctAnswer: "C" },
    { question: "A can do a work in 12 days, B in 15 days. Together they can do in?", options: { A: "6 days", B: "6.67 days", C: "7 days", D: "8 days" }, correctAnswer: "B" },
    { question: "If 8 men can do a work in 6 days, how many days for 12 men?", options: { A: "3 days", B: "4 days", C: "5 days", D: "6 days" }, correctAnswer: "B" },
    { question: "A and B together can do a work in 10 days. A alone can do it in 15 days. B alone can do it in?", options: { A: "20 days", B: "25 days", C: "30 days", D: "35 days" }, correctAnswer: "C" },
    { question: "12 men can complete a work in 8 days. How many days for 16 men?", options: { A: "5 days", B: "6 days", C: "7 days", D: "8 days" }, correctAnswer: "B" },
    { question: "A is twice as efficient as B. If B can do a work in 12 days, A can do it in?", options: { A: "4 days", B: "6 days", C: "8 days", D: "10 days" }, correctAnswer: "B" }
  ],
  "Time & Distance": [
    { question: "A car travels 240 km in 4 hours. What is its speed?", options: { A: "50 km/h", B: "55 km/h", C: "60 km/h", D: "65 km/h" }, correctAnswer: "C" },
    { question: "A man runs at 10 km/h. How far will he run in 30 minutes?", options: { A: "4 km", B: "5 km", C: "6 km", D: "7 km" }, correctAnswer: "B" },
    { question: "A train 100 m long passes a pole in 10 seconds. Find its speed.", options: { A: "10 m/s", B: "20 m/s", C: "30 m/s", D: "40 m/s" }, correctAnswer: "A" },
    { question: "Distance between two cities is 300 km. A car covers it in 5 hours. Speed is?", options: { A: "50 km/h", B: "55 km/h", C: "60 km/h", D: "65 km/h" }, correctAnswer: "C" },
    { question: "A boy walks 5 km in 1 hour. How much time to walk 20 km?", options: { A: "3 hours", B: "4 hours", C: "5 hours", D: "6 hours" }, correctAnswer: "B" },
    { question: "Speed of a train is 72 km/h. What is speed in m/s?", options: { A: "15 m/s", B: "20 m/s", C: "25 m/s", D: "30 m/s" }, correctAnswer: "B" },
    { question: "A car travels 200 km at 50 km/h and next 150 km at 75 km/h. Average speed?", options: { A: "55 km/h", B: "60 km/h", C: "65 km/h", D: "70 km/h" }, correctAnswer: "B" },
    { question: "If a man cycles at 12 km/h, how far in 45 minutes?", options: { A: "7 km", B: "8 km", C: "9 km", D: "10 km" }, correctAnswer: "C" },
    { question: "A train 200 m long crosses a bridge in 20 seconds. Bridge length?", options: { A: "200 m", B: "300 m", C: "400 m", D: "500 m" }, correctAnswer: "C" },
    { question: "Two trains 100 m and 200 m long run at 30 km/h and 60 km/h. Time to cross?", options: { A: "15 sec", B: "18 sec", C: "20 sec", D: "24 sec" }, correctAnswer: "B" },
    { question: "A car covers 360 km in 6 hours. Find its speed.", options: { A: "50 km/h", B: "55 km/h", C: "60 km/h", D: "65 km/h" }, correctAnswer: "C" },
    { question: "A train 150 m long passes a man in 15 seconds. Find its speed.", options: { A: "10 m/s", B: "15 m/s", C: "20 m/s", D: "25 m/s" }, correctAnswer: "A" },
    { question: "A man walks at 4 km/h. How far in 2.5 hours?", options: { A: "8 km", B: "9 km", C: "10 km", D: "11 km" }, correctAnswer: "C" },
    { question: "If a car travels at 80 km/h, how long to cover 200 km?", options: { A: "2 hours", B: "2.5 hours", C: "3 hours", D: "3.5 hours" }, correctAnswer: "B" },
    { question: "A boat goes 30 km upstream in 3 hours. Speed upstream is?", options: { A: "5 km/h", B: "10 km/h", C: "15 km/h", D: "20 km/h" }, correctAnswer: "B" }
  ],
  "Average": [
    { question: "Average of 10, 20, 30, 40 is", options: { A: "20", B: "25", C: "30", D: "35" }, correctAnswer: "B" },
    { question: "Find the average of first 10 natural numbers.", options: { A: "4.5", B: "5", C: "5.5", D: "6" }, correctAnswer: "C" },
    { question: "Average of 5 numbers is 20. If one number is excluded, average becomes 18. Find excluded number.", options: { A: "25", B: "28", C: "30", D: "32" }, correctAnswer: "B" },
    { question: "Average age of 30 students is 15 years. If teacher's age is included, average becomes 16. Find teacher's age.", options: { A: "45", B: "46", C: "47", D: "48" }, correctAnswer: "B" },
    { question: "Average of first 5 even numbers is", options: { A: "5", B: "6", C: "7", D: "8" }, correctAnswer: "B" },
    { question: "Average of 15, 25, 35, 45 is", options: { A: "25", B: "30", C: "35", D: "40" }, correctAnswer: "B" },
    { question: "If average of 8 numbers is 12, what is their sum?", options: { A: "90", B: "96", C: "100", D: "108" }, correctAnswer: "B" },
    { question: "Average of 100, 200, 300 is", options: { A: "150", B: "200", C: "250", D: "300" }, correctAnswer: "B" },
    { question: "Average of first 5 odd numbers is", options: { A: "3", B: "4", C: "5", D: "6" }, correctAnswer: "C" },
    { question: "If average of 5 numbers is 20 and average of other 5 numbers is 30, average of all 10 is?", options: { A: "22", B: "25", C: "28", D: "30" }, correctAnswer: "B" }
  ],
  "Simple & Compound Interest": [
    { question: "Simple interest on Rs. 1000 at 10% for 2 years is", options: { A: "Rs. 100", B: "Rs. 150", C: "Rs. 200", D: "Rs. 250" }, correctAnswer: "C" },
    { question: "Compound interest on Rs. 1000 at 10% for 2 years is approximately", options: { A: "Rs. 200", B: "Rs. 210", C: "Rs. 220", D: "Rs. 230" }, correctAnswer: "B" },
    { question: "Find SI on Rs. 5000 at 8% for 3 years.", options: { A: "Rs. 1000", B: "Rs. 1200", C: "Rs. 1400", D: "Rs. 1600" }, correctAnswer: "B" },
    { question: "Find CI on Rs. 2000 at 10% for 1 year.", options: { A: "Rs. 100", B: "Rs. 200", C: "Rs. 300", D: "Rs. 400" }, correctAnswer: "B" },
    { question: "If SI is Rs. 300 on Rs. 1000 for 3 years, find rate.", options: { A: "5%", B: "10%", C: "15%", D: "20%" }, correctAnswer: "B" },
    { question: "Find amount if P=Rs. 1000, R=10%, T=2 years (CI).", options: { A: "Rs. 1100", B: "Rs. 1200", C: "Rs. 1210", D: "Rs. 1300" }, correctAnswer: "C" },
    { question: "Find SI on Rs. 2000 at 5% for 4 years.", options: { A: "Rs. 200", B: "Rs. 300", C: "Rs. 400", D: "Rs. 500" }, correctAnswer: "C" },
    { question: "If CI is Rs. 210 on Rs. 1000 for 2 years, find rate.", options: { A: "5%", B: "10%", C: "15%", D: "20%" }, correctAnswer: "B" },
    { question: "Find amount if P=Rs. 5000, R=12%, T=3 years (SI).", options: { A: "Rs. 6000", B: "Rs. 6500", C: "Rs. 6800", D: "Rs. 7000" }, correctAnswer: "C" },
    { question: "Difference between CI and SI on Rs. 1000 at 10% for 2 years is", options: { A: "Rs. 5", B: "Rs. 10", C: "Rs. 15", D: "Rs. 20" }, correctAnswer: "B" }
  ],
  "Miscellaneous": [
    { question: "Average of 10, 20, 30, 40 is", options: { A: "20", B: "25", C: "30", D: "35" }, correctAnswer: "B" },
    { question: "Simple interest on Rs. 1000 at 10% for 2 years is", options: { A: "Rs. 100", B: "Rs. 150", C: "Rs. 200", D: "Rs. 250" }, correctAnswer: "C" },
    { question: "Compound interest on Rs. 1000 at 10% for 2 years is approximately", options: { A: "Rs. 200", B: "Rs. 210", C: "Rs. 220", D: "Rs. 230" }, correctAnswer: "B" },
    { question: "Ratio of 1 hour to 90 minutes is", options: { A: "2:3", B: "3:2", C: "1:2", D: "2:1" }, correctAnswer: "A" },
    { question: "Find the average of first 10 natural numbers.", options: { A: "4.5", B: "5", C: "5.5", D: "6" }, correctAnswer: "C" },
    { question: "If 3x = 27, find x.", options: { A: "6", B: "7", C: "8", D: "9" }, correctAnswer: "D" },
    { question: "What is 20% of 20%?", options: { A: "4%", B: "40%", C: "0.4%", D: "0.04%" }, correctAnswer: "D" },
    { question: "A bike covers 300 km in 5 hours. Speed in m/s?", options: { A: "12 m/s", B: "15 m/s", C: "16.67 m/s", D: "18 m/s" }, correctAnswer: "C" },
    { question: "Find the missing number: 2, 6, 12, 20, ?", options: { A: "28", B: "30", C: "32", D: "36" }, correctAnswer: "B" },
    { question: "If a bike costs Rs. 50000 and depreciation is 10% per year, value after 2 years?", options: { A: "Rs. 40000", B: "Rs. 40500", C: "Rs. 42000", D: "Rs. 45000" }, correctAnswer: "B" },
    { question: "What is the square of 25?", options: { A: "525", B: "600", C: "625", D: "650" }, correctAnswer: "C" },
    { question: "What is 15% of 300?", options: { A: "40", B: "45", C: "50", D: "55" }, correctAnswer: "B" },
    { question: "If x + 5 = 12, find x.", options: { A: "5", B: "6", C: "7", D: "8" }, correctAnswer: "C" },
    { question: "What is the cube of 3?", options: { A: "9", B: "18", C: "27", D: "36" }, correctAnswer: "C" },
    { question: "Find the average of 5, 10, 15, 20, 25.", options: { A: "10", B: "12", C: "15", D: "18" }, correctAnswer: "C" }
  ]
};

const ALL_BANKS: Record<string, Record<string, Question[]>> = {
  grammar: grammarQuestions,
  gk: gkQuestions,
  history: gkQuestions,
  reasoning: grammarQuestions,
  mathematics: mathQuestions,
  quiz: gkQuestions,
};

function getStaticQuestions(subject: string, topic: string, count: number): Question[] {
  const bank = ALL_BANKS[subject.toLowerCase()];
  if (!bank) return [];
  
  let questions = bank[topic] || [];
  
  if (questions.length === 0) {
    for (const key of Object.keys(bank)) {
      if (key.toLowerCase() === topic.toLowerCase()) {
        questions = bank[key];
        break;
      }
    }
  }
  
  if (questions.length === 0) {
    for (const key of Object.keys(bank)) {
      if (key.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(key.toLowerCase())) {
        questions = bank[key];
        break;
      }
    }
  }
  
  if (questions.length === 0 && Object.keys(bank).length > 0) {
    questions = bank[Object.keys(bank)[0]];
  }
  
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

async function generateWithAI(subject: string, topic: string, count: number): Promise<Question[] | null> {
  if (API_KEYS.length === 0) return null;

  for (const apiKey of API_KEYS) {
    for (const model of MODELS) {
      try {
        const prompt = `Generate ${count} multiple choice questions on ${topic} (${subject}). Each question must have exactly 4 options labeled A, B, C, D and one correct answer. Return ONLY a valid JSON array like: [{"question":"Q?","options":{"A":"opt1","B":"opt2","C":"opt3","D":"opt4"},"correctAnswer":"A"}]`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://academia-lms-nine.vercel.app",
            "X-Title": "ACADEMIA LMS",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (response.status === 429) continue;
        if (!response.ok) continue;

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) continue;

        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").replace(/```/g, "").trim();
        const startIdx = cleaned.indexOf('[');
        const endIdx = cleaned.lastIndexOf(']');
        if (startIdx === -1 || endIdx === -1) continue;

        const questions = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
        if (!Array.isArray(questions) || questions.length === 0) continue;

        return questions.map((q: any) => ({
          question: q.question || "",
          options: q.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: q.correctAnswer || q.correct_answer || q.answer || "A",
        }));
      } catch {
        continue;
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subject = (body.subject || "").toString().toLowerCase().trim();
    const topic = (body.topic || "").toString().trim();
    const questionCount = parseInt(body.questionCount) || 10;

    console.log("[Generate] Request:", { subject, topic, questionCount });

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Try AI first
    const aiQuestions = await generateWithAI(subject, topic, questionCount);
    
    if (aiQuestions && aiQuestions.length > 0) {
      console.log("[Generate] AI returned", aiQuestions.length, "questions");
      const formattedQuestions = aiQuestions.slice(0, questionCount).map((q, index) => ({
        id: `q-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        type: "mcq" as const,
      }));
      return NextResponse.json({ questions: formattedQuestions, isStatic: false });
    }

    console.log("[Generate] AI failed, using static questions");

    // Fallback to static questions
    const staticQuestions = getStaticQuestions(subject, topic, questionCount);
    
    if (staticQuestions.length === 0) {
      return NextResponse.json({ 
        error: "No questions available for this topic",
        debug: { subject, topic }
      }, { status: 404 });
    }

    console.log("[Generate] Static: Found", staticQuestions.length, "questions");

    const formattedQuestions = staticQuestions.map((q, index) => ({
      id: `q-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: "mcq" as const,
    }));

    return NextResponse.json({ questions: formattedQuestions, isStatic: true });
  } catch (err) {
    console.error("[Generate] Error:", err);
    return NextResponse.json({ 
      error: "Failed to generate questions",
      details: err instanceof Error ? err.message : "Unknown"
    }, { status: 500 });
  }
}
