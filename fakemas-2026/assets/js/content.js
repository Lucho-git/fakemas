/* ==========================================================================
   CONTENT
   Everything you are likely to want to edit lives in this file.
   Leave the ids/keys alone; change the text, emoji and media freely.
   ========================================================================== */

/* Scoreboard — who is playing. Open it with the 🏆 button or the S key.
   Tallies are saved in this browser, so they survive a reload. */
const players = ["Tom", "Vic", "Jev", "Ella", "Mum", "Dad"];

/* Music.
   `playlist` is the background music for the whole deck: the songs play in a shuffled
   order and none repeats until every one has had a turn. `slideshow` plays instead
   during the Philippines photos and pop quiz. `title` is what the ♪ menu shows.

   A track can say where it is on Spotify, on YouTube, or both:
     spotify: "TRACK_ID"   streamed through Spotify's own player. The ID is the part after
                           "/track/" in the song's share link. Plays whole songs only in a
                           browser that is signed in to Spotify; otherwise 30-second samples.
     youtube: "VIDEO_ID"   streamed through YouTube's own player. The ID is the part after
                           "watch?v=" in the video's address.
     file: "assets/audio/…mp3"   an audio file in this project.
   `source` is which service to use for songs that are on both ("spotify" or "youtube");
   the ♪ menu can switch, and remembers the choice on that browser. The player sits in a
   small dock on screen. The generated stand-in at the bottom of each list only plays
   when nothing above it can (no internet).                                             */
const music = {
  source: "spotify",
  playlist: [
    {title: "A Nonsense Christmas — Sabrina Carpenter",   spotify: "73ye7F9Ub51dQ3CrnCHFhr", youtube: "s_eCNuHS6kk"},
    {title: "Mistletoe — Justin Bieber",                  spotify: "7xapw9Oy21WpfEcib2ErSA", youtube: "LUjn3RpkcKY"},
    {title: "Merry Christmas, Happy Holidays — *NSYNC",   spotify: "4v9WbaxW8HdjqfUiWYWsII", youtube: "wKj92352UAE"},
    {title: "take me home (4 christmas) — Olivia Rodrigo", spotify: "4UjYZS6Jbt3lee27qmiNOu", youtube: "uXymCnWk9LI"},
    {title: "Jingle Bells (synth stand-in)",              file: "assets/audio/jingle.mp3"}
  ],
  slideshow: [
    {title: "Bebot — The Black Eyed Peas",                spotify: "4nZwaKTdxczLpUHfLVAozA", youtube: "wESgcExetso"},
    {title: "Slideshow loop (synth stand-in)",            file: "assets/audio/trip.mp3"}
  ]
};

/* Sound effects: short clips in assets/audio/sfx/, each with a name.
   Any question can play them with `sound`:
     sound: {reveal: "grumble"}              plays as the answer is revealed
     sound: {enter: "howl", reveal: "bark"}  `enter` starts when the slide arrives and
                                             stops at the reveal
   The music dips while a clip plays, and muting the music (M) silences these too. */
const sfx = {
  grumble: "assets/audio/sfx/grumble.mp3",
  howl:    "assets/audio/sfx/wolf-howl.mp3",
  bark:    "assets/audio/sfx/dog-bark.mp3"
};

/* Part 1 — family quiz.
   Optional `media` on any question, e.g.
   { q:"…", a:"…", icon:"🎅", media:{ src:"assets/img/santa.jpg", alt:"Santa at the door" } }
   { q:"…", a:"…", media:{ src:"assets/video/peeking.mp4", caption:"The kids wing" } }
   Add `wide:true` to a video for a larger frame.

   `options` + `correct` make a question multiple choice (leave `correct` off and no
   option is marked right — handy when the answer is an argument).

   `fx` swaps the emoji for photos that arrive, old-PowerPoint style, with the answer:
     photos   one or more pictures, each "path" or { src, alt }
     effect   "spin" (default), "bounce", "fly", "swivel", "creep" or "ambush"
              (ambush: photo 1 arrives calm, `intruder` pops out on it, then it
              flips to photo 2 and shakes)
     shape    "portrait" for tall rounded frames instead of circles
     shadow   true draws a hooded mystery figure instead of a photo
     stars    gold stars that pop in afterwards; `outOf` adds empty ones up to a total
     quote    a line in quotation marks above the stars
     caption  a line of small print underneath

   `faces` is a row of round photos on show with the question, before any reveal.

   `choices` instead of an answer makes it a vote: a row of named photos, lettered
   A, B, C…, and clicking one crowns it.

   An entry with `intermission` (its heading) and a `video` is not a question: it is a
   slide where the clip plays by itself, silently, on a loop. It is left out of the
   question numbering.                                                                  */
