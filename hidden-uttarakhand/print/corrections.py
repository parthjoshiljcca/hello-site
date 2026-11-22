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
    ('We left at three in the afternoon,', 'We left at nine in the morning,', 1),
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
    ('Shaoni and Kshitij are real, and appear as themselves.', 'Shaoni and Kshitij are real, and appear as themselves, under changed names.', 1),

    # Sources: drop entries left from an earlier draft, add the ones the book draws on
    (' &#183; "Haat Kalika Temple," <i>Shubh Panchang</i>.', '.', 1),
    (' &#183; <i>Epic Singing of Garhwal: The Story of Kirthipal and Kunjepal</i>, Smithsonian Folkways. &#183; "Jeet Singh Negi," Wikipedia.',
     ' &#183; <i>Jeetu Bagdwal</i>, Garhwali folk ballad of Khait Parvat (oral tradition), and its stage versions by Jeet Singh Negi and Abodh Bandhu Bahuguna.', 1),
    (' &#183; "Ramman, religious festival and ritual theatre of the Garhwal Himalayas," UNESCO Intangible Cultural Heritage.', '', 1),
    (' &#183; "Mangsir Bagwal," <i>Drishti IAS</i>.', '.', 1),
    ('"Satopanth Tal," Wikipedia. &#183; "Naukuchiatal Lake," Incredible India.',
     '"The Savoy, Mussoorie," Wikipedia. &#183; "Dhari Devi Temple," Wikipedia. &#183; "2013 North India floods," Wikipedia. '
     '&#183; "Patal Bhuvaneshwar," Wikipedia. &#183; "Abbott Mount," Wikipedia. &#183; "Myrica esculenta," Wikipedia.', 1),
    ('<h3>The Nanda Devi Raj Jat, 2026</h3>',
     '<h3>History and travel</h3>\n<p>Jim Corbett, <i>Man-Eaters of Kumaon</i> (1944). &#183; "Champawat Tiger," Wikipedia. '
     '&#183; Edwin T. Atkinson, <i>The Himalayan Gazetteer</i> (1882&#8211;86).</p>\n<h3>The Nanda Devi Raj Jat, 2026</h3>', 1),
]


def apply(text):
    for old, new, count in FIXES:
        found = text.count(old)
        if found != count:
            raise SystemExit(f'correction expected {count}x, found {found}x: {old[:70]!r}')
        text = text.replace(old, new)
    return text
