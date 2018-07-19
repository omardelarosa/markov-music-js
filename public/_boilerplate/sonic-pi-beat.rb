T = 4.0

use_osc "192.168.1.7", 57121 # this synchronizes with the OSC server in the window. <-

kick_patterns = [
  (bools, 1,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0), # Kick Pattern 1 / C
  (bools, 1,0,0,0, 0,0,1,0, 0,1,1,0, 0,1,1,0) # Kick Pattern 2 / C
].ring

snare_patterns = [
  (bools, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0), # Snare Pattern 1 / G
  (bools, 0,0,0,0, 1,1,0,0, 0,0,0,0, 1,0,1,0)  # Snare Pattern 2 / G
].ring

live_loop :kicks do
  p = kick_patterns.choose
  16.times do |n|
    sample :bd_mehackit if p.tick
    osc "/blink/#{n}/#{n/2}/2" if p.look
    sleep T/16
  end
end

live_loop :snares do
  p = snare_patterns.choose
  16.times do |n|
    sample :sn_dolf if p.tick
    osc "/blink/#{n}/#{n/2}/3" if p.look
    sleep T/16
  end
end
