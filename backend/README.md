# CodeCRDT Backend

## Configuration

### AI Provider Configuration

The backend supports multiple AI providers. Configure using the `AI_PROVIDER` environment variable:

- **bedrock** (default) - Amazon Bedrock with Claude models
- **openai** - OpenAI GPT models
- **anthropic** - Anthropic Claude API

Set up your `.env` file based on `.env.example`:

```bash
# Choose your AI provider
AI_PROVIDER=bedrock  # Options: bedrock, openai, anthropic

# Provider-specific configuration
AWS_BEARER_TOKEN_BEDROCK=your-key # For Bedrock
OPENAI_API_KEY=your-key  # For OpenAI
ANTHROPIC_API_KEY=your-key  # For Anthropic
```

## Ideas

- Generate a beautiful user registration page
- Create Tic tac toe game
- Generate a random react page
- Generate a dashboard page
- Generate an empty page
- Generate an empty page with one TODO. Don't import motion motion in middle of JSX. Mention it in to do to import it at top.

## Productivity App Prompts

1. **"Build a gorgeous Pomodoro timer with a circular animated progress ring, glass morphism design, smooth color transitions between work/break modes, floating particles background, and satisfying completion animations with sound."**

2. **"Create a premium markdown editor with dark theme, syntax highlighting with vibrant colors, smooth live preview transitions, floating toolbar with hover effects, and code block styling like VS Code."**

3. **"Make a beautiful budget tracker with animated charts using gradients, glassmorphic cards for categories, smooth number count-up animations, expense cards that flip on hover, and a dynamic background that changes based on spending."**

4. **"Build a stunning habit tracker with neon glow checkboxes, satisfying check animations, streak fire effects for milestones, progress rings with gradient fills, and confetti animation when all daily habits are complete."**

5. **"Create an elegant password generator with a futuristic cyberpunk theme, animated strength meter with color gradients, glowing copy button, matrix-style background, and smooth character reveal animations."**

## Creative & Educational Tool Prompts

6. **"Make a beautiful drawing canvas with floating tool palette, smooth brush strokes with pressure simulation, color picker with gradient preview, ripple effects on clicks, and a sleek dark interface with neon accents."**

7. **"Build a visually striking music sequencer with pulsing LED-style buttons, waveform visualizations, glowing active steps, smooth BPM slider with real-time tempo preview, and bouncing animation on beats."**

8. **"Create a mesmerizing Mandelbrot fractal explorer with smooth infinite zoom, psychedelic color palettes that shift gradually, mini-map overlay, dreamy blur effects at edges, and cinematic pan animations."**

9. **"Make a stunning 3D molecule builder with glowing atoms, animated electron orbits, smooth camera rotation, depth of field effects, ambient lighting, and information cards that slide in with glass morphism style."**

10. **"Build a captivating algorithm visualizer with neon colored bars, smooth height transitions, glowing comparison indicators, trail effects during swaps, and a futuristic dashboard design with animated controls."**

## Game Prompts

11. **"Create a premium memory card game with 3D flip animations, holographic card backs, particle effects on matches, gradient backgrounds that shift with progress, elegant typography, and celebration animation with fireworks."**

12. **"Build a neon-style Snake game with glowing trails, pulse effects when eating food, grid that lights up as snake passes, cyberpunk color scheme, smooth turning animations, and explosive particle effects on game over."**

13. **"Make a visually stunning typing game with words that glow and pulse, letter particle explosions on correct typing, dynamic aurora background, neon text effects, streak flames for combos, and matrix-style falling code in background."**

14. **"Create an elegant color mixing puzzle with liquid-like color blending animations, satisfying merge effects, ambient floating orbs, smooth gradient transitions, glassmorphic UI panels, and rainbow particle burst on perfect match."**

15. **"Build a beautiful maze game with walls that glow when nearby, player trail with fading effect, animated torch light that follows player, fog of war effect, smooth camera follow, and golden sparkle path reveal on completion."**

16. **"Create a stylized tower defense with towers that have firing animations with muzzle flash, enemies with health bars, particle effects for projectiles, gradient path, explosion animations, and a medieval fantasy theme with glowing magical elements."**

17. **"Make a gorgeous Simon Says with buttons that emit light pulses, ripple effects on press, smooth color transitions, ambient particle field, neon glow intensifies with combo, and synth wave aesthetic with retro grid background."**

18. **"Build a modern word scramble game with letters on floating glass cards, smooth shuffle animations, hint system with letter glow effect, elegant timer with gradient fill, and satisfying snap-to-place animations when solving."**

19. **"Create a minimalist yet beautiful 2048 with tiles that smoothly slide and merge, subtle shadows and depth, number scaling animations, color gradient based on tile value, soft glow on new tiles, and elegant game over overlay."**

20. **"Make a visually impressive rhythm game with neon tracks, notes that pulse to the beat, perfect hit explosion effects, combo multiplier with fire effects, dynamic background that reacts to music, and synthwave/cyberpunk aesthetics."**
