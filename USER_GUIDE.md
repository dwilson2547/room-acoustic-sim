# Room Acoustics Simulator - User Guide

## What You'll See

### Main Interface Layout

The application has a three-panel layout:

```
┌────────────────────────────────────────────────────────────────┐
│                         HEADER BAR                              │
│                  Room Acoustics Simulator                       │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────┬─────────────────────┐
│             │                          │                     │
│   CONTROLS  │    3D VISUALIZATION      │   CHARTS & RESULTS  │
│             │                          │                     │
│  - Room     │   [Interactive 3D room   │  - Frequency        │
│    dims     │    with speaker and      │    Response         │
│  - Speaker  │    listener models]      │  - Energy Decay     │
│    position │                          │  - Metrics          │
│  - Listener │   Rotate: Click + drag   │  - Heatmap (when    │
│    position │   Zoom: Scroll           │    generated)       │
│  - Material │   Pan: Right-click+drag  │                     │
│             │                          │                     │
│  [Simulate] │                          │                     │
│  [Heatmap]  │                          │                     │
└─────────────┴──────────────────────────┴─────────────────────┘
```

## Step-by-Step Workflow

### 1. Set Up Your Room

**Room Dimensions (meters)**
- Width (X): 5.0m (default)
- Depth (Y): 4.0m (default)
- Height (Z): 3.0m (default)

Think about the room you want to simulate:
- Small bedroom: 3m x 3m x 2.5m
- Living room: 5m x 4m x 3m
- Home theater: 7m x 5m x 3m
- Studio: 6m x 5m x 2.8m

### 2. Position Your Speaker

**Speaker Position (meters)**
- Default: [1.0, 1.0, 1.5]
- This is X, Y, Z coordinates from room corner

Typical speaker placement:
- Front wall, slightly off-center
- Height: 1.0-1.5m (ear level when seated)
- Away from corners (unless you want bass boost)

Examples:
- Center front wall: [2.5, 0.5, 1.2] for 5m wide room
- Corner: [0.5, 0.5, 1.0] (expect bass resonance)
- Against side wall: [0.3, 2.0, 1.2]

### 3. Position Your Listener

**Listener Position (meters)**
- Default: [3.0, 2.0, 1.2]
- Height of 1.2m = seated ear level

Typical listening positions:
- Sweet spot: ~2.5-3m from speakers
- Against back wall: Not ideal (reflections)
- Room center: Can have null issues

### 4. Choose Room Materials

**Absorption Coefficient (0-1)**
- 0.0 = Completely reflective (bare concrete, tile)
- 0.1 = Hard surfaces (painted walls, hardwood)
- 0.2 = Normal living room (some furniture, curtains)
- 0.3-0.4 = Treated room (rugs, soft furniture)
- 0.5-0.7 = Well-treated listening room
- 1.0 = Anechoic chamber (no reflections)

**Common room types:**
- Bare basement: 0.05-0.1
- Living room: 0.15-0.25
- Home theater: 0.3-0.5
- Recording studio: 0.4-0.6

### 5. Run the Simulation

Click **"Run Simulation"** to calculate:
- How the room affects different frequencies
- How long sound lingers (reverberation)
- Sound pressure level at listening position

**Wait time:** 1-2 seconds

### 6. Interpret the Results

#### Frequency Response Chart
**What it shows:** How loud each frequency is at the listener position

**What to look for:**
- **Flat line (±3dB)**: Ideal! Balanced sound
- **Peaks**: Room resonances, certain frequencies are emphasized
  - Often at low frequencies (20-200 Hz)
  - Caused by room dimensions
- **Dips/Nulls**: Cancellation, certain frequencies are weak
  - Can cause thin/hollow sound
- **Overall slope**: 
  - Rising towards bass: Boomy room
  - Falling towards bass: Thin sound

**Example readings:**
- 60 Hz: +8 dB → Strong bass resonance
- 120 Hz: -5 dB → Bass null (cancellation)
- 1000 Hz: 0 dB → Reference level
- High frequencies generally smoother

