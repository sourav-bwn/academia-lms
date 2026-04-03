import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const grammarQuestions: Record<string, any[]> = {
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
    { question: "I wish I ____ fly.", options: { A: "can", B: "could", C: "will", D: "would" }, correctAnswer: "B" }
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
    { question: "____ sun is shining brightly.", options: { A: "A", B: "An", C: "The", D: "No article" }, correctAnswer: "C" }
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
    { question: "She is good ____ mathematics.", options: { A: "at", B: "in", C: "on", D: "to" }, correctAnswer: "A" }
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
    { question: "The books on the shelf ____ mine.", options: { A: "is", B: "are", C: "was", D: "were" }, correctAnswer: "B" }
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
    { question: "She behaves as if she ____ the owner.", options: { A: "is", B: "was", C: "were", D: "are" }, correctAnswer: "C" }
  ]
};

const gkQuestions: Record<string, any[]> = {
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
    { question: "In which year did India gain independence?", options: { A: "1945", B: "1946", C: "1947", D: "1948" }, correctAnswer: "C" }
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
    { question: "Lake Chilika is located in which state?", options: { A: "West Bengal", B: "Odisha", C: "Andhra Pradesh", D: "Tamil Nadu" }, correctAnswer: "B" }
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
    { question: "What is the boiling point of water?", options: { A: "90°C", B: "100°C", C: "110°C", D: "120°C" }, correctAnswer: "B" }
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
    { question: "In tennis, what is a score of zero called?", options: { A: "Nil", B: "Zero", C: "Love", D: "Nothing" }, correctAnswer: "C" }
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
    { question: "Which city is known as the 'Pink City' of India?", options: { A: "Jaipur", B: "Udaipur", C: "Jodhpur", D: "Bikaner" }, correctAnswer: "A" }
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
    { question: "Which is the largest mammal?", options: { A: "Elephant", B: "Blue Whale", C: "Giraffe", D: "Hippopotamus" }, correctAnswer: "B" }
  ]
};

const mathQuestions: Record<string, any[]> = {
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
    { question: "Which is the largest 4-digit number?", options: { A: "9999", B: "9998", C: "10000", D: "9000" }, correctAnswer: "A" }
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
    { question: "What percent is 3 of 75?", options: { A: "3%", B: "4%", C: "5%", D: "6%" }, correctAnswer: "B" }
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
    { question: "Cost price of 15 articles equals selling price of 12 articles. Find profit %.", options: { A: "20%", B: "22%", C: "25%", D: "30%" }, correctAnswer: "C" }
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
    { question: "A worker gets Rs. 200 for 5 days work. What will he get for 20 days?", options: { A: "Rs. 600", B: "Rs. 700", C: "Rs. 800", D: "Rs. 900" }, correctAnswer: "C" }
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
    { question: "Two trains 100 m and 200 m long run at 30 km/h and 60 km/h. Time to cross?", options: { A: "15 sec", B: "18 sec", C: "20 sec", D: "24 sec" }, correctAnswer: "B" }
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
    { question: "If a bike costs Rs. 50000 and depreciation is 10% per year, value after 2 years?", options: { A: "Rs. 40000", B: "Rs. 40500", C: "Rs. 42000", D: "Rs. 45000" }, correctAnswer: "B" }
  ]
};

const ALL_BANKS: Record<string, Record<string, any[]>> = {
  grammar: grammarQuestions,
  gk: gkQuestions,
  history: gkQuestions,
  reasoning: grammarQuestions,
  mathematics: mathQuestions,
  quiz: gkQuestions,
  // Also support full names
  "general knowledge": gkQuestions,
  "grammar": grammarQuestions,
  "history": gkQuestions,
  "reasoning": grammarQuestions,
  "mathematics": mathQuestions,
  "math": mathQuestions,
  "quiz": gkQuestions,
};

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

    // Find the right bank
    let bank: Record<string, any[]> = {};
    
    // Try various subject keys
    const subjectKeys = [subject, subject + 's', subject.replace('general knowledge', 'gk')];
    for (const key of subjectKeys) {
      if (ALL_BANKS[key]) {
        bank = ALL_BANKS[key];
        break;
      }
    }
    
    // If no bank found, search all banks for the topic
    let questions: any[] = [];
    
    if (Object.keys(bank).length > 0) {
      // Direct topic match
      questions = bank[topic] || [];
      
      // Case insensitive search
      if (questions.length === 0) {
        for (const key of Object.keys(bank)) {
          if (key.toLowerCase() === topic.toLowerCase()) {
            questions = bank[key];
            break;
          }
        }
      }
      
      // Partial match
      if (questions.length === 0) {
        for (const key of Object.keys(bank)) {
          if (key.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(key.toLowerCase())) {
            questions = bank[key];
            break;
          }
        }
      }
      
      // Fallback to first available topic
      if (questions.length === 0 && Object.keys(bank).length > 0) {
        const firstKey = Object.keys(bank)[0];
        questions = bank[firstKey];
      }
    }

    // Last resort - get from any bank
    if (questions.length === 0) {
      for (const b of Object.values(ALL_BANKS)) {
        const keys = Object.keys(b);
        if (keys.length > 0) {
          questions = b[keys[0]];
          break;
        }
      }
    }

    console.log("[Generate] Found:", questions.length, "questions for", topic);

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: "No questions available",
        debug: { subject, topic }
      }, { status: 404 });
    }

    // Shuffle and return requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);

    const formattedQuestions = selected.map((q, index) => ({
      id: `q-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: "mcq" as const,
    }));

    console.log("[Generate] Returning", formattedQuestions.length, "questions");

    return NextResponse.json({ questions: formattedQuestions, isStatic: true });
  } catch (err) {
    console.error("[Generate] Error:", err);
    return NextResponse.json({ 
      error: "Failed to generate questions",
      details: err instanceof Error ? err.message : "Unknown"
    }, { status: 500 });
  }
}

    // Try to find questions
    let questions: any[] = [];
    
    // Direct lookup
    if (ALL_BANKS[subject as keyof typeof ALL_BANKS]) {
      const bank = ALL_BANKS[subject as keyof typeof ALL_BANKS];
      questions = bank[topic] || [];
    }

    // If not found, try case-insensitive
    if (questions.length === 0) {
      const banks = Object.values(ALL_BANKS);
      for (const bank of banks) {
        for (const key of Object.keys(bank)) {
          if (key.toLowerCase() === topic.toLowerCase()) {
            questions = bank[key];
            break;
          }
        }
        if (questions.length > 0) break;
      }
    }

    // Fallback to any matching topic
    if (questions.length === 0) {
      const banks = Object.values(ALL_BANKS);
      for (const bank of banks) {
        for (const key of Object.keys(bank)) {
          if (key.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(key.toLowerCase())) {
            questions = bank[key];
            break;
          }
        }
        if (questions.length > 0) break;
      }
    }

    console.log("[Generate] Found:", questions.length, "questions for", topic);

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: "No questions available for this topic",
        debug: { subject, topic, questionCount }
      }, { status: 404 });
    }

    // Shuffle and return requested count
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);

    const formattedQuestions = selected.map((q, index) => ({
      id: `q-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: "mcq" as const,
    }));

    console.log("[Generate] Returning", formattedQuestions.length, "questions");

    return NextResponse.json({ questions: formattedQuestions, isStatic: true });
  } catch (err) {
    console.error("[Generate] Error:", err);
    return NextResponse.json({ 
      error: "Failed to generate questions",
      details: err instanceof Error ? err.message : "Unknown"
    }, { status: 500 });
  }
}