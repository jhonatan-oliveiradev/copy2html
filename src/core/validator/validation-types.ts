export type ValidationSeverity = 'valid' | 'warning' | 'blocked'

export type ValidationIssue = {
  code: string
  message: string
  severity: Exclude<ValidationSeverity, 'valid'>
}

export type ValidationResult = {
  severity: ValidationSeverity
  issues: ValidationIssue[]
}
