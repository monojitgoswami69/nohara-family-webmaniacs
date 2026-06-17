export interface Task {
  id: string;
  text: string;
  addedAt: number;
  lifespanDays: number; // whole seconds elapsed during typing
  typingSeconds: number; // raw seconds, same as lifespanDays
  permanent: boolean;
}
