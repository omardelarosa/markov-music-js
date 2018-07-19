class: center, middle
iframeURL: /public/sqcr-demo/html/808.html
iframeSelector: .frame-808-1

# Making Self-Generating Hip Hop in JS

<iframe src="/blank.html" width="0" height="0" class="frame-808-1" frameborder="0"></iframe>

---

# Who Am I?

--

-   My name is **[omar delarosa](https://omardelarosa.com)**.

--

-   I'm a Lead Software Engineer at Grubhub and my team works the Front End of Grubhub, Seamless and Eat24. (We're hiring.)

--

-   I'm also a musician in my spare time.

---

class: center, middle

# What is Music?

---

class: center, middle

## Organized Sound Waves

<img src="https://images.vexels.com/media/users/3/145868/isolated/preview/395e11dc92884b535d825403bc12cb04-sound-wave-sharp-by-vexels.png" width=400 />

---

class: center, middle

### One Way To Do Music Randomly...

---

class: center, middle
iframeURL: /public/sqcr-demo/html/random-tones.html
iframeSelector: .random-tones-frame

### Random Tone Frequencies

<iframe class="random-tones-frame" width="100%" src="/blank.html" frameborder=0></iframe>

---

class: center, middle

### Yuck.

---

class: center, middle

## Can We Do Better?

---

class: center, middle

iframeURL: /public/sqcr-demo/html/scale-tones.html
iframeSelector: .scale-tones-frame

### Random Tones from a Scale

<iframe class="scale-tones-frame" width="100%" src="/blank.html" frameborder=0></iframe>

---

class: center, middle

### Better.

---

class: center, middle

### We can do better yet.

---

class: center, middle

### By Using _Markov Chains_

---

class: center, middle

# Markov Chain

![](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Markovkate_01.svg/220px-Markovkate_01.svg.png)

_A Markov chain is "a stochastic model describing a sequence of possible events in which the probability of each event depends only on the state attained in the previous event"_

