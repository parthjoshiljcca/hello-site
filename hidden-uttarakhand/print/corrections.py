# Revisions to the website text for the print edition, from the November 2026 review, as the author
# approved them one by one. Each is (old, new, count): old must occur exactly `count` times in the
# English edition, so a change on the website that moves or rewords a passage stops the build instead
# of silently skipping a fix. Straight quotes are fine: the build curls them afterwards.
D = '&#8212;'

FIXES = [
    # Parth's degrees: BCA, PGDCA, MCA, and a PhD in progress
    ('I am a professor. I have two degrees.', 'I am a professor. I have three degrees and half a PhD.', 2),
    ('My PhD viva, twice, once in the bathroom.', 'My PhD entrance interview, twice, once in the bathroom.', 1),
    ('Mere paas sirf ek laptop aur ek PhD hai.', 'Mere paas sirf ek laptop aur aadhi PhD hai.', 1),

    # Ch 3: Bachi Ram ji was 31 in 1966, so neither the song nor the stone was his grandfather's
    ('"Geet. Mere dada wala geet."', '"Geet. Meri jawaani wala geet."', 1),
    ('Mere dada ne pathar dekha tha.', 'Dronagiri ke charwahon ne pathar dekha tha.', 1),
    ('Mere dada kehte the, woh hissa Dronagiri wale charwahe jaante hain.',
     'Jinse maine seekha, woh kehte the, woh hissa Dronagiri wale charwahe jaante hain.', 1),
    # ...and Rohan was at the Savoy two days before Maletha
    ('"Do din pehle. Sehgal.', '"Kal aaya tha. Sehgal.', 1),

    # Ch 2: Rishikesh to Devprayag is the Ganga's valley; the Alaknanda begins above Devprayag
    ('turned up the Alaknanda valley towards Devprayag', 'turned up the Ganga valley towards Devprayag', 1),
    # Ch 9: Shaoni's night descent from Bhagwabasa, after her talk with Bhalla near midnight
    ('Hira bhaiya ne subah dikhaya tha. Chaar ghante.', 'Hira bhaiya ne subah dikhaya tha. Paanch ghante.', 1),

    # Ch 3 diary: Golu first says "Delhi se" in Ch 6; and there is one road to Kedarnath
    ("He told us he's from Delhi.</li>", "Where is he from? He never says.</li>", 1),
    ('There are at least three roads to Kedarnath from Mussoorie. I checked.',
     'There is more than one road in the hills. I checked. (There is one road to Kedarnath. But still.)', 1),

    # Ch 4: why Kedarnath and not Badrinath
    ('Bahi-khaate mein."</p>\n',
     'Bahi-khaate mein."</p>\n<p>"Badrinath Dronagiri ke zyada paas hai," Shaoni said.</p>\n'
     '<p>"Haan," Kshitij told her. "Par Rohan Kedarnath ja raha hai. Agar 1966 ka koi naam Kedar ki bahi mein hai, '
     'toh woh hume usse pehle dekhna hai. Badri toh Dronagiri ke raaste mein aayega hi."</p>\n', 1),

    # Ch 6: where Gabbar grew up
    ('"Mere mama ka beta. Bachpan mein hum dono ek hi cycle pe school jaate the.',
     '"Mere mama ka beta. Haldwani mein, bachpan mein hum dono ek hi cycle pe school jaate the. Baad mein yeh Joshimath aa gaya.', 1),
    # Ch 1: Gabbar is Kumaoni
    ('He told Gabbar, in fluent Garhwali,', 'He told Gabbar, in fluent Kumaoni,', 1),
    # Ch 1: Gaurav was in an engineering hostel two years ago
    ('<p>Late twenties.', '<p>Mid-twenties.', 1),

    # Ch 8: how the shepherds reached the device, and the pace of the trek
    ('"Woh pathar Roopkund mein nahi tha. Woh bahut upar tha. Bade pahad ke paas. Woh log teen din chale the barf mein.',
     '"Woh pathar Roopkund mein nahi tha. Woh bahut upar se aaya tha, bade pahad se. Barf ka pahad toota aur use neeche '
     'glacier tak le aaya. Wahan tak charwahe pahunch sakte the. Woh log teen din chale the barf mein.', 1),
    ('<p>We camped at Bhagwabasa,',
     '<p>Trekking companies sell this as a three-day walk. We did it in one, because Rohan was paying the porters double '
     'to hurry, and nobody, least of all me, wanted to be the one who asked for a rest.</p>\n<p>We camped at Bhagwabasa,', 1),
    ('the first ancient DNA ever reported from India.', 'one of the first ancient DNA studies ever published from India.', 1),

    # Day labels: Ch 8 spans two days, so Ch 9-11 move on a day and Ch 11 and 12 share an evening
    (f"From Kshitij's diary {D} Day 11, Gangolihat", f"From Kshitij's diary {D} Day 12, Gangolihat", 1),
    (f"From Kshitij's diary {D} Day 10, Chitai", f"From Kshitij's diary {D} Day 11, Chitai", 1),
    (f"From Kshitij's diary {D} Day 9, Ija", f"From Kshitij's diary {D} Day 10, Ija", 1),
    (f"From Kshitij's diary {D} Day 8, Wan", f"From Kshitij's diary {D} Days 8&#8211;9, Wan", 1),
    ('three more pages, to Day 10, Chitai', 'three more pages, to Day 11, Chitai', 1),
    ('<span class="day">Day 11</span><span class="place">Gangolihat', '<span class="day">Day 12</span><span class="place">Gangolihat', 1),
    ('<span class="day">Day 10</span><span class="place">Chitai', '<span class="day">Day 11</span><span class="place">Chitai', 1),
    ('<span class="day">Day 9</span><span class="place">Ija', '<span class="day">Day 10</span><span class="place">Ija', 1),
    ('<span class="day">Day 8</span><span class="place">Wan', '<span class="day">Days 8&#8211;9</span><span class="place">Wan', 1),

    # Ch 10: the scene "when he was fourteen" is never told
    ('Remember what he told me when he was fourteen.',
     'Once, when he was twelve and the diary was new, I asked him why he wrote everything down.', 1),

    # Ch 11-12: Mahesh already knew about Gangolihat, so Rohan's men were waiting
    ('Ija ke gaon ka bataya. Aur aaj&#8230;"', 'Ija ke gaon ka bataya. Kal raat Gangolihat ka bhi bata diya. Aur aaj&#8230;"', 1),
    ('<em>main Gangolihat mein hoon, aake dekh le.</em>"',
     '<em>main Gangolihat mein hoon, aake dekh le.</em> Woh log toh pehle se wahin baithe the."', 1),
    ('Today Gabbar bhaiya told Mahesh "Gangolihat" himself, by accident, in anger.',
     "Last night Gabbar bhaiya told Mahesh we were going to Gangolihat. R.'s men were already waiting when we came out "
     'of the cave. Today he said it again himself, in anger.', 1),
    # Ch 12: the headcount
    ('Here is what four men, one diary-less', 'Here is what two grown men, one diary-less', 1),

    # Ch 13: Deepak gave the cap to Gaurav before the expedition
    ('a cheerful boy in a blue cap.', 'a cheerful boy with frost in his eyebrows and nothing on his head.', 1),

    # Ch 14: from Champawat to Munsiyari is 7-9 hours, so they leave in the morning and still arrive after dark
    # (Ch 13 runs to the 2:16 p.m. comment, so they leave at noon, read it on the road, and reach the
    # trailhead after dark, five hours behind Rohan; Bhaguli Amma's goodnight moves to midnight)
    ('We left at three in the afternoon,', "We left at noon, the moment Gaurav's video went up,", 1),
    ("At nine o'clock exactly, Bhaguli Amma stood up", 'At midnight exactly, Bhaguli Amma stood up', 1),
    # Ch 14: Jeetu Bagdwal and Khait Parvat
    ('a young man of Garhwal who played the flute more beautifully than anyone had ever played. One day he went up into '
     'the high meadows and played, alone.',
     'a young shepherd of Tehri Garhwal who played the flute more beautifully than anyone had ever played. One day, on '
     'his way to fetch his sister home, he crossed the slopes of Khait Parvat, the mountain the old people still call '
     '<em>pariyon ka desh</em>, the country of the fairies. And there, alone, he played.', 1),

    # Prologue: by the fire, not at dinner; and no drop cap on the time
    ('what the old woman said at dinner.', 'what the old woman said by the fire.', 1),
    ('<p class="first"><strong>3:12 a.m. Khaliya', '<p class="after"><strong>3:12 a.m. Khaliya', 1),
    ('<p>The fire has gone down to orange.', '<p class="first">The fire has gone down to orange.', 1),

    # Ch 15 diary: Rohan took the old diary
    ('<li>End of the old diary. End of the new one, almost.', '<li>The old diary is in a police evidence bag now. End of the new one, almost.', 1),

    # Epilogue: it runs to the Raj Jat of August 2027
    ('Six Months Later', 'Ten Months Later', 3),

    # Author's Note: no spoiler, and the friends' names are changed
    ('Deepak and Gaurav Rawat, Bachi Ram ji, Kamla Devi, Dhana ji, Hira, and every',
     'Bachi Ram ji, Kamla Devi, Dhana ji, Hira, the porters and their families, and every', 1),
    ('Shaoni and Kshitij are real, and appear as themselves.', 'Shaoni and Kshitij are real, and appear in these pages under changed names.', 1),

    # Sources: drop entries left from an earlier draft, add the ones the book draws on
    (' &#183; "Haat Kalika Temple," <i>Shubh Panchang</i>.', '', 1),
    (' &#183; <i>Epic Singing of Garhwal: The Story of Kirthipal and Kunjepal</i>, Smithsonian Folkways. &#183; "Jeet Singh Negi," Wikipedia.',
     ' &#183; <i>Jeetu Bagdwal</i>, Garhwali folk ballad of Khait Parvat (oral tradition), and its stage versions by Jeet Singh Negi and Abodh Bandhu Bahuguna.', 1),
    (' &#183; "Ramman, religious festival and ritual theatre of the Garhwal Himalayas," UNESCO Intangible Cultural Heritage.', '', 1),
    (' &#183; "Mangsir Bagwal," <i>Drishti IAS</i>.', '', 1),
    ('"Satopanth Tal," Wikipedia. &#183; "Naukuchiatal Lake," Incredible India.',
     '"The Savoy, Mussoorie," Wikipedia. &#183; "Dhari Devi Temple," Wikipedia. &#183; "2013 North India floods," Wikipedia. '
     '&#183; "Patal Bhuvaneshwar," Wikipedia. &#183; "Abbott Mount," Wikipedia. &#183; "Myrica esculenta," Wikipedia.', 1),
    ('<h3>The Nanda Devi Raj Jat, 2026</h3>',
     '<h3>History and travel</h3>\n<p>Jim Corbett, <i>Man-Eaters of Kumaon</i> (1944). &#183; "Champawat Tiger," Wikipedia. '
     '&#183; Edwin T. Atkinson, <i>The Himalayan Gazetteer</i> (1882&#8211;86).</p>\n<h3>The Nanda Devi Raj Jat, 2026</h3>', 1),
]