const quiz = [
  {q:"What's the earliest we were allowed to wake Mum and Dad on Christmas Day?", a:"6 am.", icon:"⏳",
   options:["4:30 am", "6 am", "6:15 am", "8 am"], correct:"6 am"},
  {q:"How did the Ross children find out who Santa was?", a:"Tom jammed his hand in the door to stop Santa getting away, while we were at Uncle John and Aunty Megan's house.", icon:"🏠🚪", long:true},
  {q:"What was the rooftop Santa's belly made from?", a:"All natural, baby.", icon:"🎅",
   options:["A special prosthetic Santa-suit belly", "Stuffed with cushions", "All natural, baby"], correct:"All natural, baby"},
  {q:"Who makes the most cocktails on Christmas Day?", a:"Dad.", icon:"🍸",
   options:["Mum", "Dad", "Tom", "Vic"], correct:"Dad",
   fx:{photos:[{src:"assets/img/people/dad.jpg", alt:"Dad"}], effect:"fly"}},
  {q:"Who buys the Christmas clothes?", a:"Angela.", icon:"🛍️",
   fx:{photos:[{src:"assets/img/people/angela.jpg", alt:"Angela"}], effect:"swivel"}},
  {q:"Who has missed the most family Christmases?", a:"Ella.", icon:"🗓️",
   fx:{photos:[{src:"assets/img/people/ella.jpg", alt:"Ella"}], effect:"bounce"}},
  {q:"Which family would Ella rather spend Christmas with?", a:"Over to you, Ella.", icon:"🚤",
   options:["The Ross family", "The Ellis family <i>(they have a wakesurfing boat)</i>"]},
  {intermission:"Intermission",
   video:{src:"assets/video/wakesurf.mp4", poster:"assets/video/wakesurf-poster.jpg"}},
  {q:"Who whinges the most if a family member isn't present for Christmas?", a:"Two star Tommy.", icon:"😭⭐⭐",
   sound:{reveal:"grumble"},
   fx:{photos:[{src:"assets/img/two-star-tommy.jpg", alt:"Tom"}], effect:"spin", stars:2, outOf:5, quote:"Waaa waaa waaa"}},
  {q:"What year was Vic's first family Christmas?", a:"2017.", icon:"❓",
   fx:{shadow:true, effect:"creep", caption:"Scared of being put into ChatGPT"}},
  {q:"What was Jev and Ella's first real date?", a:"Ella's side of the story wins.", icon:"",
   faces:[{src:"assets/img/people/jev.jpg", alt:"Jev"}, {src:"assets/img/people/ella-date.jpg", alt:"Ella"}],
   options:["Going to Jev's Christmas party with his friends, then going off on their own",
            "Hanging out in a tree and talking for ages"],
   correct:"Hanging out in a tree and talking for ages"},
  {q:"Which animal would make Jev wig out the most if Ella gave him one for Christmas?", a:"A ferret.", icon:"😱",
   options:["Puppy", "Ferret", "Bird", "Snake"], correct:"Ferret",
   fx:{effect:"ambush",
       photos:[{src:"assets/img/people/jev-calm.jpg", alt:"Jev, relaxed with a mug"},
               {src:"assets/img/people/jev.jpg", alt:"Jev, wide-eyed"}],
       intruder:{src:"assets/img/ferret.jpg", alt:"A ferret"}}},
  // A vote rather than a question: no right answer. Click a photo to crown the room's pick.
  {q:"Style Selection: who wore it best?",
   choices:[{name:"Lach",    src:"assets/img/people/sunnies-lach.jpg"},
            {name:"Eleanor", src:"assets/img/people/sunnies-eleanor.jpg"},
            {name:"Ella",    src:"assets/img/people/sunnies-ella.jpg"}]},
  {q:"Which of the Ross children is the rightful heir to the family estate at 15 Swansea Street, East Victoria Park?", a:"Lachlan Forest Ross, formal heir of the Ross family.", icon:"👑🏡", long:true,
   fx:{photos:[{src:"assets/img/people/lach-regal-1.jpg", alt:"Lach in a fur-collared cloak"},
               {src:"assets/img/people/lach-regal-3.jpg", alt:"Lach holding an eagle aloft"},
               {src:"assets/img/people/lach-regal-2.jpg", alt:"Lach gazing into the distance"}],
       effect:"spin", shape:"portrait"}}
];