[from Wikipedia](https://en.wikipedia.org/wiki/Markov_chain)

---

class: center, top
iframeURL: /public/sqcr-demo/html/notes-graph.html
iframeSelector: .scale-tones-graph-frame

#### Markov Chaining of Tones in a Scale

<iframe class="scale-tones-graph-frame" width="100%" height="70%" src="/blank.html" frameborder=0></iframe>

---

# Markov Chain

-   ### Like a state machine for gamblers

--

-   ### Markov models can be "generated" ML-style from a corpus text (or a MIDI file)

--

-   ### Data can be represented easily as structured data formats such as JSON

---

class: center, middle

## Scope Creep

#### (Not what this talk is about)

---

class: center, middle
iframeURL: /public/sqcr-demo/html/808.html
iframeSelector: .frame-808-geez

## What Does This Have To Do With Hip Hop?

<iframe src="/blank.html" width="0" height="0" class="frame-808-geez" frameborder="0"></iframe>

---

class: middle, center

# Rhythm, Harmony and Computation:

#### A Brief History

---

class: center, middle

# 2000 B.C. to 1980s:

### Harmony, Rhythm and Music Theory:

---

### Harmony

--

-   **tone** - a unit of sound (aka a **note**) <img src="https://i.imgur.com/Oq5SzEq.png" width=300 />

--

-   **scale** - a ranked _Set_ of pitched tones <img src="https://i.imgur.com/mu2XHAd.png" width=300 />

--

-   **melody** - a sequence of tones over time <img src="https://i.imgur.com/EJZeByT.png" width=300 />

---

### Harmony

--

-   **chord** - a group of tones played in (or close to) unison <img src="https://i.imgur.com/R1gBVQL.png" width=300 />

--

-   **progression** - a sequence of chords over time <img src="https://i.imgur.com/QRjNIda.png" width=300 />

---

### Rhythm

-   **beat** - a single unit of rhythm <img src="https://i.imgur.com/cpjlCGz.png" width=50 />

-   **measure** - a regularly spaced group of beats <img src="https://i.imgur.com/Ow5xhm0.png" width=300 />

-   **duration** - how long a tone lasts

---

### Rhythm & Durations as Fractions

-   Durations are all described as fractions of a **measure**

--

-   1/4 Note <img src="https://i.imgur.com/ChUoGvo.png" width=200 />

--

-   1/8 Note <img src="https://i.imgur.com/E5SC08v.png" width=200 />

--

-   1/16 Note <img src="https://i.imgur.com/ALcpf8n.png" width=200 />

---

### Durations as Fractions

-   Not all are multiples of 2.

--

-   Some interesting things happen when you mix up durations where the denominator of the fraction is a multiple of 3.

<img src="https://i.imgur.com/OuujOEg.png" width=300 />

--

-   This is common in hip hop beats.

---

class: middle, center

# 1980s to Now

### Rhythm and Computation

---

iframeURL: /public/sqcr-demo/html/808.html
iframeSelector: .frame-808

### Roland TR-808

#### The classic drum machine of hip hop

<iframe src="/blank.html" width="100%" height="100%" class="frame-808" frameborder="0"></iframe>

---

class: middle, center
iframeURL: /public/sqcr-demo/html/akai.html
iframeSelector: .frame-akai

### Akai MPC-2000XL

#### A classic sampler for hip hop production

<iframe src="/blank.html" width="80%" height="80%" class="frame-akai" frameborder="0"></iframe>

---

# Rhythm and Computation

#### Beat Grids

![](https://i.stack.imgur.com/DTE8c.png)

-   Centered around 1/16th note ticks

-   Can be very manual and difficult to do programmatically.

---

# Rhythm and Computation

#### Beat Grids as Code

```javascript
// 16-element arrays can represent rhythm patterns, but are tough to read.
const kicks   = [1,0,1,0,  0,0,1,0,  0,0,1,0,  0,0,1,0]; // prettier-ignore
const snares  = [0,0,0,0,  1,0,0,0,  0,0,0,0,  1,0,0,0]; // prettier-ignore
const hats    = [1,1,1,1,  1,1,1,1,  1,1,1,1,  1,1,1,1]; // prettier-ignore
const cowbell = [0,0,0,0,  0,0,0,0,  0,0,0,0,  1,0,1,0]; // prettier-ignore
```

---

# Rhythm Notation

#### Beat Grids as "Words"

```javascript
// Easier to read, CPU-trivial preprocessing
const kicks   = fmt('1010 0010 0010 0010'); // prettier-ignore
const snares  = fmt('0000 1000 0000 1000'); // prettier-ignore
const hats    = fmt('1111 1111 1111 1111'); // prettier-ignore
const cowbell = fmt('0000 0000 0000 01010'); // prettier-ignore
```

---

# Rhythm Notation

#### Beat Grids as Lists of Words (a Language?)

```javascript
// A list of patterns
const kick_patterns = [
    fmt('1010 0010 0010 0010'),
    fmt('1001 0001 0101 0010'),
    fmt('1000 0101 0100 0010'),
    fmt('1000 0010 0000 0100'),
];
```

---

## Generative Beats

#### We could make two pattern sets

```javascript
const kick_patterns = [
    fmt('1010 0010 0010 0010'),
    fmt('1001 0001 0101 0010'),
    fmt('1000 0101 0100 0010'),
    fmt('1000 0010 0000 0100'),
];

const snare_patterns = [
    fmt('0000 1000 0000 1000'),
    fmt('0010 1000 0000 1010'),
    fmt('0000 1000 0010 1000'),
];
```

---

## Generative Beats

#### And randomly combine them

```javascript
const kicks_sequence = [
    ..._.sample(kick_patterns),
    ..._.sample(kick_patterns),
    ..._.sample(kick_patterns),
    ..._.sample(kick_patterns),
];

const snare_sequence = [
    ..._.sample(snare_patterns),
    ..._.sample(snare_patterns),
    ..._.sample(snare_patterns),
    ..._.sample(snare_patterns),
];

playParallel(kicks_sequence, snare_sequence);
```

---

class: center, middle

# Or we can do better with Markov Chains

![](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Markovkate_01.svg/220px-Markovkate_01.svg.png)

---

class: center, top
iframeURL: /public/sqcr-demo/html/notes-graph.html
iframeSelector: .scale-tones-graph-frame2

#### Markov Chaining of Tones in a Scale

<iframe class="scale-tones-graph-frame2" width="100%" height="70%" src="/blank.html" frameborder=0></iframe>

---

class: center, top
iframeURL: /public/sqcr-demo/html/chords-graph.html
iframeSelector: .scale-chords-graph-frame

#### Markov Chaining of Chords in a Scale

<iframe class="scale-chords-graph-frame" width="100%" height="70%" src="/blank.html" frameborder=0></iframe>

---

class: center, top
iframeURL: /public/sqcr-demo/html/beats-graph.html
iframeSelector: .beats-graph-frame

#### Markov Chaining of Beat Durations

<iframe class="beats-graph-frame" width="100%" height="70%" src="/blank.html" frameborder=0></iframe>

---

### Simple Markov Chain Implementation

```javascript
class MarkovChain {
    constructor(obj = {}, states = [], initialState = 0) {
        this.graph = { ...obj };
        this.states = [...states];
        this.currentState = initialState;
    }

    set() {
        const newState = this.sample(this.graph[this.currentState]);
        this.currentState = newState;
    }

    next() {
        this.set();
        return this.states[this.currentState];
    }

    sample(list) {
        return list[Math.floor(list.length * Math.random())];
    }
}
```

---

## Markov Chain of Notes

-   Using an adjacency list instead of matrix (for readability, simplicity)

```javascript
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const G = {
    // Repeated notes represent higher probabilities
    '0': [1, 1, 0, 3, 4, 5, 6], // 0 -> 1 is 2/7, the rest 1/7
    '1': [0, 0, 2, 3], // 1 -> 0 is 1/2 the others 1/4
    '2': [1, 3, 4],
    '3': [4], // 3 -> 4 means state 4 always follows 3 or 1/1 probability
    '4': [5],
    '5': [5, 4, 1, 0],
    '6': [2, 2, 2, 3, 3],
};

const mc = new MarkovChain(G, NOTES);
```

---

## Markov Chain of Chords

```javascript
const CHORDS = ['C maj', 'D min', 'E min', 'F maj', 'G maj', 'A min', 'B dim'];

// Favors I <-> IV, VI -> I cadences
const G = {
    '0': [3, 3, 3, 5],
    '1': [2, 5],
    '2': [3],
    '3': [4, 4, 4, 1, 1],
    '4': [0, 0, 0, 5],
    '5': [1, 6],
    '6': [4],
};

const mc = new MarkovChain(G, CHORDS);
```

---

## Markov Chain of Rhythm Patterns

```javascript
const M = 96; // MIDI Ticks in a measure

const HATS = [
    [M / 16, 4],
    [M / 12, 3],
    [M / 24, 6],
    [M / 32, 4],
    [M / 48, 6],
    [M / 64, 8],
];

// Favors steady 1/16 notes -- common in hip hop
const G = {
    '0': [0, 0, 0, 0, 0, 0, 1, 2, 3, 4], // 0 -> 0 has 3/5 odds
    '1': [0, 0, 0, 3],
    '2': [0, 0, 0, 3],
    '3': [2, 5],
    '4': [2, 3, 4, 1],
    '5': [3, 2, 4, 2, 2],
};
```

---

# And So...

-   Tones, Melodies Chords, Beats, Measures, etc. can be thought of as "states"

--

-   Each new "state" depends on the previous state (i.e. randomly selecting states sounds pretty bad.)

--

-   We can describe how the states relate to each other as what the weighted probabilities are of one state transitioning into another.

---

class: center, top
iframeURL: /public/sqcr-demo/html/matrix-16x8.html
iframeSelector: .matrix-16x8

### The End

<iframe class="matrix-16x8" width="560" height="315" src="/blank.html" frameborder="0"></iframe>

---

#### Links

-   [Tone.js - full features JS code library](https://tonejs.github.io/)
-   [Tonal - music haromony / scales library](https://github.com/danigb/tonal)
-   [vis.js - dataviz library](http://visjs.org/)
-   [Andrew Sorensen - "The Concert Programmer"](https://www.youtube.com/watch?v=yY1FSsUV-8c)
-   [Sam Aaron - Creator of SonicPi](https://sonic-pi.net/)
-   [sqcr - a JS sequencer server I made to run some of the code in these slides](https://github.com/omardelarosa/sqcr)
