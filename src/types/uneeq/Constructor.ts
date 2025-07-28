/**
 * Constructor interface for creating Uneeq instances.
 */
import type { Uneeq } from "./Uneeq";
import type { UneeqOptions } from "./options/UneeqOptions";

export interface UneeqConstructor {
  /**
   * Creates a new Uneeq instance.
   * @param options Configuration options for the Uneeq instance.
   */
  new (options: UneeqOptions): Uneeq;
}