#### Energy Decay Curve
**What it shows:** How quickly sound dies out over time

**What to look for:**
- **Steep slope**: Sound dies quickly (absorptive room)
- **Gentle slope**: Long reverberation (reflective room)
- **Straight line**: Even decay across all frequencies
- **Wiggly line**: Uneven decay, flutter echoes

**Time scale:**
- First 50ms: Early reflections (clarity)
- 50-100ms: Late reflections (spaciousness)
- After 100ms: Reverberation tail

#### RT60 (Reverberation Time)
**What it is:** Time for sound to decay by 60 dB (essentially silent)

**Ideal values:**
- **< 0.2s**: Too dead, lifeless sound
- **0.3-0.4s**: Excellent for critical listening, studio monitors
- **0.4-0.6s**: Great for hi-fi listening
- **0.6-0.8s**: Normal living room
- **0.8-1.0s**: Lively, spacious (might blur detail)
- **> 1.0s**: Too reverberant, unclear sound

**What affects it:**
- Room size (bigger = longer RT60)
- Absorption (more absorption = shorter RT60)
- Surface materials

#### Direct-to-Reverberant Ratio (D/R)
**What it is:** Ratio of direct sound to reflected sound energy

**Values:**
- **+10 dB**: Mostly direct sound, very clear
- **+5 dB**: Good balance, clear with some ambience
- **0 dB**: Equal direct and reflected sound
- **-5 dB**: More reflected than direct, less clear
- **-10 dB**: Very reverberant, indistinct

**What to aim for:**
- Critical listening: +5 to +10 dB
- Living room: +3 to +7 dB
- Large room: 0 to +5 dB

**How to improve:**
- Move listener closer to speaker (more direct)
- Add absorption (reduce reflections)
- Position speaker away from walls (fewer early reflections)

#### Peak SPL
**What it is:** Maximum sound pressure level at listener

**Note:** This is a relative measurement based on the simulation. In reality, actual SPL depends on speaker power and volume setting.

**Typical values in simulation:** 85-100 dB

### 7. Generate SPL Heatmap (Optional)

Click **"Generate SPL Heatmap"** to see sound distribution across entire room

**Wait time:** 10-30 seconds (simulates 225 positions)

**What you'll see:**
- Top-down view of room
- Color map showing SPL at each position
  - Blue = Quieter areas
  - Green = Medium SPL
  - Yellow/Red = Louder areas
- White circle = Speaker position

**What to look for:**
- **Even distribution**: Good coverage
- **Hot spots (red)**: Near speaker or at resonance points
- **Dead zones (blue)**: Nulls, cancellation areas
- **Patterns**: Often symmetrical around speaker
- **Sweet spot**: Where you want even, balanced response

**Use cases:**
- Find best listening position
- Identify problem areas
- Plan room treatment
- Multiple listening position evaluation

## Practical Examples

### Example 1: Small Bedroom Setup
```
Room: 3.5m x 3.0m x 2.5m
Speaker: [0.5, 1.5, 1.0] (on desk against wall)
Listener: [2.5, 1.5, 1.2] (bed position)
Absorption: 0.25 (normal bedroom with furniture)

Expected Results:
- Strong bass peaks (small room)
- RT60 ~ 0.4-0.5s
- Some nulls in 80-150 Hz range
- D/R ratio: +4 to +6 dB
```

### Example 2: Living Room Hi-Fi
```
Room: 5.5m x 4.5m x 2.8m
Speaker: [1.0, 0.5, 1.2] (speaker stand, front wall)
Listener: [3.5, 2.25, 1.2] (couch, centered)
Absorption: 0.20 (living room with couch, curtains)

Expected Results:
- More balanced bass response
- RT60 ~ 0.5-0.7s
- Smoother frequency response above 200 Hz
- D/R ratio: +5 to +7 dB
```

