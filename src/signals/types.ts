export type SignalValue = string | number | boolean | null | SignalValue[] | { [key: string]: SignalValue }

export interface Signal {
  id: string
  label: string
  category: string
  value: SignalValue
  available: boolean
  reason?: string
  explanation: string
  trackerUse: string
  changesWhen: string
}

export type SignalReader = () => Promise<Signal>