/* Part 2 — general Christmas trivia, not family-specific.
   Same shape as `quiz`, so `media` and `long:true` work here too.
   For multiple choice, add `options` and `correct` to any question (in any part):
   options:["Sweden", "Canada", "Germany", "Norway"], correct:"Norway"
   `correct` must be spelt exactly as its option; it turns green on reveal. */
const trivia = [
  {q:"In “The 12 Days of Christmas”, what gift arrives on the ninth day?", a:"Nine ladies dancing.", icon:"🎁💃",
   options:["Nine drummers drumming", "Nine ladies dancing", "Nine lords a-leaping", "Nine pipers piping"], correct:"Nine ladies dancing"},
  {q:"Which country is usually credited with starting the Christmas tree tradition?", a:"Germany.", icon:"🎄"},
  {q:"Frosty the Snowman had a nose made of what?", a:"A button.", icon:"⛄"},
  {q:"Which three spirits visit Ebenezer Scrooge?", a:"The Ghosts of Christmas Past, Christmas Present and Christmas Yet to Come.", icon:"👻", long:true},
  {q:"Which plant is hung up so people can kiss underneath it?", a:"Mistletoe.", icon:"🌿"},
  {q:"Which of Santa's reindeer has a name meaning “thunder” in German?", a:"Donner.", icon:"🌩️",
   options:["Blitzen", "Comet", "Donner", "Dasher"], correct:"Donner"},
  {q:"And which of Santa's reindeer is this?", a:"Jack — the hardest-working reindeer in the family.", icon:"", long:true,
   photo:{src:"assets/img/people/jack-reindeer.jpg", alt:"A dog in a reindeer costume"},
   options:["Prancer", "Vixen", "Jack", "Blitzen"], correct:"Jack"},
  {q:"“Jingle Bells” is said to have been written for which holiday?", a:"Thanksgiving — not Christmas!", icon:"🔔", long:true,
   options:["Thanksgiving", "Easter", "New Year's Eve", "Halloween"], correct:"Thanksgiving"},
  {q:"What is the name of the snowman in Frozen?", a:"Olaf.", icon:"☃️"},
  {q:"Which country made fried chicken a Christmas Eve tradition?", a:"Japan.", icon:"🍗",
   options:["South Korea", "Japan", "The Philippines", "The USA"], correct:"Japan"},
  {q:"Which Christmas song is the best-selling single of all time?", a:"White Christmas, by Bing Crosby.", icon:"🎵", long:true,
   options:["All I Want for Christmas Is You", "Last Christmas", "White Christmas", "Do They Know It's Christmas?"], correct:"White Christmas"}
];

/* Part 4 — riddles. `ask` is optional; `media` works the same way as the quiz. */
const riddles = [
  {lines:["Snip and loop, then loop and snip,","Round the room from tip to tip.","Each year longer, never done,","Linking Christmas, one by one."], ask:"What are we?", a:"Paper daisy chain", icon:"🔗"},
  {lines:["A flash of red up on the roof.","Then gone, and that's the proof.","He drops some items upon the ground","That won't stay long, so look around!"], ask:"What did Santa leave behind?", a:"Disappearing Candy", icon:"🍬"},
  {lines:["Take away the sleigh, the suit,","the list, and the reindeer.","What's left still keeps the","Pole standing."], ask:"Who am I?", a:"Mrs Claus", icon:"🤶"},
  {lines:["Dad's in his Santa hat, Mum's got her drink,","Nobody's dry, and nobody's in the sink.","We're up to our shoulders in festive delight.","Where are we, on Christmas Day, in the sunlight?"], ask:"", a:"Pop up pool", icon:"🦩🌊"}
];

/* Part 5 — guess the Christmas movie scene, then one question about that film.
   `file` lives in assets/img/movies/, `title` is the answer revealed on Space.
   `q`, `a` and `icon` make the follow-up question on the next slide, so nobody
   sees the film's name or its question until the scene has been guessed.
   Leave `q` off a scene to skip its question. `options`/`correct` work here too.
   `cover` is the film's poster, which spins in as a DVD case when the title is revealed.
   These are shown straight from Wikipedia rather than copied into the project, so they
   need internet; without it (or without a `cover`) the case shows the title instead. */
