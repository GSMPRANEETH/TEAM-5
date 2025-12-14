# Frontend Components Documentation

## Overview

This frontend application implements a modern, accessible UI for the AI Speech Personality Analysis system using React, TypeScript, and Tailwind CSS following atomic design principles.

## Architecture

### Component Structure

```
src/components/
├── atoms/          # Basic building blocks
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── LoadingSpinner.tsx
│   └── ConfidenceScore.tsx
├── molecules/      # Combinations of atoms
│   ├── AgentCard.tsx
│   └── ProgressBar.tsx
└── organisms/      # Complex feature components
    ├── AudioRecorderEnhanced.tsx
    └── ResultsPanel.tsx
```

## Component Usage

### Atoms

#### Button
A flexible button component with multiple variants and sizes.

```tsx
import Button from './components/atoms/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost'
// Sizes: 'sm' | 'md' | 'lg'
// Loading state: <Button loading={true}>Loading...</Button>
```

#### Badge
Status indicators with color-coded variants.

```tsx
import Badge from './components/atoms/Badge';

<Badge variant="success" size="md">Complete</Badge>

// Variants: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
// Sizes: 'sm' | 'md'
```

#### ConfidenceScore
Visual representation of confidence scores with progress bars.

```tsx
import ConfidenceScore from './components/atoms/ConfidenceScore';

<ConfidenceScore 
  score={0.85}  // or 85 for percentage
  label="High Confidence"
  showBar={true}
  size="lg"
/>
```

#### LoadingSpinner
Animated loading indicator.

```tsx
import LoadingSpinner from './components/atoms/LoadingSpinner';

<LoadingSpinner size="md" />
// Sizes: 'sm' | 'md' | 'lg'
```

### Molecules

#### AgentCard
Display individual agent status and results.

```tsx
import AgentCard from './components/molecules/AgentCard';

<AgentCard 
  agent={{
    id: '1',
    name: 'Communication Agent',
    status: 'active',
    specialization: 'Analyzing speech patterns',
    progress: 75,
    timestamp: '2:30 PM'
  }}
  onClick={() => console.log('Agent clicked')}
/>

// Status: 'pending' | 'active' | 'complete' | 'error'
```

#### ProgressBar
Multi-stage progress visualization.

```tsx
import ProgressBar from './components/molecules/ProgressBar';

<ProgressBar 
  stages={[
    { label: 'Recording', status: 'complete' },
    { label: 'Preprocessing', status: 'active' },
    { label: 'Analyzing', status: 'pending' },
  ]}
/>
```

### Organisms

#### AudioRecorderEnhanced
Complete audio recording interface with progress tracking.

```tsx
import AudioRecorderEnhanced from './components/organisms/AudioRecorderEnhanced';

<AudioRecorderEnhanced 
  onResult={(result) => {
    console.log('Analysis complete:', result);
  }}
/>
```

Features:
- Microphone permission handling
- Real-time duration tracking
- Multi-stage progress visualization
- Error handling and display
- Helpful tips and guidance

#### ResultsPanel
Interactive results display with collapsible sections.

```tsx
import ResultsPanel from './components/organisms/ResultsPanel';

<ResultsPanel 
  data={{
    transcript: '...',
    confidence_score: 0.92,
    confidence_label: 'High',
    final_report: '...',
    speech_metrics: {...},
    agent_results: {...}
  }}
/>
```

Features:
- Accordion-based sections using Radix UI
- Confidence score visualization
- Speech metrics grid
- Agent results display
- Download and share actions

## State Management

### UIContext
Global UI state management for dark mode and sidebar.

```tsx
import { useUI } from './hooks/useUI';

function MyComponent() {
  const { darkMode, toggleDarkMode } = useUI();
  
  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

## Styling

### Tailwind CSS
The application uses Tailwind CSS with a custom theme.

#### Color Palette
- **Primary (Teal)**: Agent actions, CTAs
  - `bg-primary-600`, `text-primary-600`
- **Accent (Purple)**: AI-generated content highlights
  - `bg-accent-500`, `text-accent-500`
- **Success (Green)**: Completed states
  - `bg-green-600`, `text-green-600`
- **Warning (Amber)**: Attention needed
  - `bg-amber-600`, `text-amber-600`
- **Error (Red)**: Failures, errors
  - `bg-red-600`, `text-red-600`

### Dark Mode
Dark mode is automatically detected from system preferences and can be toggled manually. It persists across sessions using localStorage.

```tsx
// Classes automatically adapt in dark mode
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-gray-100">Content</p>
</div>
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Semantic HTML structure
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Color contrast >= 4.5:1
- ✅ Screen reader friendly

### Keyboard Navigation
- `Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons
- `Escape` - Close modals (when implemented)

## Responsive Design

The UI is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

```tsx
// Responsive classes example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Content */}
</div>
```

## Performance

- ✅ Code splitting with lazy loading ready
- ✅ Optimized bundle size
- ✅ React.memo for expensive components
- ✅ Debounced inputs (where applicable)
- ✅ Virtual scrolling ready (for long lists)

## Development

### Running the App
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Adding New Components

Follow the atomic design pattern:

1. **Atoms**: Single-purpose, reusable elements
2. **Molecules**: Combinations of atoms
3. **Organisms**: Complex components with business logic
4. **Templates**: Page layouts (to be added)
5. **Pages**: Complete pages (to be added)

### Component Template

```tsx
export interface MyComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
}

export default function MyComponent({ 
  title, 
  onAction, 
  className = '' 
}: MyComponentProps) {
  return (
    <div className={`base-styles ${className}`}>
      <h3>{title}</h3>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
}
```

## Future Enhancements

Planned improvements:
- [ ] React Router for navigation
- [ ] More agent visualization components
- [ ] Real-time WebSocket updates
- [ ] Export/share functionality
- [ ] User preferences panel
- [ ] Analytics dashboard
- [ ] A/B testing UI variants

## Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TypeScript](https://www.typescriptlang.org/)