### Example 3: Home Theater
```
Room: 6.0m x 4.5m x 2.7m
Speaker: [2.0, 0.4, 1.3] (near screen, off-center)
Listener: [4.0, 2.25, 1.2] (viewing position)
Absorption: 0.35 (carpet, acoustic panels, soft seating)

Expected Results:
- Controlled bass (acoustic treatment helps)
- RT60 ~ 0.4-0.5s (ideal for clarity)
- Minimal comb filtering
- D/R ratio: +6 to +8 dB
```

## Tips for Better Results

### Improving Bass Response
1. Move speaker away from corners
2. Move listener away from walls
3. Add bass traps (increase absorption)
4. Experiment with asymmetric positioning
5. Avoid speaker/listener at room fraction positions (1/2, 1/3 room length)

### Reducing Reflections
1. Add absorption to side walls (first reflection points)
2. Carpet on floor
3. Curtains or panels on rear wall
4. Bookshelf diffusion on walls
5. Avoid parallel walls (add diffusion)

### Finding Sweet Spot
1. Generate heatmap
2. Look for even green/yellow areas
3. Avoid blue spots (nulls)
4. Distance from speaker: ~1.5-2x speaker separation
5. Form equilateral triangle with stereo speakers

### Troubleshooting Common Issues

**Problem: Too much bass (boomy)**
- Solution: Increase absorption coefficient
- Move speaker away from corners
- Add bass traps in corners

**Problem: Weak bass (thin sound)**
- Solution: Might be in a null position
- Move listener 20-30cm in any direction
- Check for cancellation at specific frequencies

**Problem: Harsh/bright sound**
- Solution: Add high-frequency absorption
- Soft furnishings (curtains, upholstery)
- Diffusion on walls

**Problem: Unclear/muddy sound**
- Solution: RT60 too high
- Add more absorption
- Reduce parallel reflective surfaces

**Problem: Dead/lifeless sound**
- Solution: Too much absorption (RT60 < 0.3s)
- Remove some absorption
- Add diffusive elements
- Consider if room is too small

## Understanding the 3D View

The 3D visualization shows:
- **Room box**: Wire frame outline of room boundaries
- **Floor/ceiling**: Semi-transparent planes
- **Grid**: Helps judge distances
- **Speaker**: Black box with gray cone (front-facing)
  - Label: Red "Speaker" text
- **Listener**: Blue-green head with ears
  - Label: Cyan "Listener" text

**Interaction:**
- **Rotate view**: Click and drag
- **Zoom**: Mouse wheel
- **Pan**: Right-click and drag (or Ctrl+drag)

**Color meanings:**
- Blue lines: Room boundaries
- Red: Speaker
- Cyan: Listener
- Dark blue: Floor/ceiling

## Common Questions

**Q: Why are there peaks and dips in frequency response?**
A: These are room modes - resonances caused by sound waves bouncing between parallel walls. They're unavoidable but can be minimized.

**Q: Is a flat frequency response always best?**
A: Generally yes for accuracy, but some personal preference is okay. ±3dB variation is excellent, ±6dB is good.

**Q: What's more important: RT60 or D/R ratio?**
A: Both matter! RT60 affects overall sound character, D/R affects clarity. Aim for RT60 0.3-0.6s and D/R +5dB or higher.

**Q: My heatmap shows uneven SPL. Is that bad?**
A: Some variation is normal. What matters is the listening position has good response. 3-5 dB variation across room is typical.

**Q: Can I simulate specific speaker models?**
A: Not yet - currently uses omnidirectional point source. Real speakers have directivity patterns that affect results.

**Q: How accurate is this simulation?**
A: Good above 200 Hz. Below that, more sophisticated modeling (modal analysis) would be better. This is useful for relative comparisons and optimization.

## Next Steps

After getting familiar with the tool:
1. Measure your actual room dimensions
2. Try your current speaker/listener positions
3. Experiment with different positions
4. Note which positions give flattest frequency response
5. Generate heatmap to find best listening area
6. Consider room treatment based on results

Have fun exploring room acoustics!