const WIKI = "https://upload.wikimedia.org/wikipedia/";
const movieScenes = [
  {file:"bad-santa.jpg", title:"Bad Santa", cover:WIKI + "en/c/cc/Bad_Santa_film.jpg",
   q:"Why does Willie really take the job as a mall Santa?", a:"To rob the mall.", icon:"💰",
   options:["To hide from the police", "To rob the mall", "To win back his ex-wife", "To pay off a bet"], correct:"To rob the mall"},
  {file:"home-alone.jpg", title:"Home Alone", cover:WIKI + "en/7/76/Home_alone_poster.jpg",
   q:"Which city does the family fly to when they leave Kevin behind?", a:"Paris.", icon:"✈️",
   options:["London", "New York", "Paris", "Rome"], correct:"Paris"},
  {file:"its-a-wonderful-life.jpg", title:"It's a Wonderful Life", cover:WIKI + "commons/thumb/2/25/It%27s_a_Wonderful_Life_%281946_poster%29.jpeg/500px-It%27s_a_Wonderful_Life_%281946_poster%29.jpeg",
   q:"According to Zuzu, what happens every time a bell rings?", a:"An angel gets his wings.", icon:"🔔👼"},
  {file:"love-actually.jpg", title:"Love Actually", cover:WIKI + "en/e/eb/Love_Actually_movie.jpg",
   q:"Which actor plays the Prime Minister?", a:"Hugh Grant.", icon:"🕺",
   options:["Colin Firth", "Liam Neeson", "Alan Rickman", "Hugh Grant"], correct:"Hugh Grant"},
  {file:"die-hard.jpg", title:"Die Hard", cover:WIKI + "en/c/ca/Die_Hard_%281988_film%29_poster.jpg",
   q:"Die Hard takes place at an office party on which night?", a:"Christmas Eve.", icon:"🎄💥",
   options:["Christmas Eve", "New Year's Eve", "Halloween", "Thanksgiving"], correct:"Christmas Eve"},
  {file:"the-grinch.jpg", title:"The Grinch", cover:WIKI + "en/e/e7/How_the_Grinch_Stole_Christmas_film_poster.jpg",
   q:"What is the Grinch's dog called?", a:"Max.", icon:"🐕",
   options:["Rex", "Scout", "Max"], correct:"Max"},
  {file:"elf.jpg", title:"Elf", cover:WIKI + "en/d/df/Elf_movie.jpg",
   q:"According to Buddy, what are an elf's four main food groups?", a:"Candy, candy canes, candy corn and syrup.", icon:"🍬", long:true,
   options:["Cookies, cocoa, candy canes and cake", "Candy, candy canes, candy corn and syrup",
            "Sugar, spaghetti, sprinkles and syrup", "Gingerbread, eggnog, fudge and frosting"],
   correct:"Candy, candy canes, candy corn and syrup"}
];

/* Surprise round — do you know your birds? (runs after the movie round)
   `poster` is the photo on the round's title slide.
   `opener` is an ordinary question with its `photo` on show from the start.
   `match` is the drag-and-drop game: every bird gets a letter in the order listed
   here (A, B, C…), the photos are dealt out shuffled, and players drag each photo
   onto its name. Space marks them and puts every photo where it belongs. */
const birds = {
  title: "Do You Know<br>Your Birds?",
  ribbon: "Surprise Birdwatching Enthusiast Questionnaire",
  poster: {src: "assets/img/people/dad-poster.jpg", alt: "Dad"},
  opener: {
    q: "What kind of bird is this?", a: "A Black Currawong.", icon: "",
    photo: {src: "assets/img/birds/black-currawong.jpg", alt: "A black bird with a yellow eye on a railing"}
  },
  match: [
    {name: "Banded Stilt",              src: "assets/img/birds/banded-stilt.jpg"},
    {name: "Sacred Kingfisher",         src: "assets/img/birds/sacred-kingfisher.jpg"},
    {name: "Pied Oystercatcher",        src: "assets/img/birds/pied-oystercatcher.jpg"},
    {name: "Australian Shelduck",       src: "assets/img/birds/australian-shelduck.jpg"},
    {name: "Mangrove Honeyeater",       src: "assets/img/birds/mangrove-honeyeater.jpg"},
    {name: "Red-capped Parrot",         src: "assets/img/birds/red-capped-parrot.jpg"},
    {name: "Red-tailed Black Cockatoo", src: "assets/img/birds/red-tailed-black-cockatoo.jpg"}
  ]
};

