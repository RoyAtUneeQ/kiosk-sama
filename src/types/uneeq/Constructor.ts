import type { Uneeq } from "./Uneeq";
import type { UneeqOptions } from "./options/UneeqOptions";

export interface UneeqConstructor {
  new (options: UneeqOptions): Uneeq;
}
