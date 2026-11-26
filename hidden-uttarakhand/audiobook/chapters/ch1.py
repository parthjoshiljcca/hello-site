# Chapter 1 of the Hindi audiobook: who says each quoted line (by the line's opening words), and the
# sound design (music beds and effects) placed by paragraph. Parth's own lines stay in the narrator's voice.
TITLE = 'चैप्टर वन। रूम लॉक्ड, लेडी डेड, प्रोफ़ेसर हंग्री।'
DAY = 'डे वन। मसूरी।'
SKIP_FIRST = 2          # the file's "अध्याय एक" and title lines; TITLE is announced instead

SPEAKERS = {
    'बस रिलैक्स': 'shaoni', 'नो एडवेंचर': 'shaoni', 'डे ज़ीरो': 'kshitij', 'सुबह पाँच': 'kshitij',
    'नोट कर लिया': 'kshitij', 'क्षितिज।': 'shaoni', 'पेज वन। पढ़ो': 'shaoni', 'भाई, पेज वन': 'kshitij',
    'क्योंकि रिस्क': 'shaoni', 'हर रो में': 'kshitij', 'सैंतालीस रो': 'kshitij', 'और भूत?': 'narrator',
    'पार्थ। भूत का': 'shaoni', 'टैक्सी? मसूरी?': 'narrator', 'मसूरी,': 'gabbar', 'फिर?': 'gabbar',
    'फिर पूरा उत्तराखंड': 'narrator', 'आप फ़्री हो?': 'narrator', 'बसंती ने इससे': 'gabbar',
    'गब्बर सिंह नेगी': 'gabbar', 'गब्बर सिंह?': 'kshitij', 'असली नाम?': 'kshitij', 'असली नाम।': 'gabbar',
    'मेरे पापा': 'gabbar', 'हीरो का नाम': 'gabbar', 'और बसंती?': 'narrator', 'पचास साल': 'gabbar',
    'तो जब अपनी गाड़ी': 'gabbar', 'असली और नक़ली': 'kshitij', 'नक़ली कहानी': 'gabbar', 'असली कहानी': 'gabbar',
    'वो मैं किसी': 'gabbar', 'प्रोफ़ेसर साहब। सवॉय': 'gabbar', 'सौ रुपये': 'gabbar', 'इसीलिए तो': 'shaoni',
    'हिस्टॉरिक है': 'shaoni', 'दीदी,': 'kshitij', 'हिस्टॉरिक और': 'kshitij', 'घोस्ट फ़ैमिली, क्या': 'golu',
    'मैं हूँ घोस्टबस्टर': 'golu', 'और याद रखना': 'golu', 'पहुँच गए?': 'mummy', 'पहुँच गए, मम्मी': 'narrator',
    'स्वेटर पहना?': 'mummy', 'तीन।': 'narrator', 'गुड।': 'mummy', 'और पार्थ। भूत-वूत': 'mummy',
    'मम्मी,': 'narrator', 'मैं भूत के पीछे': 'narrator', 'तो किसने किया?': 'kshitij',
    'कोर्ट ने कहा': 'shaoni', 'लॉक्ड रूम': 'shaoni', 'तीन ऑप्शन। ज़ीरो': 'shaoni', 'भूत ने किया': 'gabbar',
    'या फिर,': 'rohan', 'किसी ऐसे ने': 'rohan', 'सॉरी,': 'rohan', 'पेशे की बीमारी': 'rohan',
    'और नंदा देवी?': 'narrator', 'आपने क्लाइंब': 'narrator', 'नंदा देवी पर अब': 'rohan',
    'सैंक्चुअरी सालों': 'rohan', 'बढ़िया। मेरे पास': 'rohan', 'सवॉय का मज़ा': 'rohan', 'वो आदमी,': 'gabbar',
    'पहाड़ की बात': 'gabbar', 'एनडी-65': 'rohan', 'ग्लेशियर पिघल': 'rohan', 'और गीत?': 'bhalla',
    'आख़िरी हिस्सा': 'bhalla', 'मलेथा वाला': 'rohan', 'सब बता देते': 'rohan', 'भल्ला,': 'rohan',
    'भूत नहीं है': 'rohan', 'घोस्ट फ़ैमिली,': 'golu', 'वो देखो': 'golu', 'तुमने सपना': 'shaoni',
    'हेवी डिनर': 'shaoni', 'मैं प्रोफ़ेसर हूँ,': 'narrator', 'मैं सपने में': 'narrator', 'भाई,': 'kshitij',
    'आपका कमेंट': 'kshitij', 'मिस्टर सहगल?': 'narrator', 'चेक आउट कर': 'waiter', 'पार्थ,': 'shaoni',
    'चोर होता': 'shaoni', 'और उसको पता': 'shaoni', 'पार्थ।': 'shaoni', 'गब्बर भैया।': 'shaoni',
    'ये गीत,': 'gabbar', 'ये मेरी नानी': 'gabbar', 'प्रोफ़ेसर साहब,': 'gabbar',
}
# whole paragraphs in a character's voice (no quotes): Rohan's note, and Kshitij reading his diary
VOICED = {'प्रोफ़ेसर पार्थ। रूम 112': 'rohan', 'आप मेरी नोटबुक रखिए': 'rohan', 'फिर मिलेंगे। — आर.': 'rohan'}
DIARY_FROM = 'क्षितिज की डायरी से'      # this paragraph is announced, everything after it is Kshitij reading
SONG = ['जहाँ पानी के बदले', 'वहाँ से पहला पाठ', 'जहाँ पत्थर ने', 'वहाँ नंदा की आँख', 'नंदा की गरम शिला', 'जिसने छुई']