/* Part 6 — Santa's Code Words. One clue, one board of 16 words per round.
   `words` is the board in reading order, four across.
   `hits` are the words that match the clue — spelt exactly as they are in `words`.
   The number shown beside the clue is just how many `hits` there are.
   `why` is the one-line explanation shown once every answer has been found.
   `codePoster` is the photo on the round's title slide.                        */
const codePoster = {src: "assets/img/people/ella-reading.jpg", alt: "Ella reading"};
const codeWords = [
  {
    clue: "Stocking",
    hits: ["COAL", "SHELF", "LEG"],
    why: "<b>Coal</b> in a naughty one · worn on a <b>leg</b> · stocking a <b>shelf</b>",
    words: [
      "TINSEL", "PIANO", "COAL", "GRAVY",
      "SLEIGH", "CAMEL", "GLOVE", "SHELF",
      "PRAWN", "WREATH", "PUDDING", "BEACH",
      "LEG", "CANDLE", "SNORKEL", "HOLLY"
    ]
  },
  {
    clue: "Dasher",
    hits: ["COMET", "VIXEN", "CUPID", "DANCER"],
    why: "Dasher's fellow reindeer: <b>Comet</b>, <b>Vixen</b>, <b>Cupid</b> and <b>Dancer</b>",
    words: [
      "BALLET", "FOX", "COMET", "IGLOO",
      "MOOSE", "VIXEN", "ARROW", "PAVLOVA",
      "PLANET", "SURFBOARD", "CUPID", "MITTEN",
      "DANCER", "CACTUS", "ELF", "LANTERN"
    ]
  },
  {
    clue: "Cracker",
    hits: ["CHEESE", "NUT", "FIRE", "JOKE", "CROWN"],
    why: "A <b>joke</b> and a paper <b>crown</b> inside one · <b>cheese</b> and crackers · <b>nut</b>cracker · <b>fire</b>cracker",
    words: [
      "KING", "SNOWMAN", "CHEESE", "WINE",
      "NUT", "GUITAR", "MISTLETOE", "FIRE",
      "SQUIRREL", "JOKE", "KOALA", "ANGEL",
      "ESKY", "MOUSE", "BAUBLE", "CROWN"
    ]
  }
];

/* Part 7 — naughty or nice cards. v: "naughty" | "nice"
   They are dealt in this order, four to a row, so mix the verdicts up.
   `why` is the reason, which appears on the card when it is stamped, and `tag` is the
   small print in brackets under it. Leave both off for a card with no reason.
   `photo` (a square picture, centred on the face) spins into the silhouette when the
   card is stamped; without one the silhouette stays. */
const people = [
  {n:"Tom", v:"naughty", i:"👤", photo:"assets/img/cards/tom.jpg",
   why:"Looting the family home after our waterbomb party", tag:"drunken thief"},
  {n:"Mum", v:"nice", i:"👤", photo:"assets/img/cards/mum.jpg", why:"Getting her D***H*** boss fired"},
  {n:"Jev", v:"naughty", i:"👤", photo:"assets/img/cards/jev.jpg",
   why:"Being a morning person", tag:"wake-up time: 3 am"},
  {n:"Jack", d:"(Dog)", v:"nice", i:"🐕", photo:"assets/img/cards/jack.jpg", why:"Being a cutie pie"},
  {n:"Dad", v:"nice", i:"👤", photo:"assets/img/cards/dad.jpg", why:"Taking care of his lawn"},
  {n:"Ella", v:"naughty", i:"👤", photo:"assets/img/cards/ella.jpg",
   why:"Sleeping on long car rides", tag:"passenger princess"},
  {n:"Thumper", d:"(Dog)", v:"nice", i:"🐾", photo:"assets/img/cards/thumper.jpg", why:"Passing puppy school"},
  {n:"Vic", v:"naughty", i:"👤", photo:"assets/img/cards/vic.jpg",
   why:"Being too strict on a pub crawl", tag:"teacher energy"}
];

/* The Nice List gifts (they follow the naughty or nice cards).
   `parents`: a photo beside a ticket. `dogs`: one main photo with smaller ones around it. */
