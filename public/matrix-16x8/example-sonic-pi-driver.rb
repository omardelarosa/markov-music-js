#############################################################
###                                                       ###
###              Made using SonicPi 3.1                   ###
###                                                       ###
###     by Omar Delarosa (https://omardelarosa.com)       ###
###                                                       ###
#############################################################

use_bpm 70
T = 4.0

use_osc "192.168.1.7", 57121 # this synchronizes with the OSC server in the window. <-

# State machine utility functions
define :markov do |a, h| h[a].sample; end # Chooses the next state at  random from hash
define :g do |k| get[k]; end # simplified root note in scale getter
define :s do |k, n| set k, n; end # simplified root note setter
define :mnote do |key,chain| s key, (markov (g key), chain); g key; end

# Pattern parsing
define :ringify do |p| p.gsub(' ', '') .split('').map(&:to_i).ring; end

# Melody builder
define :make_melody do |len = 16, rng = 2|
  (1..len).map{|n| ((rng*-1)..rng).to_a.sample }.ring
end

# Initialize states
set :k, 1
set :b, 0
set :s, 0
set :y, 0
set :v, 4
set :h, 0
set :l_lead, 0
set :l_hats, 0
set :l_kick, 0
set :l_snare, 0
set :l_vox, 1

# Note playing abstraction
define :pplay do |n, d = 0.1, m = 0.0, r = 0.0, syn = :fm|
  with_fx :reverb, mix: r do
    use_synth syn
    play n, release: d, sustain: 0.1
  end
end

# Scale
sc_root = :F2
sc_type = :major
sc = scale(sc_root, sc_type)

# Chords in scale -- chords are defined here.
chords = (1..7).map {|n| chord_degree n, sc_root, sc_type }.ring

# Samples
SAMPLE_PATH = '~/Dropbox/Code/Music/SonicPi/Samples/Songs/Drake/'

# Elaboration/Arrangement
elaboration_complexities = (knit, 2, 4, 3, 2, 4, 2)

# Levels
L = {
  ppiano: [0.0, 0.35].ring,
  kick: [0.0, 0.75].ring,
  snare: [0.0, 0.75].ring,
  hats: [0.0, 1.5].ring,
  vox: [0.0, 5.0].ring
}

# Levels --- This is a markov chain controlling track/instrument levels.
LV = {
  0 => [0,0,1,1],
  1 => [1,1,1,0]
}

# Tone family
TONES = [:pulse, :fm, :pretty_bell]

# Rhythm patterns -- kick drum patterns, each one is a single "state"
p1 = [
  (ringify '4000 0000 0040 0000'),
  (ringify '4020 0000 4000 0000'),
  (ringify '4023 0010 4020 0000'),
  (ringify '4030 0020 4020 1000')
]

# Kicks -- The markov chain controlling kick drum state transitions.
B = {
  0 => [0, 1, 0, 2],
  1 => [0],
  2 => [1, 0, 3],
  3 => [0]
}

# Snare drum patterns.  Each one is also a single state.
p2 = [
  (ringify '0000 4000'),
  (ringify '0100 4000'),
  (ringify '1000 4000'),
  (ringify '0100 4100'),
  (ringify '0001 3001')
]

# Snares - markov chain (but really just a hash representation of transitions)
S = {
  0 => [0, 0, 0, 0, 1, 2, 3],
  1 => [0, 0, 1],
  2 => [1, 0, 4, 3],
  3 => [0],
  4 => [0]
}

# Chords -- chord transitions
K = {
  1 => [7],
  2 => [1],
  7 => [2, 5],
  5 => [1, 6],
  6 => [2],
  2 => [5]
}

melodies = (1..4).map{|n| make_melody(16,2)}.ring

# Melodies
Y = {
  0 => [1],
  1 => [0, 1, 2],
  2 => [1, 2],
  3 => [1]
}