# sound design: (paragraph opening words, what) — beds run until the next bed or a scene break
CUES = [
    ('इस सफ़र का पहला झूठ', 'bed:airport'),
    ('इस सफ़र का पहला झूठ', 'sfx:chime'),
    ('देहरादून एयरपोर्ट पर', 'bed:outdoor'),
    ('देहरादून एयरपोर्ट पर', 'sfx:plane'),
    ('उसने मुझे एक लंबे', 'sfx:bonnet'),
    ('"असली नाम।" गब्बर ने डिक्की', 'sfx:boot'),
    ('मसूरी की सड़क', 'bed:drive'),
    ('मसूरी की सड़क', 'sfx:carstart'),
    ('फिर वह मुस्कुराया', 'sfx:horn'),
    ('सवॉय, माल रोड', 'bed:lobby'),
    ('सवॉय, माल रोड', 'sfx:cardoor'),
    ('"घोस्ट फ़ैमिली, क्या हाल है!"', 'sfx:golu'),
    ('मेरा फ़ोन बजा', 'sfx:phonering'),
    ('"गुड।" एक पल', 'sfx:cooker'),
    ('वह इस सफ़र का दूसरा झूठ', 'sfx:sting_light'),
    ('डिनर पर मैंने', 'bed:dining'),
    ('1911 में', 'bed:mystery'),
    ('मैं मुड़ा।', 'sfx:sting'),
    ('सवॉय के डाइनिंग रूम के एक कोने में', 'sfx:flute'),
    ('रात 2:14 बजे', 'bed:night'),
    ('मैं चाहूँगा कि आपसे कहूँ', 'sfx:creak'),
    ('कॉरिडोर धुँधली', 'sfx:steps_slow'),
    ('रोहन बोल रहा था', 'bed:tension'),
    ('सीधे…', 'sfx:crash'),
    ('दोनों आदमी…', 'sfx:sting'),
    ('मैं भागा!', 'sfx:run'),
    ('मोड़ पर, मेरे चेहरे', 'sfx:flash'),
    ('भल्ला, चौंधियाया हुआ', 'sfx:thud'),
    ('"घोस्ट फ़ैमिली," उसके पीछे', 'sfx:whoosh'),
    ('एक बंद दरवाज़ा', 'sfx:door'),
    ('"तुमने सपना देखा,"', 'bed:breakfast'),
    ('हम अपने बैग लेने', 'bed:suspense'),
    ('रूम 112 की…', 'sfx:sting'),
    ('मैंने अपना बैग जाँचा', 'sfx:zip'),
    ('मैंने उसे…', 'sfx:page'),
    ('भाप।', 'sfx:sting'),
    ('जहाँ पानी के बदले', 'sfx:flute'),
    ('गब्बर गाड़ी की चाबियाँ', 'sfx:keys'),
    ('स्याही ताज़ा थी', 'sfx:sting'),
    ('नीचे, काले शीशों', 'sfx:suv'),
    ('क्षितिज की डायरी से', 'bed:diary'),
]