const gifts = {
  parents: {
    photo: {src: "assets/img/gifts/wine.jpg", alt: "Lach holding up a bottle of sparkling wine at the dinner table"},
    icon: "🍾",
    title: "A Bottle of Bubbly",
    line: "From us &mdash; to make up for Tom and Ella always stealing from the drinks cabinet."
  },
  dogs: {
    main: {src: "assets/img/dogs/jack-and-thumper.jpg", alt: "Jack and Thumper on the beach"},
    more: [
      {src: "assets/img/dogs/thumper-puppy-school.jpg", alt: "Thumper with his puppy school certificate"},
      {src: "assets/img/dogs/thumper-fetch.jpg",        alt: "Thumper running with a ball"},
      {src: "assets/img/dogs/thumper-swim.jpg",         alt: "Thumper in the surf"},
      {src: "assets/img/dogs/thumper-surf.jpg",         alt: "Thumper riding a surfboard"}
    ],
    line: "A Christmas stash of their favourite treats!"
  }
};

/* ==========================================================================
   BONUS — who is Santa?, then Lach & Eleanor's trip to the Philippines
   `reveal` is the opening question: Santa and Mrs Claus stand in shadow and
   `photo` fades in when the answer is revealed.
   `credit` is the "brought to you by" slide that follows; the slideshow music
   (see `music` at the top of this file) starts there and plays through the photos.
   Then one slide per photo, in the order listed: the "Lach Flexing" set first,
   then the rest. Each photo arrives with its own entrance while the last two slide
   aside, and the deck moves on by itself every `autoplay` seconds until the last
   photo, where it waits (0 turns that off; P pauses). To caption a photo, add `caption` to its line:
   {src:"assets/img/trip/flex-01.jpg", caption:"Day one"}
   `outro` is written on the last photo. `stop` is the photo and wording that halt
   the slideshow, and `popQuiz` is the question on the slide after it (same shape
   as any other question; its `media` shows with the answer).
   ========================================================================== */
const trip = {
  reveal: {
    question: "What are Santa Claus and Mrs Claus's real identities?",
    answer: "Lachie and Eleanor!",
    photo: "assets/img/trip/trip-01.jpg"
  },
  credit: {lead: "This quiz was brought to you by", names: "Lach &amp; Eleanor"},
  outro: {title: "Fakemas", line: "brought to you by Lach &amp; Eleanor"},
  autoplay: 5,
  stop: {
    src: "assets/img/stop-sign.jpg", alt: "Lach holding up a stop sign",
    title: "Stop right there!",
    line: "Let's see if you were paying attention.",
    kicker: "Pop quiz — worth triple points"
  },
  popQuiz: {
    q: "How many dogs were in the photo with Lachie on the beach?",
    a: "3 dogs — 2 puppies and Lach, because he's got that dawg in him.",
    icon: "", long: true,
    sound: {enter: "howl", reveal: "bark"},
    media: {src: "assets/img/trip/flex-07.jpg", alt: "Lach kneeling on the beach with two puppies"}
  },
  photos: [
    {src:"assets/img/trip/flex-01.jpg"},
    {src:"assets/img/trip/flex-02.jpg"},
    {src:"assets/img/trip/flex-03.jpg"},
    {src:"assets/img/trip/flex-04.jpg"},
    {src:"assets/img/trip/flex-05.jpg"},
    {src:"assets/img/trip/flex-06.jpg"},
    {src:"assets/img/trip/flex-07.jpg"},
    {src:"assets/img/trip/flex-08.jpg"},
    {src:"assets/img/trip/flex-09.jpg"},
    {src:"assets/img/trip/flex-10.jpg"},
    {src:"assets/img/trip/flex-11.jpg"},
    {src:"assets/img/trip/flex-12.jpg"},
    {src:"assets/img/trip/flex-13.jpg"},
    {src:"assets/img/trip/flex-14.jpg"},
    {src:"assets/img/trip/trip-01.jpg"},
    {src:"assets/img/trip/trip-06.jpg"},
    {src:"assets/img/trip/trip-07.jpg"},
    {src:"assets/img/trip/trip-03.jpg"},
    {src:"assets/img/trip/trip-04.jpg"},
    {src:"assets/img/trip/trip-05.jpg"},
    {src:"assets/img/trip/trip-08.jpg"},
    {src:"assets/img/trip/trip-02.jpg"},
    {src:"assets/img/trip/trip-09.jpg"},
    {src:"assets/img/trip/trip-10.jpg"},
    {src:"assets/img/trip/trip-11.jpg"},
    {src:"assets/img/trip/trip-12.jpg"},
    {src:"assets/img/trip/trip-13.jpg"},
    {src:"assets/img/trip/trip-14.jpg"},
    {src:"assets/img/trip/trip-15.jpg"}
  ]
};
