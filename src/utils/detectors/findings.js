// Every detector across the engine builds its findings through this one
// function so the shape is always exactly what the result page (and any
// future backend) expects: observed evidence, kept separate from the
// heuristic interpretation of it.

export function makeFinding({ type, severity, title, description, evidence }) {
  return {
    type,
    severity, // 'low' | 'medium' | 'high'
    title,
    description,
    evidence,
  }
}
