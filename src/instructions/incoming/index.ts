import { InMediaInstruction } from './InMediaInstruction';
import { InWeegoInstruction } from './InWeegoInstruction';

export const instructions = {
  media: new InMediaInstruction(),
  weego: new InWeegoInstruction(),
};