# Vox
V = {
  0 => [0,0,1],
  1 => [1,1,2],
  2 => [2,2,3],
  3 => [3,3,4],
  4 => [4,4,0]
}

# Hats
hats_durations = [
  (knit, T/16, 4),
  (knit, T/24, 6),
  (knit, T/16, 4),
  (knit, T/24, 6),
  (knit, T/16, 4),
  (knit, T/64, 8)
].ring

H = {
  0 => [1],
  1 => [2],
  2 => [3],
  3 => [4],
  4 => [5],
  5 => [0],
}

define :pchord do |chr, d = T|
  with_fx :level, amp: 0.3 do
    ##| pplay chr[0], d, 0.8
    ##| pplay chr[1] + 24, d, 0.4
    ##| pplay chr[2], d, 0.8
    ##| pplay chr[3] + 12, d, 0.4
  end
end

live_loop :vox do
  s = mnote :v, V
  # Control vocal levels
  lv = mnote :l_vox, LV
  l = L[:vox][lv]
  with_fx :level, amp: l do
    with_fx :reverb, mix: 0.5 do
      sample SAMPLE_PATH, s
    end
  end
  sleep (T/1) * 2
end

live_loop :ppiano do
  chr = chords[mnote :k, K]
  pchord chr # Chord (left hand)
  complexity = elaboration_complexities.tick
  sleep T/(2**complexity)
  lv = mnote :l_lead, LV
  l = L[:ppiano][lv]
  t = TONES.sample
  melody = mnote :y, Y
  with_fx :echo, mix: 0.8 do
    (3*(complexity-1)-1).times do
      with_fx :level, amp: l do
        i = melodies[melody].tick
        pplay sc[i] + 24, (T/complexity-1), nil, nil, t
        16.times do |n|
          # This controls the visualization synced to the lead.
          osc "/blink/#{(8 + i) % 8}/#{n}/0" if l > 0.0
        end
        sleep T/(2**complexity)
      end
    end
  end
  
  chr2 = chords[mnote :k, K]
  pchord chr2, T/4 # Chord
  with_fx :echo, mix: 0.8 do
    (1*(complexity-1)).times do
      with_fx :level, amp: l do
        i = melodies[melody].tick
        pplay sc[i] + 24, (T/complexity-1), nil, nil, t # Melody (right hand)
        16.times do |n|
          osc "/blink/#{(8 + i) % 8}/#{n}/0" if l > 0.0
        end
        sleep T/(2**complexity)
      end
    end
  end
end


live_loop :kick do
  p = p1[mnote :b, B]
  lv = mnote :l_kick, LV
  l = L[:kick][lv]
  c = 0
  density (p.length / 2) do
    with_fx :level, amp: l do
      sample :bd_fat, amp: 3.5 if p.tick >= 1
      8.times do |n|
        osc "/blink/#{n}/#{c}/1" if p.look >= 1 && l > 0.0
      end
      c+=1
      sleep 1
    end
  end
end

live_loop :hats do
  p = hats_durations[mnote :h, H]
  lv = mnote :l_hats, LV
  l = L[:hats][lv]
  c = 0
  density (p.length) do
    with_fx :level, amp: l do
      sample :elec_tick, amp: 1.5, decay: 0.1
      8.times do |n|
        osc "/blink/#{n}/#{c}/2" if l > 0.0
      end
      c+=1
      sleep 1
    end
  end
end

# This controls the snares.
live_loop :snare do
  # This mnote call fetches a pattern from the snare states.
  p = p2[mnote :s, S]
  # This mnote call fetches the level from the levels state for snare track.
  lv = mnote :l_snare, LV
  l = L[:snare][lv]
  c = 0
  density (p.length / 2) do
    with_fx :level, amp: l do
      sample :sn_dolf if p.tick >= 1
      16.times do |n|
        osc "/blink/#{n}/#{c}/3" if p.look >= 1 && l > 0.0
      end
      c+=1
      sleep 1
    end
  end
end