# The final review's minor nit and its optional polish: fewer repeated tics, leaner diary recaps,
# short English glosses after the longest Hinglish speeches, and some friction before the police act.
POLISH = [
    # Ch 9: Shaoni leaves about 1 a.m. and knocks at 5:20
    ('Hira bhaiya ne subah dikhaya tha. Paanch ghante.', 'Hira bhaiya ne subah dikhaya tha. Saade chaar ghante.', 1),

    # tics: "I'm a professor" (20), "reader" (26), "folded my hands" (12); the callbacks stay
    ('because I am a professor and cannot stop asking questions.', 'because I cannot stop asking questions.', 1),
    ('<p>Reader, I am a professor. I have a laptop, three degrees of anxiety', '<p>I have a laptop, three degrees of anxiety', 1),
    ("thought of that. I'm the professor. As a boy in Haridwar,", 'thought of that. As a boy in Haridwar,', 1),
    ("<p>I'm a professor. I could give you three medical explanations", '<p>I could give you three medical explanations', 1),
    ("<p>I'm a professor. I know what limestone does", '<p>I know what limestone does', 1),
    ('As we passed the confluence, I folded my hands.', 'As we passed the confluence, I bowed my head.', 1),
    ('Then I folded my hands and meant every word.', 'Then I bowed to the bells and meant every word.', 1),
    ('<p>Reader, I would like the record to show', '<p>I would like the record to show', 1),
    ('<p>Reader, I would like to describe the next ninety seconds', '<p>I would like to describe the next ninety seconds', 1),
    ("<p>I've had a lot of students, reader. I know", "<p>I've had a lot of students. I know", 1),
    ('<p>Reader, I have taught for twelve years.', '<p>I have taught for twelve years.', 1),
    ("about courage, reader. That is the best", 'about courage. That is the best', 1),
    ("(reader, I want you to know I'm not proud of this)", "(I'm not proud of this)", 1),
    ("I'll be honest with you, reader. I've tried", "I'll be honest with you. I've tried", 1),
    ("It's not glamorous, reader. It's two hundred lines", "It's not glamorous. It's two hundred lines", 1),

    # diary recaps: keep the clues and the brother, drop what the chapter has just told
    ('<li>Jagar: the jagariya sings, the dangariya receives. Golu Devta (a stone instead of a baby, a wooden horse, the god '
     'of justice). Gangnath (a prince killed for love, a ghost who became a god).</li>\n', '', 1),
    ('<li>Patal Bhuvaneshwar: 33 koti gods, King Rituparna, four doors of the four ages, a passage to Kailash. No phones.',
     '<li>Patal Bhuvaneshwar. No phones.', 1),
    ('<li>Abbott Mount legend: a doctor who could see who would die; the "Mukti Kothri". Real history = unclear. Legend = scary.</li>\n', '', 1),
    ('<li>Airi: eyes on top of his head. Palanquin, 2 dogs, bells, Aanchhari + Chaanchhari, backwards-footed spirits. See him = die.',
     '<li>Airi: see him = die.', 1),
    ("<li>Champawat tigress: hundreds of people killed; Jim Corbett shot her in 1907. Gabbar bhaiya's great-grandfather",
     "<li>Champawat tigress: Gabbar bhaiya's great-grandfather", 1),
    ('<li>Devidhura Bagwal: stones for a goddess who agreed to take less than she asked for.</li>\n', '', 1),
    ("<li>Aanchharis: spirits of the high meadows; some say girls who died young and unmarried. They love beauty, music, red. Don't go alone,",
     "<li>Aanchharis: don't go alone,", 1),
    ("<li>Roopkund: 2019 DNA, 3 groups, roughly 1,000 years apart. 14 people from the eastern Mediterranean, died around 1800. "
     "Nobody knows why. The legend says the goddess's hailstorm.",
     '<li>Roopkund: three groups of dead, a thousand years apart. Nobody knows why.', 1),

    # English glosses for readers without Hindi, in the narrator's voice, after the longest speeches
    ('raste se utar jaata hai."</p>\n',
     'raste se utar jaata hai."</p>\n<p>Big and old, he meant. It can wear an animal\'s shape or a man\'s, and it calls '
     'in a shepherd\'s voice, so the traveller thinks a friend is close by and follows the voice off the road.</p>\n', 1),
    ('<p>I have never once in my life seen Shaoni ask',
     '<p>What that man was looking for, she told him, could poison not just his village but the whole Ganga. We were trying '
     'to stop him. He would not have to be afraid. Would he sing the song for us, just once?</p>\n'
     '<p>I have never once in my life seen Shaoni ask', 1),
    ('aur neeche, aur neeche.</em>"</p>\n',
     'aur neeche, aur neeche.</em>"</p>\n<p>A team had come, he said, English and Indian, looking for a box that would be '
     'warm and must not be touched. They searched for days and found nothing. One night in camp he heard a sahib say the '
     'snow might have swallowed it: a warm thing keeps melting its way down, and down.</p>\n', 1),
    ('Saal bhar baad bhi garam."</p>\n',
     'Saal bhar baad bhi garam."</p>\n<p>The next year, on Nanda Kot, they had left another. When they went back for it, it '
     'had melted itself a cave in the snow, and it was still warm a year later.</p>\n', 1),
    ('Ki saboot hai ek purana gaana?"</p>\n',
     'Ki saboot hai ek purana gaana?"</p>\n<p>He respected me, he said. I was a professor. But think: what would he tell the '
     'SP? That a professor had taken a trekking company owner\'s notebook and now said the man was hunting CIA plutonium, '
     'and the evidence was an old song?</p>\n', 1),
    ('saab khud aa rahe hain."</p>\n',
     'saab khud aa rahe hain."</p>\n<p>They were paying very well, he said. The season was over, and nobody went up in '
     'this snow. But these people wanted to, for some kind of survey. They were meant to leave that morning; then they '
     'had told him to wait, because the boss was coming himself.</p>\n', 1),
    ('Roopkund ke paas ruk gaye the. Bas."</p>\n',
     'Roopkund ke paas ruk gaye the. Bas."</p>\n<p>The stone was never at Roopkund, his grandfather had said. It had come '
     'down from far higher, from the big mountain, when the snow broke away and carried it to a glacier the shepherds '
     'could reach. They walked three days in the snow. On the way back they stopped near Roopkund for a night. That was '
     'all.</p>\n', 1),
    ('Aur tum gaayab the."</p>\n',
     'Aur tum gaayab the."</p>\n<p>Day one: Golu in the corridor with his camera on before the spoons fell. Day two: '
     'the @ND65 comment on his live stream. Day five: his car coming up the road with the same red mud. Day six: an old '
     'woman calling him Gaurav, and Golu running, and Rohan knowing where we had been that same night. Day seven: his '
     'drone flying straight to Rohan\'s camp. Day nine: Golu at the jagar, and by morning Rohan knew where we were, and '
     'Golu was gone.</p>\n', 1),
    ('Isse becha toh Nanda ki aankh khul jaayegi.</em>"</p>\n',
     'Isse becha toh Nanda ki aankh khul jaayegi.</em>"</p>\n<p>A twisted piece of iron, she meant. Burning hot when her '
     'father-in-law lifted it out of the snow, and cold ever since. He wrapped it in cloth, kept it in a wooden box and let '
     'no one touch it. It belonged to Nanda, he used to say. Sell it, and the goddess would open her eyes.</p>\n', 1),
    ('<p>She started threading marigolds again.</p>',
     '<p>Two years ago, she said, a porter had come: polite, clever, quick on snow, fond of old songs. His grandfather '
     'used to sing this one. He asked where the warm stone was, and she told him to ask his grandfather first. He laughed '
     'and said he\'d come back next month, after an expedition.</p>\n<p>She started threading marigolds again.</p>', 1),
    ('Aur sab hanste hain."</p>\n',
     'Aur sab hanste hain."</p>\n<p>The police had called it grief, he said: a voice note, an old song, a rich man\'s '
     'company. So he had thought it through. Nobody listens to a village boy. Nobody listens to an engineer. But a silly '
     'YouTuber who hunts ghosts? Nobody takes him seriously, and he can go anywhere, at any hour, camera in hand, and '
     'everyone just laughs.</p>\n', 1),
    ('Ab toh phal bhi phenkte hain, pathar ke saath."</p>\n',
     'Ab toh phal bhi phenkte hain, pathar ke saath."</p>\n<p>A battle of stones, he meant, at the temple of Barahi '
     'Devi: four clans hurling stones at each other from behind wooden shields. Once, the story goes, the goddess wanted '
     'a human life every year. When it was the turn of an old woman\'s only grandson, she begged, and the goddess agreed to '
     'take one man\'s worth of blood instead of one man\'s life. These days they throw fruit too.</p>\n', 1),

    # the police after the climax: not two easy hours
    ('<p>The man with the stars watched for a long time. Then he picked up his phone.</p>\n<p>By ten, the lookout notice for '
     '"three tourists" had been withdrawn. By eleven, a team was on its way to Munsiyari. At 11:20, my phone rang.',
     '<p>The man with the stars watched for a long time. Then he asked questions, for an hour. Who had the notebook first. '
     'Why we hadn\'t come straight to the police. Whether a script could be wrong. (It could. It wasn\'t. He made me show '
     'him.) He called Dehradun twice, and the second time he argued with someone who did not want the owner of a '
     'respectable company arrested on the word of a YouTuber and a professor already on the news.</p>\n'
     '<p>Then he picked up his phone a third time.</p>\n<p>By eleven, the lookout notice for "three tourists" had been '
     'withdrawn. By half past, a team was on its way to Munsiyari. At 11:40, my phone rang.', 1),
]


def apply(text):
    for old, new, count in FIXES + POLISH:
        found = text.count(old)
        if found != count:
            raise SystemExit(f'correction expected {count}x, found {found}x: {old[:70]!r}')
        text = text.replace(old, new)
    return text
