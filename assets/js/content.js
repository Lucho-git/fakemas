/* ==========================================================================
   CONTENT
   Everything you are likely to want to edit lives in this file.
   Leave the ids/keys alone; change the text, emoji and media freely.
   ========================================================================== */

/* Teaser details shown on the opening slide */
const EVENT = {
  name: "Fakemas Event",
  when: "📅 Friday <b>12 pm</b> 26th of November."
};

/* Part 1 — family quiz.
   Optional `media` on any question, e.g.
   { q:"…", a:"…", icon:"🎅", media:{ src:"assets/img/santa.jpg", alt:"Santa at the door" } }
   { q:"…", a:"…", media:{ src:"assets/video/peeking.mp4", caption:"The kids wing" } }
   Add `wide:true` to a video for a larger frame.                                        */
const quiz = [
  {q:"What's the earliest time were we allowed to wake up mum and dad for Christmas Day?", a:"6am", icon:"⏳"},
  {q:"How did the Ross children find out who Santa was?", a:"Tom jammed his hand through the door, to stop Santa from getting away, while we were at Uncle John's and Aunty Megan's house.", icon:"🏠🚪", long:true},
  {q:"How did mum and dad stop us from peeking during the night before Christmas?", a:"They told us if we left the kids wing of the house past 10:00, Santa might get spooked and we wouldn't get any pressies.", icon:"🚪🔒", long:true},
  {q:"Was Santa's belly real or a prosthetic?", a:"Real.", icon:"🎅"},
  {q:"Which family member makes cocktails on Christmas Day?", a:"Dad.", icon:"🍸"},
  {q:"Which family member is most likely to hoard the Christmas clothes?", a:"Tom.", icon:"🧥"},
  {q:"Who buys the Christmas clothes?", a:"Angela.", icon:"🛍️"},
  {q:"Who has missed the most family Christmases?", a:"Ella.", icon:"🗓️"},
  {q:"Who whinges the most if a family member isn't present for Christmas?", a:"Two star Tommy.", icon:"😭⭐⭐"},
  {q:"What year was Vic's first family Christmas?", a:"Don't know.", icon:"❓"},
  {q:"What was Jev and Ella's first real date?", a:"Tell Ella's side of the story.", icon:"💕"},
  {q:"Which of the Ross children is considered the heir of the family, and will be inheriting the 15 Swansea Street, East Victoria Park property?", a:"Lachlan Forest Ross, formal heir of the Ross family.", icon:"👑🏡", long:true}
];

/* Part 2 — general Christmas trivia, not family-specific.
   Same shape as `quiz`, so `media` and `long:true` work here too. */
const trivia = [
  {q:"In “The 12 Days of Christmas”, what gift arrives on the ninth day?", a:"Nine ladies dancing.", icon:"🎁💃"},
  {q:"Which country is usually credited with starting the Christmas tree tradition?", a:"Germany.", icon:"🎄"},
  {q:"What is traditionally hidden inside a Christmas pudding for luck?", a:"A small coin — a sixpence.", icon:"🪙"},
  {q:"What is the Grinch's dog called?", a:"Max.", icon:"🐕"},
  {q:"In Home Alone, which city does the family fly to when they leave Kevin behind?", a:"Paris.", icon:"✈️"},
  {q:"Frosty the Snowman had a nose made of what?", a:"A button.", icon:"⛄"},
  {q:"Which three spirits visit Ebenezer Scrooge?", a:"The Ghosts of Christmas Past, Christmas Present and Christmas Yet to Come.", icon:"👻", long:true},
  {q:"Which plant is hung up so people can kiss underneath it?", a:"Mistletoe.", icon:"🌿"},
  {q:"Which of Santa's reindeer has a name meaning “thunder” in German?", a:"Donner.", icon:"🌩️"},
  {q:"According to Buddy in Elf, what are an elf's four main food groups?", a:"Candy, candy canes, candy corn and syrup.", icon:"🍬", long:true},
  {q:"Which country sends London the giant Christmas tree for Trafalgar Square each year?", a:"Norway.", icon:"🌲"},
  {q:"“Jingle Bells” was originally written to celebrate which holiday?", a:"Thanksgiving — not Christmas!", icon:"🔔", long:true},
  {q:"What is the name of the snowman in Frozen?", a:"Olaf.", icon:"☃️"},
  {q:"Which country made fried chicken a Christmas Eve tradition?", a:"Japan.", icon:"🍗"},
  {q:"In The Polar Express, what is the name of the boy who receives the bell?", a:"He never gets one — he is only ever “Hero Boy”.", icon:"🚂", long:true},
  {q:"Which Christmas song is the best-selling single of all time?", a:"White Christmas, by Bing Crosby.", icon:"🎵", long:true}
];

/* Part 4 — riddles. `ask` is optional; `media` works the same way as the quiz. */
const riddles = [
  {lines:["Snip and loop, then loop and snip,","Round the room from tip to tip.","Each year longer, never done,","Linking Christmas, one by one."], ask:"What are we?", a:"Paper daisy chain", icon:"🔗"},
  {lines:["A flash of red up on the roof.","Then gone, and that's the proof.","He drops some items upon the ground","That won't stay long, so look around!"], ask:"What did Santa leave behind?", a:"Disappearing Candy", icon:"🍬"},
  {lines:["Take away the sleigh, the suit,","the list, and the reindeer.","What's left still keeps the","Pole standing."], ask:"Who am I?", a:"Mrs Claus", icon:"🤶"},
  {lines:["Dad's in his Santa hat, Mum's got her drink,","Nobody's dry, and nobody's in the sink.","We're up to our shoulders in festive delight.","Where are we, on Christmas Day, in the sunlight?"], ask:"", a:"Pop up pool", icon:"🦩🌊"}
];

/* Part 5 — guess the Christmas movie scene.
   `file` lives in assets/img/movies/, `title` is the answer revealed on Space. */
const movieScenes = [
  {file:"bad-santa.jpg", title:"Bad Santa"},
  {file:"home-alone.jpg", title:"Home Alone"},
  {file:"its-a-wonderful-life.jpg", title:"It's a Wonderful Life"},
  {file:"love-actually.jpg", title:"Love Actually"},
  {file:"die-hard.jpg", title:"Die Hard"},
  {file:"the-grinch.jpg", title:"The Grinch"},
  {file:"elf.jpg", title:"Elf"}
];

/* Part 6 — naughty or nice cards. v: "naughty" | "nice" */
const people = [
  {n:"Tom", v:"naughty", i:"👤"},
  {n:"Vic", v:"naughty", i:"👤"},
  {n:"Jev", v:"naughty", i:"👤"},
  {n:"Ella", v:"naughty", i:"👤"},
  {n:"Mum", v:"nice", i:"👤"},
  {n:"Dad", v:"nice", i:"👤"},
  {n:"Jack", d:"(Dog)", v:"nice", i:"🐕"},
  {n:"Thumper", d:"(Dog)", v:"nice", i:"🐾"}
];

/* ==========================================================================
   BONUS — Lach & Eleanor's trip to the Philippines
   Every caption, quip and interjection below is a placeholder: swap the text
   between the quotes for the real thing. Photos appear in list order, and
   `after` on an interjection is "insert it after photo N".
   ========================================================================== */
const trip = {
  kicker: "Bonus Round",
  title: "Lach &amp; Eleanor's<br>Trip to the Philippines",
  blurb: "No Christmas reason. No charitable purpose. We went because we could.",
  intro: [
    "This has nothing to do with Christmas.",
    "We booked it, we went, and now you have to look at it.",
    "Sit back — there are twenty-nine photos and no way to skip them.",
    "Salamat!"
  ],
  photos: [
    {src:"assets/img/trip/trip-01.jpg", caption:"Photo 01 — caption placeholder"},
    {src:"assets/img/trip/trip-02.jpg", caption:"Photo 02 — caption placeholder"},
    {src:"assets/img/trip/trip-03.jpg", caption:"Photo 03 — caption placeholder"},
    {src:"assets/img/trip/trip-04.jpg", caption:"Photo 04 — caption placeholder"},
    {src:"assets/img/trip/trip-05.jpg", caption:"Photo 05 — caption placeholder"},
    {src:"assets/img/trip/trip-06.jpg", caption:"Photo 06 — caption placeholder"},
    {src:"assets/img/trip/trip-07.jpg", caption:"Photo 07 — caption placeholder"},
    {src:"assets/img/trip/trip-08.jpg", caption:"Photo 08 — caption placeholder"},
    {src:"assets/img/trip/trip-09.jpg", caption:"Photo 09 — caption placeholder"},
    {src:"assets/img/trip/trip-10.jpg", caption:"Photo 10 — caption placeholder"},
    {src:"assets/img/trip/trip-11.jpg", caption:"Photo 11 — caption placeholder"},
    {src:"assets/img/trip/trip-12.jpg", caption:"Photo 12 — caption placeholder"},
    {src:"assets/img/trip/trip-13.jpg", caption:"Photo 13 — caption placeholder"},
    {src:"assets/img/trip/trip-14.jpg", caption:"Photo 14 — caption placeholder"},
    {src:"assets/img/trip/trip-15.jpg", caption:"Photo 15 — caption placeholder"},
    {src:"assets/img/trip/flex-01.jpg", caption:"Flex 01 — caption placeholder"},
    {src:"assets/img/trip/flex-02.jpg", caption:"Flex 02 — caption placeholder"},
    {src:"assets/img/trip/flex-03.jpg", caption:"Flex 03 — caption placeholder"},
    {src:"assets/img/trip/flex-04.jpg", caption:"Flex 04 — caption placeholder"},
    {src:"assets/img/trip/flex-05.jpg", caption:"Flex 05 — caption placeholder"},
    {src:"assets/img/trip/flex-06.jpg", caption:"Flex 06 — caption placeholder"},
    {src:"assets/img/trip/flex-07.jpg", caption:"Flex 07 — caption placeholder"},
    {src:"assets/img/trip/flex-08.jpg", caption:"Flex 08 — caption placeholder"},
    {src:"assets/img/trip/flex-09.jpg", caption:"Flex 09 — caption placeholder"},
    {src:"assets/img/trip/flex-10.jpg", caption:"Flex 10 — caption placeholder"},
    {src:"assets/img/trip/flex-11.jpg", caption:"Flex 11 — caption placeholder"},
    {src:"assets/img/trip/flex-12.jpg", caption:"Flex 12 — caption placeholder"},
    {src:"assets/img/trip/flex-13.jpg", caption:"Flex 13 — caption placeholder"},
    {src:"assets/img/trip/flex-14.jpg", caption:"Flex 14 — caption placeholder"}
  ],
  /* Random interjections — one slide each, dropped in after photo `after` */
  interjections: [
    {after:3,  by:"Lach",    text:"Interjection placeholder — the unscheduled comment about the first few days."},
    {after:8,  by:"Eleanor", text:"Interjection placeholder — the bit where Eleanor interrupts the slideshow."},
    {after:14, by:"Lach",    text:"Interjection placeholder — a completely unrelated observation about the trip."},
    {after:20, by:"Eleanor", text:"Interjection placeholder — another comment nobody asked for."},
    {after:26, by:"Lach",    text:"Interjection placeholder — final random thought before the plane home."}
  ]
};
